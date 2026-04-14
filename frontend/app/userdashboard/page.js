"use client";

import { useRouter } from "next/navigation";
import { useComplaints } from "../contexts/complaintcontext";
import ProtectedRoute from "../components/protectedroute";

export default function Dashboard() {
  const { complaints } = useComplaints();
  const router = useRouter();
 
 
  const formatCategory = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "verified":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <ProtectedRoute>
    <div className="p-6 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center mb-6 bg-black border border-white/20 backdrop-blur-md px-2 py-2 rounded-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <img src="/arrow.png" alt="Back" className="w-9 h-9" />
        </button>
        <h2 className="ml-4 text-2xl font-semibold text-white tracking-tight">
          Complaints Dashboard
        </h2>
        <span className="ml-auto text-md font-bold text-slate-400 bg-white/5">
          Total: {complaints.length}
        </span>
      </div>
      
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg">
          <table className="w-full table-auto text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...complaints]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((complaint) => {
                  const dateObj = new Date(complaint.created_at);
                  const isDisabled = ["verified", "resolved", "rejected"].includes(
                    complaint.status?.toLowerCase()
                  );

                  return (
                    <tr
                      key={complaint.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="px-5 py-3 text-white text-base font-medium">
                        {dateObj.toLocaleDateString().toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-white text-base font-medium">
                        {dateObj
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-white text-[15px] font-medium">
                        {formatCategory(complaint.category || "General")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center flex justify-center gap-3">
                        <button
                          onClick={() => router.push(`/view-complaint/${complaint.id}`)}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            !isDisabled && router.push(`/update-complaint/${complaint.id}`)
                          }
                          disabled={isDisabled}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                            isDisabled
                              ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow hover:scale-105"
                          }`}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      </ProtectedRoute>
  );
}