// /app/admin/layout.jsx
"use client";

import AdminProtectedRoute from "../components/adminprotectedroute";
import PropTypes from "prop-types";

export default function AdminLayout({ children }) {
  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
}
AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};