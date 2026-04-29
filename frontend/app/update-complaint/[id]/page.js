"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient, { getMediaUrl } from "../../utils/apis";
import { useComplaints } from "../../contexts/complaintcontext";
import ProtectedRoute from "../../components/protectedroute";
import Image from "next/image";
export default function UpdateComplaint() {
  const { id } = useParams();
  const router = useRouter();
  const { complaints, fetchComplaints } = useComplaints();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location,setLocation]=useState("")
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteSuccess,setshowDeleteSuccess]=useState(false);
  const [category, setCategory] = useState("");
  const [detecting, setDetecting] = useState(false);
  
  const complaint = complaints.find(c => c.id === Number.parseInt(id));
  useEffect(() => {
  if (complaint) {
    setTitle(complaint.title);
    setDescription(complaint.description);
    setPreview(complaint.photo);
    setLocation(complaint.location);
    setCategory(complaint.category || "");
  } else {
    
    fetchComplaints();
  }
}, [complaint, fetchComplaints]);
const handleFileChange = async (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  setPhoto(selectedFile);
  setDetecting(true);

  const formData = new FormData();
  formData.append("photo", selectedFile);

  try {
    const res = await axiosClient.post("/detect/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setCategory(res.data.category || "Other"); // update category automatically
  } catch {
    alert("Error detecting category");
  } finally {
    setDetecting(false);
  }
};
  
  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (photo) formData.append("photo", photo);
    formData.append("category", category); 
    formData.append("location",location);

    try {
      await axiosClient.patch(`user/complaints/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      await fetchComplaints();
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/userdashboard");
      }, 3000);
    } catch {
    } finally {
      setLoading(false);
    }
  }
 
  async function handleDelete() {
    const isConfirmed = globalThis.confirm(
    "Are you sure you want to delete this complaint?"
  );
  if (!isConfirmed) return;

  setLoading(true);
    try {
      await axiosClient.delete(`/delete/${id}/`);
      
      await fetchComplaints();
      setshowDeleteSuccess(true)
      setTimeout(() => {
        setshowDeleteSuccess(false);
        router.push("/userdashboard");
      }, 500);
    } catch (err) {
      if (err.response?.status === 403) {
      alert("complaints cannot be deleted after verification");
    } else {
      alert("Error deleting complaint. Please try again.");
    }
    
    }
    finally{
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] flex justify-center items-center p-6">
      {showSuccess && (
        <div className="fixed top-5 right-5 w-64 bg-green-500 text-white rounded-lg shadow-lg overflow-hidden animate-slideIn">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-lg">✔</span>
            <span className="text-sm font-medium">Complaint updated successfully</span>
          </div>
        </div>
      )}
      {showDeleteSuccess && (
        <div className="fixed top-5 right-5 w-64 bg-red-500 text-white rounded-lg shadow-lg overflow-hidden animate-slideIn">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-lg">✔</span>
            <span className="text-sm font-medium">Complaint Deleted successfully</span>
          </div>
        </div>
      )}
      
      <button
        onClick={() => router.push("/userdashboard")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <Image src="/arrow.png" alt="Back" width={36} height={36} className="w-9 h-9" />
      </button>

      <form
        onSubmit={handleUpdate}
        className="bg-white/7 border border-white/10 p-6 rounded-2xl w-full max-w-lg space-y-4"
      >
        <h2 className="text-xl font-semibold mb-5 text-center text-white">
          Update Complaint
        </h2>
        
        {preview && (
  <div className="relative w-full h-80 mt-2">
    <Image
      src={getMediaUrl(preview)}
      alt="Complaint"
      fill
      className="rounded object-cover hover:scale-105 transition-transform"
      unoptimized
    />
  </div>
)}

        <label htmlFor="title" className="block mb-1 text-sm text-slate-400">Title</label>
        <input
          className="w-full bg-transparent border border-white/10 p-2 mb-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={title}
          id="title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="location" className="block mb-1 text-sm text-slate-400">Location</label>
        <input
          className="w-full bg-transparent border border-white/10 p-2 mb-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={location}
          id="location"
          onChange={(e) => setLocation(e.target.value)}
        />
        <label htmlFor="description" className="block mb-1 text-sm text-slate-400">Description</label>
        <textarea
          className="w-full bg-transparent border border-white/10 p-2 mb-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="3"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

       <div className="mb-4 flex flex-col">
      <label htmlFor="file" className="text-sm text-slate-400 mb-1">Update Photo</label>
      <input
        type="file"
        id='file'
        onChange={handleFileChange}
        className="text-sm text-slate-300"
      />
      {detecting && <p className="text-xs text-gray-400 mt-1">Detecting category...</p>}
    </div>
        {category && (
          <div className="mb-4 flex flex-col">
            <label htmlFor="category" className="text-sm text-slate-400 mb-1">Category (Detected)</label>
            <select
              value={category}
              id="category"
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 text-sm bg-gray-800 border border-white/10 text-white rounded-md"
            >
              {["Fan", "Light", "AC", "Router", "Water", "Other"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-2 rounded-md hover:bg-indigo-700 transition text-sm"
        >
          {loading ? "Updating..." : "Update Complaint"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 text-white w-full py-2 rounded-md hover:bg-red-700 transition text-sm"
        >
          Delete Complaint
        </button>
      </form>
    </div>
    </ProtectedRoute>
  );
}
