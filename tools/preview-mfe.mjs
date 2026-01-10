import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createMockApiRouter } from "./mock-api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 4300;

app.use(express.json());

// ✅ Mock API برای preview (با env روشن/خاموش)
if (process.env.MOCK_API === "1") {
  app.use("/api/mock", createMockApiRouter());
  console.log("Mock API enabled at /api/mock");
}

function mountSpa(route, distDir) {
  // 1) Static اول
  app.use(route, express.static(distDir, { fallthrough: true }));

  // 2) Fallback فقط برای مسیرهای بدون پسوند (یعنی فایل نیستند)
  app.get(`${route}/*`, (req, res, next) => {
    if (path.extname(req.path)) return next(); // .js/.css/.map/... => fallback نکن
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

// ✅ fallback کلی: فقط برای routeهای SPA shell، نه برای /api و /remotes
app.get(/^\/(?!api\/|remotes\/).*/, (req, res) => {
  res.sendFile(path.join(root, "dist/apps/shell/index.html"));
});

app.listen(PORT, () => console.log(`MFE preview: http://localhost:${PORT}`));
