"use client";

import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  function handleLogout(){
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem("username")
    localStorage.removeItem("is_admin")
    router.push('/')
  }

  return (
    <div className="w-56 fixed left-0 top-0 h-screen bg-gray-900 text-white px-4 py-5 border-r border-gray-800">
      
      
      <h1 className="text-lg font-semibold mb-6">
        Admin Panel
      </h1>

      
      <ul className="space-y-3 text-sm">

        <li
          className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          onClick={() => router.push("/admin/dashboard")}
        >
          Dashboard
        </li>

        <li
          className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          onClick={() => router.push("/admin/complaints")}
        >
          Complaints
        </li>

        
        <li
          className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          onClick={() => router.push("/admin/approveemployee")}
        >
          Approve Employee
        </li>
        <li
          className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition"
          onClick={() => router.push("/admin/findtechnician")}
        >
          Find Tech
        </li>
        <li
          className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-800 hover:text-red-400 transition"
          onClick={handleLogout}
        >
          Logout
        </li>

      </ul>
    </div>
  );
}