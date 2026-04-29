"use client";

import { useState, useMemo } from "react";
import { useComplaints } from "../../contexts/complaintcontext";
import AdminSidebar from "../../components/AdminSidebarTemp";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COMPLAINT_STATUS } from "../../constants/status";

export default function AdminComplaints() {
  const { complaints } = useComplaints();
  const router = useRouter();

  const [filters, setFilters] = useState({
    date: "",
    user: "",
    category: "",
    status: "",
    location: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const dateObj = new Date(c.created_at);

      const matchDate = filters.date
        ? dateObj.toLocaleDateString() ===
          new Date(filters.date).toLocaleDateString()
        : true;

      const matchUser = filters.user
        ? c.user?.username
            ?.toLowerCase()
            .includes(filters.user.toLowerCase())
        : true;

      const matchCategory = filters.category
        ? (c.category || "General")
            .trim()
            .toLowerCase() === filters.category.trim().toLowerCase()
        : true;

      const matchStatus = filters.status
        ? c.status?.toLowerCase() === filters.status.trim().toLowerCase()
        : true;

      const matchLocation = filters.location
        ? (c.location || "")
            .toLowerCase()
            .includes(filters.location.trim().toLowerCase())
        : true;

      return (
        matchDate &&
        matchUser &&
        matchCategory &&
        matchStatus &&
        matchLocation
      );
    });
  }, [complaints, filters]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const paginatedComplaints = useMemo(() => {
    return [...filteredComplaints]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
  }, [filteredComplaints, currentPage]);

  const getStatusClass = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.RESOLVED:
        return "bg-green-500/20 text-green-400";
      case COMPLAINT_STATUS.REJECTED:
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen">
      <AdminSidebar />
      <div className="ml-56 w-full flex flex-col p-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">
            All Complaints
          </h1>
          <span className="text-sm text-slate-400">
            Total: {filteredComplaints.length}
          </span>
        </div>

        <div className="sticky top-0 z-10 bg-[#020617] p-3 mb-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-6 gap-3 shadow-md">

          <div className="relative inline-block">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => updateFilter("date", e.target.value)}
              className="p-2 text-sm bg-slate-900 border border-slate-700 text-white rounded-md appearance-none w-full pr-10"
            />

            <Image
              src="/calendar.png"
              alt="calendar"
              width={20}
              height={20}
              className="absolute right-9 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>

          <input
            type="text"
            placeholder="User"
            value={filters.user}
            onChange={(e) => updateFilter("user", e.target.value)}
            className="p-2 text-sm bg-slate-900 border border-slate-700 text-white rounded-md"
          />

          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="p-2 text-sm bg-slate-900 border border-slate-700 text-white rounded-md"
          >
            <option value="">All Categories</option>
            <option value="fan">fan</option>
            <option value="Router">Router</option>
            <option value="AC">AC</option>
            <option value="CC Camera">CC Camera</option>
            <option value="Road">Road</option>
            <option value="General">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="p-2 text-sm bg-slate-900 border border-slate-700 text-white rounded-md"
          >
            <option value="">All Status</option>
            <option value={COMPLAINT_STATUS.SUBMITTED}>Submitted</option>
            <option value={COMPLAINT_STATUS.VERIFIED}>In Progress</option>
            <option value={COMPLAINT_STATUS.RESOLVED}>Resolved</option>
            <option value={COMPLAINT_STATUS.REJECTED}>Rejected</option>
          </select>

          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
            className="p-2 text-sm bg-slate-900 border border-slate-700 text-white rounded-md"
          />
        </div>

        <div className="overflow-auto max-h-[77vh] rounded-xl border border-slate-800 bg-slate-900/60 shadow-md">
          <table className="w-full text-sm border-collapse">
            <thead className="text-xs uppercase text-slate-400 bg-slate-900 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedComplaints.map((c) => {
                const dateObj = new Date(c.created_at);

                return (
                  <tr
                    key={c.id}
                    className="text-center border-b border-slate-800 hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3 text-white">
                      {dateObj.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {dateObj.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {c.user?.username}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {c.category || "General"}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {c.location || "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        className="px-3 py-1 text-xs text-white rounded-md bg-blue-600 hover:bg-blue-500"
                        onClick={() => router.push(`./complaints/${c.id}`)}
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

        <div className="flex justify-between items-center mt-4 text-white">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-3 py-1 bg-slate-800 rounded-md disabled:opacity-50"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-blue-600"
                      : "bg-slate-800"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-slate-800 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}