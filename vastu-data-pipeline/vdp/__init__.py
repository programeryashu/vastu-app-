"""vdp — Vastu data extraction & dataset-generation pipeline (local-first).

Principles:
  * Local-first: all staging in SQLite, all files on disk.
  * Traceable: every record carries source_id / chapter / page / original_text.
  * Never invent: classification only structures what the source text says.
"""

__version__ = "1.0.0"
