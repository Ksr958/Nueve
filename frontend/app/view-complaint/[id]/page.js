"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import ComplaintTimeline from "../../components/complaintTimeline";
import { useComplaints } from "../../contexts/complaintcontext";
import ProtectedRoute from "../../components/protectedroute";
import Image from "next/image";
import { getMediaUrl } from "../../utils/apis";


export default function ComplaintDetails() {
  const router = useRouter();
  const { id } = useParams();
  const { complaints } = useComplaints();
  
  const complaint = useMemo(
    () => complaints.find((c) => c.id.toString() === id),
    [complaints, id]
  );
  
  if (!complaint) {
  return (
    <div className="text-white p-10">
      Loading complaint...
    </div>
  );
}
const finalImageUrl =
  getMediaUrl(complaint.photo);

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] p-6 ">
      <div className="mb-4">
        <button
    type="button"
    onClick={() => router.back()}
    className="p-0 bg-transparent border-0 cursor-pointer"
    aria-label="Back to Dashboard"
  >
    <Image src="/arrow.png" alt="Back" width={36} height={36} className="w-9 h-9" />

  </button>
      </div>
      <div className="max-w-2xl mx-auto space-y-5 ">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {complaint.title}
          </h1>
          <p className="mt-1 text-md text-slate-200">
            Complaint ID: {complaint.id}
          </p>
        </div>

        
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 space-y-3">
          
          <div className="flex items-center justify-between gap-2">
            <div><Image
              src="/calendar.png" 
              alt="Created Date"
              width={36} height={36} 
              className="h-4 w-4 inline-block mr-1"
            />  
            <span className="text-white text-sm ">Created</span>
            <p className="text-white text-sm font-medium mt-2">
              {new Date(complaint.created_at).toLocaleString()}
            </p> </div>
            
          </div>

          
          <div className="flex gap-2">
            <Image src="/gps (1).png" alt="Location Icon" width={36} height={36} className="w-4 h-4" />
            <p className="text-white text-sm">{complaint.location || "No location provided"}</p>
          </div>
          
          <div>
            <p className="text-slate-200 text-md mb-1">Description</p>
            <p className="text-white text-sm leading-relaxed">
              {complaint.description || "No description provided"}
            </p>
          </div>
        </div>

      
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-3">
            Complaint Status
          </h2>
          <ComplaintTimeline status={complaint.status} />
        </div>

        
        {complaint.ai_recommended_solution && (
  <div className="bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 border border-indigo-500/30 rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-2">
      <span>🤖</span>
      <h2 className="text-white font-semibold">AI Recommended Solution</h2>
    </div>

    <div className="bg-white/5 border border-white/10 p-3 rounded-md mt-3 text-gray-300">
      {(() => {
        let steps = complaint.ai_recommended_solution;

       
        if (typeof steps === "string") {
          try {
            steps = JSON.parse(steps);
          } catch {
            steps = steps.split("\n");
          }
        }

       
        return Array.isArray(steps)
          ? steps.slice(0, 4).map((point, idx) => (
              <p key={point}>
                <span className="text-green-400 font-semibold">
                  {idx + 1}.
                </span>{" "}
                {point}
              </p>
            ))
          : <p>No AI suggestions available</p>;
      })()}
    </div>
  </div>
)}

        
        {complaint.status === "resolved" && complaint.solution && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm font-semibold mb-1">Admin Solution</p>
            <p className="text-white text-sm">{complaint.solution.description}</p>
            <p className="text-xs text-slate-400 mt-2">
              {new Date(complaint.solution.created_at).toLocaleString()}
            </p>
          </div>
        )}

      
        {complaint.status === "rejected" && complaint.rejection_reason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">
              <b>Rejection Reason:</b> {complaint.rejection_reason}
            </p>
          </div>
        )}
      </div>
      {complaint.photo && (
  <div className="relative ml-100 w-2xl h-[500px] mt-2">
  <Image
    src={finalImageUrl}
    alt={complaint.title}
    fill
    className="rounded-md object-cover"
    unoptimized
  />
</div>
)}
    </div>
    </ProtectedRoute>
  );
}
