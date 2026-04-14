"use client";
import {useRef} from 'react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import axiosClient from "../utils/apis";
import { useComplaints } from "../contexts/complaintcontext";
import ProtectedRoute from '../components/protectedroute';

export default function CreateComplaint() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const { fetchComplaints } = useComplaints();
  const [aiSolution, setAiSolution] = useState("");
  const [category, setCategory] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({ title: "", file: "", location: "" });

  
useEffect(() => {
  if (message.type === "success") {
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    return () => clearTimeout(timer);
  }
}, [message]);

  const categories = ["Fan", "Light", "AC", "Router", "Water", "Other"];

  //  File change & AI detection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: "" }));
    setCategory("");
    setDetecting(true);

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const res = await axiosClient.post("/detect/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategory(res.data.category || "Other");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error detecting category" });
    } finally {
      setDetecting(false);
    }
  };

  // 🔹 Form submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const newErrors = { title: "", file: "", location: "" };
    if (!title.trim()) newErrors.title = "Title is required";
    if (!file) newErrors.file = "Photo is required";
    if (!location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    if (newErrors.title || newErrors.file || newErrors.location) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("photo", file);
    formData.append("location", location);
    formData.append("category", category);

    try {
      const res = await axiosClient.post("/user/complaints/", formData);

      if (res.data.message) {
        setMessage({
          type: "success",
          text: `${res.data.message}`,
        });
      }

      if (res.data.ai_solution) {
        setAiSolution(res.data.ai_solution);
      }

      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
       if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset the actual input element
    }
      setLocation("");
      setCategory("");
      await fetchComplaints();
    } catch (error) {
      console.error(error);
      console.error(error.data)
      setMessage({ type: "error", text: "Failed to submit complaint" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
  <Sidebar loading={loading} />

  <div className="flex-1 flex flex-col">
    <Navbar loading={loading} />

    <div className="pt-6 px-6 flex justify-center">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 
        p-6 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-5">Create Complaint</h2>

        {/* MESSAGE */}
        {message.text && (
          <div className={`mb-4 p-2 rounded text-sm border
            ${message.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor='title' className="block text-sm mb-1 text-gray-400">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              disabled={loading}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`w-full p-2 rounded bg-gray-800 border text-sm outline-none
                ${errors.title ? "border-red-400" : "border-gray-700"}
                focus:border-blue-500`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='location' className="block text-sm mb-1 text-gray-400">Location *</label>
            <input
              type="text"
              id="location"
              value={location}
              disabled={loading}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors((prev) => ({ ...prev, location: "" }));
              }}
              className={`w-full p-2 rounded bg-gray-800 border text-sm outline-none
                ${errors.location ? "border-red-400" : "border-gray-700"}
                focus:border-blue-500`}
            />
            {errors.location && (
              <p className="text-red-400 text-xs mt-1">{errors.location}</p>
            )}
          </div>
          
          <div>
            <label htmlFor='description' className="block text-sm mb-1 text-gray-400">Description</label>
            <textarea
              value={description}
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows="3"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-sm outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor='file' className="block text-sm mb-1 text-gray-400">Photo *</label>
            <input
              type="file"
              id='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
              className="text-sm text-gray-400"
            />

            {errors.file && (
              <p className="text-red-400 text-xs mt-1">{errors.file}</p>
            )}

            {detecting && (
              <p className="text-xs text-gray-300 mt-1">Detecting category...</p>
            )}

            {category && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">
                  Detected Category (editable)
                </p>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full p-2 text-sm bg-gray-800 border border-gray-700 rounded outline-none focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
         
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard")}
              className="px-4 py-1.5 rounded border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
          
          {aiSolution && (
  <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded text-sm">
    <strong>AI Suggested Solution:</strong>

    <div className="mt-2 space-y-2">
      {(() => {
        let steps = aiSolution;
        
        if (typeof steps === "string") {
          try {
            steps = JSON.parse(steps); // try JSON first
          } catch {
            steps = steps.split("\n"); // fallback
          }
        }
        
        return Array.isArray(steps)
          ? steps
              .filter((line) => line.trim())
              .slice(0, 4)
              .map((point, index) => (
                <p key={point}>
                  <span className="text-green-400 font-semibold">
                    {index + 1}.
                  </span>{" "}
                  {point.trim()}
                </p>
              ))
          : <p>No AI suggestions available</p>;
      })()}
    </div>
  </div>
)}
        </form>
      </div>
    </div>
  </div>
  
  {loading && (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="text-white text-lg font-medium">
        Submitting complaint...
      </div>
    </div>
  )}
</div>
</ProtectedRoute>
  );
}