// /app/admin/layout.jsx
"use client";

import AdminProtectedRoute from "../components/adminprotectedroute";

export default function AdminLayout({ children }) {
  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
}