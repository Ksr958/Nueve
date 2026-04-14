"use client";

import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
export default function HighPriorityCard({ complaints }) {
  const router = useRouter();
  
  const openComplaints = complaints.filter(
    (c) => c.status !== "resolved" && c.status !== "rejected"
  );
  
  const oldestComplaints = openComplaints
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, 3); 

  return (
    <div className="bg-red-500/10 border border-white/30 rounded-2xl p-5 shadow-lg">
      <h2 className="text-red-400 font-semibold text-lg mb-3 flex justify-between">
        <span>⚠ High Priority Complaints</span>
      </h2>

      {oldestComplaints.length === 0 ? (
        <p className="text-slate-400 text-sm">No high priority complaints</p>
      ) : (
        <div className="space-y-2">
          {oldestComplaints.map((c) => (
            <button
  key={c.id}
  onClick={() => router.push(`../admin/complaints/${c.id}`)}
  className="w-full text-left p-3 rounded bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition"
>
              <p className="text-white font-medium">{c.title}</p>
              <p className="text-slate-400 text-xs">{c.category || "General"}</p>
              <p className="text-slate-500 text-xs"> {c.location}</p>
              <p className="text-slate-500 text-xs">
                🕒 {new Date(c.created_at).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
HighPriorityCard.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      category: PropTypes.string,
      location: PropTypes.string,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
};