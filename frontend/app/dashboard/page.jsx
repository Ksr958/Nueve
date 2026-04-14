"use client";
import { useUser } from "../contexts/authContext";
import { useComplaints } from "../contexts/complaintcontext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import ComplaintsChart from "../components/complaintchart";
import RecentUpdates from "../components/recentupdate";
import ProtectedRoute from "../components/protectedroute";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { counts, complaints } = useComplaints();
  const cardData = [
    { label: "Total", value: counts?.total, color: "text-indigo-400", border: "border-indigo-500/20" },
    { label: "Pending", value: counts?.pending, color: "text-amber-400", border: "border-amber-500/20" },
    { label: "In Progress", value: counts?.inprogress, color: "text-sky-400", border: "border-sky-500/20" },
    { label: "Resolved", value: counts?.resolved, color: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Rejected", value: counts?.rejected, color: "text-rose-400", border: "border-rose-500/20" },
  ];

  return (
    <ProtectedRoute>
    <div className="flex h-screen bg-[#0f172a] text-slate-200 ">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-56">
        <Navbar />

        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <header className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Welcome Back, {userLoading ? "Loading..." : user?.username || "User"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-time complaint analytics and updates.
            </p>
          </header>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 flex flex-col gap-6">
              <div className="grid grid-cols-5 gap-4">
                {cardData.map((card) => (
                  <div
                    key={card.label}
                    className={`relative bg-[#1e293b] p-4 rounded-xl border ${card.border} shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
                  >
                    <h4 className="text-slate-400 text-sm font-semibold uppercase mb-1">
                      {card.label}
                    </h4>
                    <div className="flex items-end justify-between">
                      <p className={`text-lg font-semibold ${card.color}`}>
                        {card.value || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 shadow-md w-full h-96">
                <ComplaintsChart counts={counts} />
              </div>
            </div>

            <div className="col-span-1">
              <RecentUpdates complaints={complaints} />
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}