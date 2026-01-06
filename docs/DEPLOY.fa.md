# راهنمای استقرار تک‌مبدا

این راهنما برای انتشار تک‌مبدا (بدون CORS) طراحی شده است؛ شِل روی `/` و هر ریموت روی
`/remotes/<remote>/` سرو می‌شود.

## ساخت همه برنامه‌ها

```bash
pnpm build:mfe
```

## بسته‌بندی نهایی برای استقرار

```bash
pnpm package:mfe
```

خروجی نهایی در مسیر زیر تولید می‌شود:

```
dist/deploy/
```

ساختار کلی:

```
dist/deploy/
  index.html
  assets/...
  remotes/
    app-one/
    app-two/
    insurance/
    admission/
    ops/
  config/
    runtime.json
  health.json
```

## اجرای هدف Nx

```bash
nx run shell:package
```

## پیشنهاد پیکربندی Nginx (History Fallback)

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/mfe/dist/deploy;

  location /remotes/ {
    try_files $uri $uri/ =404;
  }

  location /config/runtime.json {
    add_header Cache-Control "no-cache, must-revalidate";
    try_files $uri =404;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

## توصیه‌های کش

- `remoteEntry.js` و `config/runtime.json`: بدون کش یا `must-revalidate`
- فایل‌های هش‌دار در `assets/`: کش بلندمدت با `immutable`
