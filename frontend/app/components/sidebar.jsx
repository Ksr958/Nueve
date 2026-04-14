"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, PlusCircle } from "lucide-react";
import PropTypes from "prop-types";
export default function Sidebar({loading}) {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "My Complaints", path: "/userdashboard", icon: <FolderOpen size={18} /> },
    { name: "Create New", path: "/create-complaint", icon: <PlusCircle size={18} /> },
  ];

  return (
      
      <div
        className={`fixed top-0 left-0 h-screen w-56 bg-[#0f172a] border-r border-white/10 p-4 z-40 shadow-xl
        translate-x-0`}
      >
        
        <div className="mb-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm italic">R</span>
          </div>
          <span className="font-semibold text-base text-white uppercase italic">
            Resolve<span className="text-indigo-400">X</span>
          </span>
        </div>

        
        <div className="space-y-1">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                }`}
                disabled={loading}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        
      </div>
  );
}
Sidebar.propTypes = {
  loading: PropTypes.bool,
};