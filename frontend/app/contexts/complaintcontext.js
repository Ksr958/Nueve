"use client"; 
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../utils/apis";
import { useUser } from "./authContext";

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { user } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true); 

 async function fetchComplaints() {
  if (!user) return;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    setComplaints([]);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    let endpoint;

    if (user.is_admin) {
      endpoint = "/admin/complaints/";
    } else {
      endpoint = "/user/complaints/";
    }

    const res = await axiosClient.get(endpoint);
   
    const data = res.data.results || res.data || [];

    setComplaints(Array.isArray(data) ? data : []);

  } catch (err) {
    setComplaints([]);
  } finally {
    setLoading(false);
  }
}

  function clearComplaints() {
    setComplaints([]);
  }
  
  useEffect(() => {
    if (user) fetchComplaints();
    else clearComplaints();
  }, [user]);
  

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "submitted").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    inprogress: complaints.filter((c) => c.status === "verified").length,
    rejected: complaints.filter((c) => c.status === "rejected").length,
  };

  return (
    <ComplaintContext.Provider
      value={{ complaints, setComplaints, counts, fetchComplaints, clearComplaints, loading }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  return useContext(ComplaintContext);
}