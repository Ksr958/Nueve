"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axiosClient, { getMediaUrl } from "../../../utils/apis";
import AdminSidebar from "../../../components/AdminSidebarTemp";
import { useComplaints } from "../../../contexts/complaintcontext";
import Image from "next/image";
import { COMPLAINT_STATUS } from "../../../constants/status";

export default function ComplaintDetail() {
  const { fetchComplaints } = useComplaints();
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [solution, setSolution] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [updating, setUpdating] = useState(false);

  const oldStatusRef = useRef("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosClient.get(`/admin/complaints/${id}/`);

        setComplaint(res.data);
        setStatus(res.data.status);
        oldStatusRef.current = res.data.status;

        if (res.data.solution) {
          setSolution(res.data.solution.description);
        }

        if (res.data.rejection_reason) {
          setRejectReason(res.data.rejection_reason);
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load complaint." });
      }
    };

    fetchComplaint();
  }, [id]);

  const showMessage = (msgType, msgText) => {
    setMessage({ type: msgType, text: msgText });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 10000);
  };

  const updateComplaint = async () => {
    try {
      setUpdating(true);

      if (status === oldStatusRef.current) {
        showMessage("error", `Complaint already has status "${status}".`);
        return;
      }

      let payload = {};

      if (status === COMPLAINT_STATUS.REJECTED) {
        if (!rejectReason.trim()) {
          showMessage("error", "Please provide a reason for rejection.");
          return;
        }

        payload = {
          status: COMPLAINT_STATUS.REJECTED,
          rejection_reason: rejectReason,
        };
      } 
      
      else if (status === COMPLAINT_STATUS.RESOLVED) {
        if (!solution.trim()) {
          showMessage("error", "Please provide a solution before resolving.");
          return;
        }

        payload = {
          status: COMPLAINT_STATUS.RESOLVED,
          solution: solution,
        };
      } 
      
      else if (status === COMPLAINT_STATUS.VERIFIED) {
        payload = {
          status: COMPLAINT_STATUS.VERIFIED,
        };
      }

      if (Object.keys(payload).length > 0) {
        const res = await axiosClient.patch(
          `/admin/complaints/${id}/`,
          payload
        );

        setComplaint(res.data);
        setStatus(res.data.status);
        oldStatusRef.current = res.data.status;

        await fetchComplaints();

        showMessage("success", "Complaint updated successfully.");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Update failed. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!complaint) {
    return <p className="text-white p-10">Loading...</p>;
  }

  const imageUrl = getMediaUrl(complaint.photo);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar />

      <div className="flex-1 ml-56 overflow-y-auto p-6 lg:p-12">
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 sticky top-0 bg-gray-900 z-10">
          Complaint Details
        </h1>

        {message.text && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-center ${
              message.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="w-full max-w-xl bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-gray-700 shadow-lg">

          <div className="space-y-2">
            <p><b>User:</b> {complaint.user.username}</p>
            <p><b>Title:</b> {complaint.title}</p>
            <p><b>Description:</b> {complaint.description || "No Description Provided"}</p>
            <p><b>Category:</b> {complaint.category}</p>
            <p><b>Status:</b> {complaint.status}</p>
            <p><b>Location:</b> {complaint.location}</p>
          </div>

          {complaint.photo && (
            <button type="button" onClick={() => setShowImage(true)}>
              <Image
                src={imageUrl}
                alt="Complaint"
                width={144}
                height={144}
                className="w-36 h-36 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                unoptimized
              />
            </button>
          )}

          {updating && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="text-white text-lg font-semibold animate-pulse">
                Updating complaint...
              </div>
            </div>
          )}

          {complaint.ai_recommended_solution && (
            <div className="mt-2 p-3 bg-gray-700 rounded border border-gray-600">
              <b>🤖 AI Suggested Solution:</b>

              <div className="mt-2 text-sm space-y-2">
                {(() => {
                  let steps = complaint.ai_recommended_solution;

                  if (typeof steps === "string") {
                    try {
                      steps = JSON.parse(steps);
                    } catch {
                      steps = steps.split("\n");
                    }
                  }

                  return Array.isArray(steps) ? (
                    steps
                      .filter((line) => line.trim())
                      .slice(0, 5)
                      .map((line, index) => (
                        <p key={line}>
                          <span className="text-green-400 font-semibold">
                            {index + 1}.
                          </span>{" "}
                          {line.trim()}
                        </p>
                      ))
                  ) : (
                    <p>No AI suggestions available</p>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col space-y-2">
            <label htmlFor="status" className="font-semibold">
              Update Status
            </label>

            <select
              value={status}
              id="status"
              onChange={(e) => {
                const newStatus = e.target.value;

                const allowedTransitions = {
                  [COMPLAINT_STATUS.SUBMITTED]: [
                    COMPLAINT_STATUS.VERIFIED,
                    COMPLAINT_STATUS.RESOLVED,
                    COMPLAINT_STATUS.REJECTED,
                  ],
                  [COMPLAINT_STATUS.VERIFIED]: [
                    COMPLAINT_STATUS.RESOLVED,
                    COMPLAINT_STATUS.REJECTED,
                  ],
                  [COMPLAINT_STATUS.RESOLVED]: [],
                  [COMPLAINT_STATUS.REJECTED]: [],
                };

                if (
                  !allowedTransitions[oldStatusRef.current].includes(newStatus)
                ) {
                  setMessage({
                    type: "error",
                    text: `Cannot change status from ${oldStatusRef.current} to ${newStatus}`,
                  });
                  return;
                }

                setStatus(newStatus);
                setMessage({ type: "", text: "" });
              }}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
            >
              <option value={COMPLAINT_STATUS.SUBMITTED}>Submitted</option>
              <option value={COMPLAINT_STATUS.VERIFIED}>Verified</option>
              <option value={COMPLAINT_STATUS.RESOLVED}>Resolved</option>
              <option value={COMPLAINT_STATUS.REJECTED}>Rejected</option>
            </select>
          </div>

          {status === COMPLAINT_STATUS.RESOLVED && (
            <textarea
              className="w-full mt-2 p-3 rounded bg-gray-700 border border-gray-600 resize-none"
              placeholder="Enter solution..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={3}
            />
          )}

          {status === COMPLAINT_STATUS.REJECTED && (
            <textarea
              className="w-full mt-2 p-3 rounded bg-gray-700 border border-gray-600 resize-none"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          )}

          <button
            onClick={updateComplaint}
            disabled={
              complaint.status === COMPLAINT_STATUS.RESOLVED ||
              complaint.status === COMPLAINT_STATUS.REJECTED
            }
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition-colors w-full disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Update Complaint
          </button>
        </div>
      </div>

      {showImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            onClick={() => setShowImage(false)}
            className="absolute top-5 right-5 text-white text-3xl font-bold"
          >
            ✕
          </button>

          <div className="relative w-[90vw] h-[90vh]">
            <Image
              src={getMediaUrl(complaint.photo)}
              alt="Full View"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}