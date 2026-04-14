"use client";
import { useUser } from "../contexts/authContext";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useUser();

  return (
    <nav className="h-16 ml-64 bg-gray-900 border-b border-gray-900 px-10 flex items-center justify-between sticky top-0 z-10">
      <div/>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">{user?.username?.toUpperCase()}</span>
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
            <User size={18} />
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        <button
          onClick={() => {
            logout();          // clears storage + triggers context updates
            router.push("/");  // redirect to login
          }}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors group"
        >
          <span>Logout</span>
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </nav>
  );
}
