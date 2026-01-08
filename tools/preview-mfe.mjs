import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 4300;

function mountSpa(route, distDir) {
  // 1) Static: اول باید استاتیک بیاد تا remoteEntry.js و assets درست سرو بشن
  app.use(route, express.static(distDir, { fallthrough: true }));

  // 2) Fallback: فقط برای مسیرهایی که فایل نیستند (پسوند ندارند)
  app.get(`${route}/*`, (req, res, next) => {
    if (path.extname(req.path)) return next(); // .js/.css/.map/... => به static فرصت بده
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// shell
mountSpa("/", path.join(root, "dist/apps/shell"));

// remotes
mountSpa("/remotes/app-one", path.join(root, "dist/apps/app-one"));
mountSpa("/remotes/app-two", path.join(root, "dist/apps/app-two"));
mountSpa("/remotes/admission", path.join(root, "dist/apps/admission"));
mountSpa("/remotes/insurance", path.join(root, "dist/apps/insurance"));
mountSpa("/remotes/ops", path.join(root, "dist/apps/ops"));

app.listen(PORT, () => console.log(`MFE preview: http://localhost:${PORT}`));
