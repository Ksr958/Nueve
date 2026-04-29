"use client";

import AdminSidebar from "../../components/AdminSidebarTemp";
import AnalyticsCard from "../../components/adminanalyticscard";
import { useComplaints } from "../../contexts/complaintcontext";
import ComplaintsChart from "../../components/complaintchart";
import HighPriorityCard from "../../components/highPriorityCard";
import { COMPLAINT_STATUS } from "../../constants/status";

export default function AdminDashboard() {
  const { complaints } = useComplaints();

  const stats = {
    total: complaints.length,
    open: complaints.filter(
      (c) => c.status?.toLowerCase() === COMPLAINT_STATUS.SUBMITTED
    ).length,
    progress: complaints.filter(
      (c) => c.status?.toLowerCase() === COMPLAINT_STATUS.VERIFIED
    ).length,
    resolved: complaints.filter(
      (c) => c.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED
    ).length,
    rejected: complaints.filter(
      (c) => c.status?.toLowerCase() === COMPLAINT_STATUS.REJECTED
    ).length,
  };

  const chartCounts = {
    pending: stats.open,
    inprogress: stats.progress,
    resolved: stats.resolved,
    rejected: stats.rejected,
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Overview of system performance, complaints, and approvals.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
          <AnalyticsCard title="Total Complaints" value={stats.total} variant="primary" />
          <AnalyticsCard title="Open" value={stats.open} variant="warning" />
          <AnalyticsCard title="In Progress" value={stats.progress} variant="info" />
          <AnalyticsCard title="Resolved" value={stats.resolved} variant="success" />
          <AnalyticsCard title="Rejected" value={stats.rejected} variant="danger" />
        </section>

        <section className="grid grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-start">
            <h2 className="text-lg font-semibold text-slate-300 mb-4">
              Complaint Analytics
            </h2>
            <ComplaintsChart counts={chartCounts} />
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-md">
            <HighPriorityCard complaints={complaints} />
          </div>
        </section>
      </main>
    </div>
  );
}