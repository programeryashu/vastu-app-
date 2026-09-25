# Vastu Compass — Run & Test Guide

## Web preview (desktop browser)

Server: `node serve.js` on **http://localhost:3010** (serves `dist/` from disk; no restart needed after re-export).

Rebuild web export after changing source files:

```bash
cd "C:\Users\yasha\Music\vastu app\VastuCompass"
npx expo export --platform web
```

If the server is dead (Freebuff restart kills background processes), respawn detached:

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory 'C:\Users\yasha\Music\vastu app\VastuCompass' -RedirectStandardOutput 'C:\Users\yasha\Music\vastu app\VastuCompass\.freebuff\preview.log' -RedirectStandardError 'C:\Users\yasha\Music\vastu app\VastuCompass\.freebuff\preview.log.err' -WindowStyle Hidden -PassThru).Id"
```

(PowerShell often times out but DOES spawn — verify with `netstat -ano | grep ":3010.*LISTEN"` and `curl http://localhost:3010` → expect HTTP 200.)

## Test compass on a real phone (Expo Go)

1. On the PC, in `VastuCompass/` run: `npx expo start` (interactive Metro — run it yourself in your own terminal; keep it open).
2. Install **Expo Go** on the phone (Play Store / App Store).
3. Phone on the **same Wi-Fi** as the PC → scan the QR code from the terminal.
   - LAN fails? Use `npx expo start --tunnel` and scan again.
4. Open the **Compass** tab → grant location permission when prompted.
5. Expected:
   - Green **Active** pill + sublabel "Sensor-fused heading (GPS + magnetometer)".
   - Accuracy badge High/Med; if **Low**, wave the phone in a figure-eight until it improves.
   - Rotation matches the phone's built-in compass app (sanity-check all 8 directions).
6. Deny flow: pill shows **No Access** with an "Allow Location Access" card; permanently denied → "Open Settings". GPS off → **GPS Off** card with Retry.
7. In a **production build** (APK/IPA/PWA), a device without a heading sensor shows **No Sensor** — simulation never ships.

## Health checks

- `curl http://localhost:3010` → `200`
- Compass tab in browser → pill reads **No Sensor** on desktop (correct: no magnetometer; production bundle disables simulation).
- `npx expo-doctor` (in `VastuCompass/`) → 21/21 checks pass.
