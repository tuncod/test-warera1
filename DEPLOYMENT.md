# War Era 3D Alliance Network - Deployment Guide

## Files
- `/home/warera/index.html` - Main visualization file (self-contained)
- `/home/warera/start.sh` - Start script for Python HTTP server

## Quick Start

### Start the web server:
```bash
cd /home/warera
./start.sh
```
Or manually:
```bash
cd /home/warera
python3 -m http.server 8000 --bind 0.0.0.0
```

The site will be available at:
- `http://152.53.186.207:8000` (direct IP)
- `http://warera.on-development.my.id:8000` (after DNS setup)

### Keep it running (optional):
Create a systemd service for auto-start on boot:

```bash
sudo nano /etc/systemd/system/warera.service
```

Paste:
```
[Unit]
Description=War Era 3D Visualization
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/warera
ExecStart=/usr/bin/python3 -m http.server 8000 --bind 0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable warera
sudo systemctl start warera
sudo systemctl status warera
```

## Cloudflare DNS Setup

### Prerequisites:
- You have access to Cloudflare dashboard for domain `on-development.my.id`
- The server IP is `152.53.186.207`

### Steps:
1. Go to https://dash.cloudflare.com
2. Select your account/domain
3. Navigate to **DNS** > **Records**
4. Click **Add record**
5. Configure:
   - **Type:** A (or AAAA for IPv6 if needed)
   - **Name:** `warera`
   - **IPv4 address:** `152.53.186.207`
   - **Proxy status:** Proxied (orange cloud) or DNS only (grey) - proxied gives Cloudflare CDN/security
6. Click **Save**

Wait 5-10 minutes for DNS propagation, then access:
- `https://warera.on-development.my.id` (if proxied with SSL)
- `http://warera.on-development.my.id` (if DNS only)

### Optional: Custom SSL (if not using Cloudflare proxy)
If you use a different web server (nginx/apache) and need SSL, you can use Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d warera.on-development.my.id
```

## Using Nginx (Production Alternative)

Instead of Python HTTP server, install nginx:

```bash
apt update && apt install nginx -y
```

Create site config:
```bash
nano /etc/nginx/sites-available/warera
```

Content:
```
server {
    listen 80;
    server_name warera.on-development.my.id;

    root /home/warera;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable and start:
```bash
ln -s /etc/nginx/sites-available/warera /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Project Structure
```
/home/warera/
├── index.html          (main visualization)
├── start.sh            (quick start script)
└── DEPLOYMENT.md       (this file)
```

## Features Recap
- 3D interactive network of War Era countries and alliances
- Real-time data from War Era API
- Click nodes to see country details (treasury, allies, wars)
- Orbit controls (drag/zoom/rotate)
- Runs entirely in browser, no backend needed

## Troubleshooting
- **Port 8000 blocked?** Use a different port: `python3 -m http.server 8080`
- **Permission denied?** Make script executable: `chmod +x start.sh`
- **Can't access by domain?** Verify DNS record in Cloudflare, wait 5-10 min
- **API data not loading?** Check browser console (F12) for CORS or network errors
