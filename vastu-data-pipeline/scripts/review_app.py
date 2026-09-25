#!/usr/bin/env python3
"""Feature 12 — local admin review UI (Flask, binds 127.0.0.1 only).

Run:  python scripts/review_app.py     →  http://127.0.0.1:3101

Actions: approve / reject / edit fields / merge duplicate into canonical /
mark conflict / add note / change confidence. Every action is logged to
review_log. Original source text + page are always shown next to each claim.
"""

from __future__ import annotations

import html
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from flask import Flask, redirect, render_template_string, request, url_for  # noqa: E402

from vdp import db, paths  # noqa: E402
from vdp.textutils import combined_similarity  # noqa: E402

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

CSS = """
body{font-family:system-ui,Segoe UI,Roboto,sans-serif;margin:0;background:#FAF8F5;color:#3B3226}
header{background:#2D3A2E;color:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center}
header a{color:#C9A96E;text-decoration:none;margin-left:14px}
main{max-width:1080px;margin:0 auto;padding:18px}
.card{background:#fff;border:1px solid #E5DCC9;border-radius:10px;padding:14px 16px;margin-bottom:12px}
.badge{display:inline-block;padding:2px 9px;border-radius:10px;font-size:11px;font-weight:700;margin-right:6px}
.b-unverified{background:#EEE6D8;color:#6B5E45}.b-approved{background:#E8F5EC;color:#2F7D45}
.b-rejected{background:#FDECEC;color:#B04040}.b-duplicate{background:#FFF0E6;color:#C05621}
.b-conflict{background:#FDE7F0;color:#A03060}.b-variant{background:#EFEAFB;color:#5B43A8}
blockquote{background:#FAF6EE;border-left:3px solid #C9A96E;margin:8px 0;padding:6px 10px;font-size:13px}
.muted{color:#8B8272;font-size:12px}
form.inline{display:inline}
button{cursor:pointer;border:1px solid #B8A88A;background:#5D4E37;color:#fff;border-radius:6px;padding:4px 10px;font-size:12px}
button.ghost{background:#fff;color:#5D4E37}
input,select,textarea{font-size:13px;padding:4px 6px;border:1px solid #C8BB9E;border-radius:5px}
textarea{width:100%}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
dl{display:grid;grid-template-columns:130px 1fr;gap:4px 10px;font-size:13px}
dt{color:#8B8272}dd{margin:0}
.score{font-size:11px;color:#8B8272}
"""

BASE = """
<!doctype html><html><head><meta charset="utf-8"><title>Vastu Review</title>
<style>{{ css }}</style></head><body>
<header><div><b>Vastu Data Review</b> <span class="muted" style="color:#9FB0A0">local-only</span></div>
<div><a href="{{ url_for('index') }}">All</a>
<a href="{{ url_for('index', status='unverified') }}">Unverified</a>
<a href="{{ url_for('index', status='duplicate') }}">Duplicates</a>
<a href="{{ url_for('index', status='conflict') }}">Conflicts</a>
<a href="{{ url_for('index', status='rejected') }}">Rejected</a></div></header>
<main>{{ body|safe }}</main></body></html>
"""


def render_page(inner_tpl: str, **ctx):
    """Two-pass render: inner body first, then wrap in the base shell."""
    inner = render_template_string(inner_tpl, **ctx)
    return render_template_string(BASE, body=inner, css=CSS)

LIST_TPL = """
<h2>Facts ({{ facts|length }})</h2>
<form class="filters" method="get">
  <input name="q" value="{{ q or '' }}" placeholder="search claim/topic…">
  <select name="status">
    <option value="">any status</option>
    {% for s in statuses %}<option value="{{ s }}" {{ 'selected' if s==status }}>{{ s }}</option>{% endfor %}
  </select>
  <select name="source">
    <option value="">any source</option>
    {% for s in sources %}<option value="{{ s }}" {{ 'selected' if s==src }}>{{ s }}</option>{% endfor %}
  </select>
  <button type="submit">Filter</button>
</form>
{% for f in facts %}
<div class="card">
  <div>
    <span class="badge b-{{ f.verification_status }}">{{ f.verification_status }}</span>
    <b>{{ f.id }}</b> <span class="muted">{{ f.source_id }} · {{ f.topic or '—' }} · {{ f.direction or '—' }} · {{ f.room or '—' }}</span>
  </div>
  <div>{{ f.claim[:260] }}{% if f.claim|length > 260 %}…{% endif %}</div>
  <div class="muted">page {{ f.page or '—' }} · {{ f.chapter or 'no chapter' }}
    {% if f.ocr_confidence %} · OCR {{ (f.ocr_confidence * 100)|round(0)|int }}%{% endif %}
    {% if f.duplicate_of %} · duplicate of {{ f.duplicate_of }} ({{ f.similarity_score }}){% endif %}</div>
  <div style="margin-top:8px">
    <a class="muted" href="{{ url_for('fact_detail', fact_id=f.id) }}">inspect / edit →</a>
  </div>
</div>
{% else %}<p class="muted">No facts match. Run the pipeline first.</p>{% endfor %}
"""

DETAIL_TPL = """
<h2>{{ f.id }}</h2>
<div class="card">
  <dl>
    <dt>status</dt><dd><span class="badge b-{{ f.verification_status }}">{{ f.verification_status }}</span>
      {% if f.record_type != 'source_fact' %}<span class="badge b-variant">{{ f.record_type }}</span>{% endif %}</dd>
    <dt>topic</dt><dd>{{ f.topic or '—' }} / {{ f.subcategory or '—' }}</dd>
    <dt>direction</dt><dd>{{ f.direction or '—' }}</dd>
    <dt>room</dt><dd>{{ f.room or '—' }}</dd>
    <dt>element / planet</dt><dd>{{ f.element or '—' }} / {{ f.planet or '—' }}</dd>
    <dt>confidence</dt><dd>{{ f.confidence }}</dd>
    <dt>source</dt><dd>{{ f.title or f.source_id }} ({{ f.author or 'n/a' }}) · {{ f.chapter or '—' }} · <b>page {{ f.page or '—' }}</b> · chunk {{ f.chunk_id or '—' }}</dd>
    {% if f.ocr_confidence %}<dt>OCR conf.</dt><dd>{{ (f.ocr_confidence * 100)|round(0)|int }}%</dd>{% endif %}
    {% if f.interpretation_note %}<dt>interpretation</dt><dd class="muted">{{ f.interpretation_note }}</dd>{% endif %}
    {% if f.duplicate_of %}<dt>duplicate of</dt><dd>{{ f.duplicate_of }} (score {{ f.similarity_score }})</dd>{% endif %}
    {% if f.review_notes %}<dt>notes</dt><dd>{{ f.review_notes }}</dd>{% endif %}
  </dl>
  <div><b>Claim (verbatim):</b><blockquote>{{ f.claim }}</blockquote></div>
  <div><b>Original source text:</b><blockquote>{{ f.original_text }}</blockquote></div>
  {% if f.description %}<div><b>Description:</b><blockquote>{{ f.description }}</blockquote></div>{% endif %}
</div>

<div class="card">
  <h3>Actions</h3>
  <form class="inline" method="post" action="{{ url_for('action') }}">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="approve">
    <button>✓ Approve</button></form>
  <form class="inline" method="post" action="{{ url_for('action') }}">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="reject">
    <button class="ghost">✗ Reject</button></form>
  <form class="inline" method="post" action="{{ url_for('action') }}">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="mark_conflict">
    <button class="ghost">⚑ Mark conflict</button></form>
</div>

<div class="card">
  <h3>Edit fields</h3>
  <form method="post" action="{{ url_for('action') }}">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="edit">
    <dl>
      <dt>topic</dt><dd><input name="topic" value="{{ f.topic }}"></dd>
      <dt>subcategory</dt><dd><input name="subcategory" value="{{ f.subcategory }}"></dd>
      <dt>direction</dt><dd><input name="direction" value="{{ f.direction }}"></dd>
      <dt>room</dt><dd><input name="room" value="{{ f.room }}"></dd>
      <dt>element</dt><dd><input name="element" value="{{ f.element }}"></dd>
      <dt>planet</dt><dd><input name="planet" value="{{ f.planet }}"></dd>
      <dt>remedy</dt><dd><input name="remedy" value="{{ f.remedy }}"></dd>
      <dt>description</dt><dd><textarea name="description" rows="3">{{ f.description }}</textarea></dd>
    </dl>
    <button type="submit">Save edits</button>
  </form>
</div>

<div class="card">
  <h3>Confidence & notes</h3>
  <form method="post" action="{{ url_for('action') }}">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="confidence">
    <label>confidence (0–1): <input name="confidence" value="{{ f.confidence }}" size="6"></label>
    <button type="submit">Set</button>
  </form>
  <form method="post" action="{{ url_for('action') }}" style="margin-top:8px">
    <input type="hidden" name="fact_id" value="{{ f.id }}"><input type="hidden" name="action" value="note">
    <textarea name="note" rows="2" placeholder="reviewer note…">{{ f.review_notes }}</textarea>
    <button type="submit">Save note</button>
  </form>
</div>

{% if similar %}
<div class="card">
  <h3>Merge / duplicates (similarity ≥ 0.6)</h3>
  {% for s in similar %}
  <div>
    <form class="inline" method="post" action="{{ url_for('action') }}">
      <input type="hidden" name="fact_id" value="{{ s.id }}">
      <input type="hidden" name="action" value="merge"><input type="hidden" name="into" value="{{ f.id }}">
      <button class="ghost">merge into this</button></form>
    <b>{{ s.id }}</b> <span class="score">score {{ s.score }}</span> — {{ s.claim[:160] }}…
  </div>
  {% endfor %}
</div>
{% endif %}

<p><a href="{{ url_for('index') }}">← back</a></p>
"""


def _facts(where: str = "", args: tuple = ()):
    with db.connect() as conn:
        db.init_db(conn)
        rows = conn.execute(
            "SELECT f.*, s.title, s.author FROM facts f "
            "LEFT JOIN sources s ON s.source_id = f.source_id " + where,
            args,
        ).fetchall()
    return [dict(r) for r in rows]


def _one(fact_id: str) -> dict | None:
    rows = _facts("WHERE f.id = ?", (fact_id,))
    return rows[0] if rows else None


@app.route("/")
def index():
    q = request.args.get("q", "").strip()
    status = request.args.get("status", "").strip()
    source = request.args.get("source", "").strip()
    sql, args = "WHERE 1=1", []
    if q:
        sql += " AND (f.claim LIKE ? OR f.topic LIKE ? OR f.id LIKE ?)"
        args += [f"%{q}%", f"%{q}%", f"%{q}%"]
    if status:
        sql += " AND f.verification_status = ?"
        args.append(status)
    if source:
        sql += " AND f.source_id = ?"
        args.append(source)
    facts = _facts(sql + " ORDER BY f.id LIMIT 400", tuple(args))
    with db.connect() as conn:
        sources = [r["source_id"] for r in conn.execute("SELECT source_id FROM sources ORDER BY 1")]
    statuses = ["unverified", "approved", "rejected", "duplicate", "conflict", "variant"]
    return render_page(LIST_TPL, facts=facts,
                       q=q, status=status, src=source,
                       sources=sources, statuses=statuses)


@app.route("/fact/<path:fact_id>")
def fact_detail(fact_id: str):
    f = _one(fact_id)
    if not f:
        return "not found", 404
    similar = []
    for other in _facts("WHERE f.id != ?", (fact_id,)):
        score = combined_similarity(f["claim"], other["claim"])
        if score >= 0.6:
            similar.append({**other, "score": round(score, 3)})
    similar.sort(key=lambda x: -x["score"])
    similar = similar[:8]
    return render_page(DETAIL_TPL, f=f, similar=similar)


@app.route("/action", methods=["POST"])
def action():
    fid = request.form["fact_id"]
    act = request.form["action"]
    f = _one(fid)
    if not f:
        return "fact not found", 404
    with db.connect() as conn:
        db.init_db(conn)
        if act == "approve":
            conn.execute("UPDATE facts SET verification_status='approved', duplicate_of=NULL, "
                         "similarity_score=NULL, reviewed_at=datetime('now') WHERE id=?", (fid,))
            db.log_action(conn, fid, "approve", by="admin")
        elif act == "reject":
            conn.execute("UPDATE facts SET verification_status='rejected', reviewed_at=datetime('now') WHERE id=?", (fid,))
            db.log_action(conn, fid, "reject", by="admin")
        elif act == "mark_conflict":
            conn.execute("UPDATE facts SET verification_status='conflict', reviewed_at=datetime('now') WHERE id=?", (fid,))
            db.log_action(conn, fid, "mark_conflict", by="admin")
        elif act == "merge":
            into = request.form.get("into", "")
            if into and into != fid:
                conn.execute("UPDATE facts SET verification_status='duplicate', duplicate_of=?, "
                             "canonical_record_id=?, reviewed_at=datetime('now') WHERE id=?", (into, into, fid))
                db.log_action(conn, fid, "merge", old="", new=f"into {into}", by="admin")
        elif act == "edit":
            fields = ["topic", "subcategory", "direction", "room", "element", "planet", "remedy", "description"]
            for fld in fields:
                nv = request.form.get(fld, "")
                if nv != (f.get(fld) or ""):
                    conn.execute(f"UPDATE facts SET {fld}=? WHERE id=?", (nv, fid))
                    db.log_action(conn, fid, "edit", field=fld,
                                  old=f.get(fld) or "", new=nv, by="admin")
        elif act == "confidence":
            try:
                val = max(0.0, min(1.0, float(request.form.get("confidence", "0"))))
                conn.execute("UPDATE facts SET confidence=? WHERE id=?", (val, fid))
                db.log_action(conn, fid, "confidence", field="confidence",
                              old=str(f.get("confidence")), new=str(val), by="admin")
            except ValueError:
                pass
        elif act == "note":
            note = request.form.get("note", "")
            conn.execute("UPDATE facts SET review_notes=? WHERE id=?", (note, fid))
            db.log_action(conn, fid, "note", field="review_notes",
                          old=f.get("review_notes") or "", new=note, by="admin")
    return redirect(url_for("fact_detail", fact_id=fid))


def main() -> None:
    settings = paths.load_settings()
    paths.ensure_dirs(settings)
    with db.connect() as conn:
        db.init_db(conn)
    host = settings["review"]["host"]
    port = int(settings["review"]["port"])
    print(f"Review UI: http://{host}:{port}  (Ctrl+C to stop)")
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
