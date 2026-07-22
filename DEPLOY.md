# Deploy Runbook — Gayatri Lactation Care (Tencent VPS)

> **Audience: an AI agent (Claude Code) running on the VPS.** Follow the phases **in order**. After each phase run its **Verify** block and do not proceed until it passes. Anything in `<ANGLE_BRACKETS>` is a value you must substitute. Report the final Verify results back to the human.

**Target stack (decided):** Ubuntu 22.04/24.04 · PostgreSQL 16 via **Docker Compose** · **Nginx** reverse proxy on port **80** (no domain yet — access via `http://<VPS_PUBLIC_IP>`) · app kept alive by **systemd**. HTTPS/domain is deferred (see Phase 11).

**App facts (do not guess — these are from the repo):**
- Next.js 15 + React 19, runs with `npm start` (`next start`) on port **3000**.
- Postgres from `compose.yaml`: user `gayatri`, db `gayatri`, container `gayatri-lactation-db`, host port `5435` → container `5432`.
- Env keys: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `UPLOAD_DIR`, `APP_URL`, `GEMINI_API_KEY` (optional), and for production behind a proxy **`AUTH_TRUST_HOST=true` (required)**.
- Uploads (`UPLOAD_DIR`) live **outside** the repo; video cap **500 MB**, PDF **20 MB**. Files stream through gated routes `/api/video/[moduleId]` & `/api/material/[id]`.
- `.env` and `/uploads/` are gitignored — you create `.env` by hand on the VPS.

**Assumptions:** you have root (or passwordless `sudo`). Commands below assume **root**. If you run as a sudo user, prefix with `sudo`. Note the security callouts — running the app as root is acceptable for a single-purpose VPS but hardening is noted in Phase 13.

---

## Phase 0 — Gather inputs

Collect / decide these before starting:

- `<VPS_PUBLIC_IP>` — the server's public IP. Find it: `curl -s ifconfig.me`.
- `<ADMIN_EMAIL>` — admin login email (e.g. `admin@gayatri.local`).
- `<ADMIN_PASSWORD>` — a **strong** admin password (you will type this at `/masuk`). Do not reuse the placeholder.
- `<DB_PASSWORD>` — a strong Postgres password (replaces the dev default `gayatri_dev`).
- Repo URL: `https://github.com/ryanrizki/gayatri-lactation-care.git` (if private, have a GitHub token or deploy key ready).

**Verify:** you can print the IP:
```bash
curl -s ifconfig.me; echo
```

---

## Phase 1 — System prep

```bash
apt-get update && apt-get -y upgrade
apt-get install -y ca-certificates curl gnupg git ufw
```

Firewall — allow SSH + HTTP only (do this carefully so you don't lock yourself out):
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable
ufw status
```

**Verify:** `ufw status` shows `22/OpenSSH` and `80` = ALLOW. Postgres port 5435 is **not** opened (it stays localhost-only).

---

## Phase 2 — Install Docker (for Postgres)

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
```

> If this is Debian (not Ubuntu), replace `ubuntu` with `debian` in both the gpg URL and the repo line.

**Verify:**
```bash
docker --version && docker compose version
```
Both print versions.

---

## Phase 3 — Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

**Verify:**
```bash
node --version   # v20.x
npm --version
```

---

## Phase 4 — Install Nginx

```bash
apt-get install -y nginx
systemctl enable --now nginx
```

**Verify:** `systemctl is-active nginx` → `active`. Visiting `http://<VPS_PUBLIC_IP>` shows the default nginx page (replaced in Phase 11).

---

## Phase 5 — Clone the repo

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/ryanrizki/gayatri-lactation-care.git gayatri
cd /var/www/gayatri
```

> Private repo? Use `https://<TOKEN>@github.com/ryanrizki/gayatri-lactation-care.git` or set up an SSH deploy key first.

**Verify:** `ls /var/www/gayatri/package.json` exists.

---

## Phase 6 — Start Postgres (Docker Compose) — hardened

Before first launch, (a) bind Postgres to **localhost only** so it is not exposed publicly, and (b) set a strong DB password. Edit `compose.yaml`:

- Change the port line from `- "5435:5432"` to **`- "127.0.0.1:5435:5432"`**.
- Change `POSTGRES_PASSWORD: gayatri_dev` to **`POSTGRES_PASSWORD: <DB_PASSWORD>`**.

Apply the edits (or do them with an editor):
```bash
cd /var/www/gayatri
sed -i 's|- "5435:5432"|- "127.0.0.1:5435:5432"|' compose.yaml
sed -i 's|POSTGRES_PASSWORD: gayatri_dev|POSTGRES_PASSWORD: <DB_PASSWORD>|' compose.yaml
docker compose up -d
```

**Verify:**
```bash
docker compose ps                          # gayatri-lactation-db = running/healthy
docker exec gayatri-lactation-db pg_isready -U gayatri   # accepting connections
ss -tlnp | grep 5435                        # bound to 127.0.0.1:5435, NOT 0.0.0.0
```

---

## Phase 7 — Create the production `.env`

Generate the auth secret and write `.env` in the repo root. **Substitute** `<DB_PASSWORD>`, `<ADMIN_EMAIL>`, `<ADMIN_PASSWORD>`, `<VPS_PUBLIC_IP>`.

```bash
cd /var/www/gayatri
AUTH_SECRET_VALUE="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
mkdir -p /var/www/gayatri/uploads

cat > .env <<EOF
DATABASE_URL="postgresql://gayatri:<DB_PASSWORD>@localhost:5435/gayatri?schema=public"
AUTH_SECRET="${AUTH_SECRET_VALUE}"
AUTH_TRUST_HOST=true
ADMIN_EMAIL="<ADMIN_EMAIL>"
ADMIN_PASSWORD="<ADMIN_PASSWORD>"
UPLOAD_DIR="/var/www/gayatri/uploads"
APP_URL="http://<VPS_PUBLIC_IP>"
# Optional — Minbee AI assistant. Without it /api/chat falls back gracefully.
# GEMINI_API_KEY="<YOUR_GEMINI_KEY>"
EOF

chmod 600 .env
```

> **`AUTH_TRUST_HOST=true` is required** behind nginx — without it `/api/auth/*` returns `UntrustedHost` and login breaks. `UPLOAD_DIR` must be an absolute path outside `public/` and writable by the process; it must be included in backups.

**Verify:** `.env` exists, `DATABASE_URL` has your real `<DB_PASSWORD>`, and `AUTH_SECRET` is a long base64 string:
```bash
grep -E "^(AUTH_TRUST_HOST|UPLOAD_DIR)=" .env && test -n "$AUTH_SECRET_VALUE" && echo "secret generated"
```

---

## Phase 8 — Install deps, migrate schema, generate client, seed

```bash
cd /var/www/gayatri
npm ci                          # clean install (postinstall runs prisma generate)
npx prisma migrate deploy       # apply committed migrations to the DB (prisma auto-loads .env)
npx prisma generate             # ensure client is generated
npx prisma db seed              # seed services/challenges/settings (loads .env via prisma)
npm run db:seed-admin           # create the admin from ADMIN_EMAIL/ADMIN_PASSWORD (--env-file=.env)
```

> Use `npx prisma db seed` (not `npm run db:seed` directly) — it runs through the Prisma CLI which loads `.env`, so `DATABASE_URL` is available. `db:seed-admin` already loads `.env` itself.

**Verify:**
```bash
docker exec gayatri-lactation-db psql -U gayatri -d gayatri -c "SELECT COUNT(*) FROM \"Service\";"   # >= 4
docker exec gayatri-lactation-db psql -U gayatri -d gayatri -c "SELECT email, role FROM \"User\" WHERE role='ADMIN';"  # your admin
```

---

## Phase 9 — Build the app

```bash
cd /var/www/gayatri
npm run build
```

**Verify:** build finishes without errors and `.next/` exists (`ls .next/BUILD_ID`). A quick smoke run (optional, Ctrl-C after checking):
```bash
npm start &                     # starts on :3000
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/        # 200
kill %1
```

---

## Phase 10 — Run as a systemd service

Create the unit:
```bash
cat > /etc/systemd/system/gayatri.service <<'EOF'
[Unit]
Description=Gayatri Lactation Care (Next.js)
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/var/www/gayatri
ExecStart=/usr/bin/npm start
Environment=NODE_ENV=production
Environment=PORT=3000
Restart=always
RestartSec=5
# .env in WorkingDirectory is loaded automatically by Next.js at runtime.

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now gayatri
```

**Verify:**
```bash
systemctl status gayatri --no-pager          # active (running)
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/    # 200
journalctl -u gayatri -n 30 --no-pager       # no crash loop
```

---

## Phase 11 — Nginx reverse proxy (port 80 → 3000)

The upload streaming design needs large-body + disabled request buffering, and video Range streaming needs disabled response buffering. Write the site config:

```bash
cat > /etc/nginx/sites-available/gayatri <<'EOF'
server {
    listen 80;
    server_name _;               # replace with your domain later

    # Video cap is 500 MB — allow headroom so uploads aren't rejected with 413.
    client_max_body_size 550M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Stream large uploads through instead of buffering the whole body.
        proxy_request_buffering off;
        # Stream video/material responses (HTTP Range) without buffering.
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/gayatri /etc/nginx/sites-enabled/gayatri
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

**Verify (from your workstation or the VPS):**
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://<VPS_PUBLIC_IP>/         # 200
curl -s -o /dev/null -w "%{http_code}\n" http://<VPS_PUBLIC_IP>/layanan  # 200
```

> **Adding a domain + HTTPS later:** point the domain's A record to `<VPS_PUBLIC_IP>`, set `server_name your.domain;`, then `apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d your.domain`. Update `APP_URL` in `.env` to `https://your.domain` and `systemctl restart gayatri`. `AUTH_TRUST_HOST=true` is already set.

---

## Phase 12 — Full end-to-end verification

Do these against `http://<VPS_PUBLIC_IP>`:

1. **Public site:** `/` (Edu Hub) and `/layanan` load. Open a class service `/layanan/<id>` — a preview module (if seeded) shows a playable `<video>`; the "Beli Kelas" button is present.
2. **Admin login:** go to `/masuk`, log in with `<ADMIN_EMAIL>` / `<ADMIN_PASSWORD>`, then open `/admin` — dashboard loads (not redirected to `/masuk`).
3. **Admin CRUD:** open `/admin/layanan`, `/admin/enrollment`, `/admin/pengaturan` — all render.
4. **Upload (the streaming path):** in a class service's module builder (`/admin/layanan/<id>/modul/...`), upload a small PDF and a small video — both succeed (no 413/502). Confirms `client_max_body_size` + proxy buffering are correct.
5. **Gated serving:** the uploaded video plays for the admin; a logged-out visitor hitting a non-preview `/api/video/<moduleId>` gets **403**.

**Report** to the human: each of the 5 checks pass/fail, plus `systemctl status gayatri` and `docker compose ps` output.

---

## Phase 13 — Backups & hardening (recommended)

- **Database backup (cron, daily):**
  ```bash
  cat > /etc/cron.daily/gayatri-db-backup <<'EOF'
  #!/bin/sh
  mkdir -p /var/backups/gayatri
  docker exec gayatri-lactation-db pg_dump -U gayatri gayatri | gzip > /var/backups/gayatri/db-$(date +%F).sql.gz
  find /var/backups/gayatri -name 'db-*.sql.gz' -mtime +14 -delete
  EOF
  chmod +x /etc/cron.daily/gayatri-db-backup
  ```
- **Uploads backup:** include `/var/www/gayatri/uploads` in your backup routine (rsync/snapshot). These files are **not** in git.
- **Run as non-root (optional hardening):** create a system user, `chown -R` the app dir + uploads to it, add it to the `docker` group, and set `User=` / `Group=` in the systemd unit. (Docker group ≈ root, so weigh this.)
- **Change default admin password** after first login if you used a weak one.
- **Security backlog (from the app README, do before real traffic):** rate limiting on login/register, self-serve password reset.

---

## Update / redeploy (after new commits land on `main`)

```bash
cd /var/www/gayatri
git pull origin main
npm ci
npx prisma migrate deploy        # apply any new migrations
npm run build
systemctl restart gayatri
systemctl status gayatri --no-pager
```

---

## Troubleshooting

| Symptom | Cause → Fix |
|---------|-------------|
| `/api/auth/*` 500, login fails, log says `UntrustedHost` | `AUTH_TRUST_HOST=true` missing in `.env` → add it, `systemctl restart gayatri`. |
| `502 Bad Gateway` from nginx | App not running on :3000 → `systemctl status gayatri`, `journalctl -u gayatri -n 50`. |
| Upload fails with `413 Request Entity Too Large` | nginx `client_max_body_size` too low → confirm `550M` in the site config, `nginx -t && systemctl reload nginx`. |
| Upload hangs / times out on big video | `proxy_request_buffering off` + long `proxy_read_timeout` missing → re-check Phase 11 config. |
| App can't connect to DB (Prisma connection error) | Postgres down or wrong `DATABASE_URL` → `docker compose ps`, `docker exec gayatri-lactation-db pg_isready -U gayatri`, verify `<DB_PASSWORD>` matches in both `compose.yaml` and `.env`. |
| `prisma db seed` / migrate says `DATABASE_URL not found` | Run from `/var/www/gayatri` (prisma loads `.env` from cwd), or ensure `.env` exists there. |
| Port 3000 already in use | Another process → `ss -tlnp | grep 3000`, stop it, or set a different `PORT=` in the systemd unit **and** nginx `proxy_pass`. |
| Video won't seek / stalls | `proxy_buffering off` missing (needed for HTTP Range) → re-check Phase 11. |
| Postgres reachable from internet | compose port not bound to localhost → set `- "127.0.0.1:5435:5432"`, `docker compose up -d`, and confirm `ufw` does not allow 5435. |
