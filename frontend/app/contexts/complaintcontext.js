"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import axiosClient from "../utils/apis";
import { useUser } from "./authContext";
import PropTypes from "prop-types";

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { user, loading: userLoading } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    if (!user) {
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
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearComplaints = useCallback(() => {
    setComplaints([]);
  }, []);

  useEffect(() => {
    if (userLoading) return;

    if (user) {
      fetchComplaints();
      return;
    }

    clearComplaints();
    setLoading(false);
  }, [user, userLoading, fetchComplaints, clearComplaints]);

  const counts = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "submitted").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      inprogress: complaints.filter((c) => c.status === "verified").length,
      rejected: complaints.filter((c) => c.status === "rejected").length,
    };
  }, [complaints]);
  
  const value = useMemo(() => {
    return {
      complaints,
      setComplaints,
      counts,
      fetchComplaints,
      clearComplaints,
      loading,
    };
  }, [complaints, counts, fetchComplaints, clearComplaints, loading]);

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  return useContext(ComplaintContext);
}
ComplaintProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
