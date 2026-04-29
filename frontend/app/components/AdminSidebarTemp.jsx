"use client";

import { useRouter } from "next/navigation";

import { useUser } from "../contexts/authContext";

export default function AdminSidebar() {
  const router = useRouter();
  const { logout } = useUser();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="w-56 fixed left-0 top-0 h-screen bg-gray-900 text-white px-4 py-5 border-r border-gray-800">
      <h1 className="text-lg font-semibold mb-6">Admin Panel</h1>

      <ul className="space-y-3 text-sm">
        <li>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full text-left cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          >
            Dashboard
          </button>
        </li>

        <li>
          <button
            onClick={() => router.push("/admin/complaints")}
            className="w-full text-left cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          >
            Complaints
          </button>
        </li>

        <li>
          <button
            onClick={() => router.push("/admin/approveemployee")}
            className="w-full text-left cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          >
            Approve Employee
          </button>
        </li>

        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-red-400 transition"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
