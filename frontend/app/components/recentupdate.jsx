"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useComplaints } from "../contexts/complaintcontext";

// ✅ SAFE: computed once globally
const NOW = Date.now();

const statusStyles = {
  submitted: "text-amber-400 bg-amber-500/10",
  verified: "text-sky-400 bg-sky-500/10",
  resolved: "text-emerald-400 bg-emerald-500/10",
  rejected: "text-rose-400 bg-rose-500/10",
};

export default function RecentUpdates() {
  const { complaints } = useComplaints();
  const router = useRouter();

  const recent = useMemo(() => {
    if (!complaints) return [];

    return [...complaints]
      .sort((a, b) => {
        const dateA = new Date(a.status_updated_at || a.created_at);
        const dateB = new Date(b.status_updated_at || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 4)
      .map((c) => {
        const activityDate = c.status_updated_at || c.created_at;

        return {
          ...c,
          activityDate,
          isNew:
            activityDate &&
            NOW - new Date(activityDate).getTime() <=
              3 * 24 * 60 * 60 * 1000,
        };
      });
  }, [complaints]);

  return (
    <div className="bg-[#1e293b] p-5 h-[550px] sm:p-6 rounded-2xl border border-white/5 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-white text-base sm:text-lg font-bold tracking-wide">
          Recent Activity
        </h4>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-4">
        {recent.map((c) => (
          <div key={c.id} className="group flex items-start gap-3">
            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-500 group-hover:bg-indigo-400 transition-colors" />

            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2">
                <button
                  className="text-sm sm:text-base font-semibold text-white truncate cursor-pointer"
                  onClick={() =>
                    router.push(`/view-complaint/${c.id}`)
                  }
                >
                  {c.category || "General"}
                </button>

                {c.isNew && (
                  <span className="text-[9px] font-bold px-1.5 py-[2px] rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 animate-pulse">
                    NEW
                  </span>
                )}
              </div>

              <div
                className={`inline-block mt-1 text-sm font-semibold uppercase tracking-wider px-2 py-2 rounded ${
                  statusStyles[c.status] ||
                  "text-slate-400 bg-slate-500/10"
                }`}
              >
                {c.status || "Pending"}
              </div>

              <p className="text-sm text-slate-200 mt-1">
                {`Updated : ${new Date(c.activityDate).toLocaleString(
                  "en-GB",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}`}
              </p>
            </div>
          </div>
        ))}

        {recent.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-2">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}