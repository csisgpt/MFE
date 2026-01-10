import express from "express";

function paginate(items, page, pageSize) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
  const start = (safePage - 1) * safePageSize;
  const data = items.slice(start, start + safePageSize);

  return { data, total: items.length, page: safePage, pageSize: safePageSize };
}

function requireAuth(req, res) {
  if (!req.headers.authorization) {
    res.status(401).json({ message: "توکن موجود نیست" });
    return false;
  }
  return true;
}

export function createMockApiRouter() {
  const r = express.Router();

  // --- DB (از mock-db.ts الهام گرفته شده) ---
  const personnelUsers = [
    {
      id: "کاربر-۱۰۰۱",
      fullName: "مریم هاشمی",
      department: "منابع انسانی",
      role: "کارشناس ارشد",
      status: "فعال",
      phone: "۰۹۱۲۳۴۵۶۷۸۹",
      createdAt: "۱۴۰۳/۰۱/۱۵",
    },
    {
      id: "کاربر-۱۰۰۲",
      fullName: "علیرضا کاظمی",
      department: "فناوری اطلاعات",
      role: "مدیر سیستم",
      status: "فعال",
      phone: "۰۹۱۲۹۸۷۶۵۴۳",
      createdAt: "۱۴۰۳/۰۱/۰۹",
    },
    {
      id: "کاربر-۱۰۰۳",
      fullName: "پریسا صادقی",
      department: "عملیات",
      role: "سرپرست تیم",
      status: "غیرفعال",
      phone: "۰۹۱۰۴۵۶۷۸۱۲",
      createdAt: "۱۴۰۲/۱۲/۲۸",
    },
    {
      id: "کاربر-۱۰۰۴",
      fullName: "حسین باقری",
      department: "مالی",
      role: "تحلیل‌گر",
      status: "فعال",
      phone: "۰۹۱۳۷۵۶۴۹۲۳",
      createdAt: "۱۴۰۲/۱۲/۲۰",
    },
    {
      id: "کاربر-۱۰۰۵",
      fullName: "ریحانه موسوی",
      department: "پشتیبانی",
      role: "کارشناس پشتیبانی",
      status: "تعلیق",
      phone: "۰۹۱۹۱۲۳۴۵۶۷",
      createdAt: "۱۴۰۲/۱۲/۰۳",
    },
  ];

  const serviceRequests = [
    {
      id: "درخواست-۲۰۰۱",
      title: "راه‌اندازی دسترسی جدید شبکه",
      requester: "سارا احمدی",
      assignee: "علیرضا کاظمی",
      status: "در انتظار",
      priority: "بالا",
      createdAt: "۱۴۰۳/۰۱/۱۸",
    },
    {
      id: "درخواست-۲۰۰۲",
      title: "بازبینی سطوح دسترسی مالی",
      requester: "حسین باقری",
      assignee: "مریم هاشمی",
      status: "در حال انجام",
      priority: "متوسط",
      createdAt: "۱۴۰۳/۰۱/۱۶",
    },
    {
      id: "درخواست-۲۰۰۳",
      title: "تهیه گزارش ظرفیت مرکز تماس",
      requester: "ریحانه موسوی",
      assignee: "پریسا صادقی",
      status: "تکمیل‌شده",
      priority: "کم",
      createdAt: "۱۴۰۳/۰۱/۱۲",
    },
    {
      id: "درخواست-۲۰۰۴",
      title: "بازآموزی فرآیندهای ورود نیرو",
      requester: "مریم هاشمی",
      assignee: "سارا احمدی",
      status: "در انتظار",
      priority: "بالا",
      createdAt: "۱۴۰۳/۰۱/۰۸",
    },
  ];

  // ---- Personnel users
  r.get("/personnel/users", (req, res) => {
    if (!requireAuth(req, res)) return;
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    return res.json(paginate(personnelUsers, page, pageSize));
  });

  // ---- Requests
  r.get("/requests", (req, res) => {
    if (!requireAuth(req, res)) return;
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    return res.json(paginate(serviceRequests, page, pageSize));
  });

  // health (برای تست سریع)
  r.get("/health", (req, res) => res.json({ ok: true }));

  // fallback
  r.use((req, res) => res.status(404).json({ message: "یافت نشد" }));

  return r;
}
