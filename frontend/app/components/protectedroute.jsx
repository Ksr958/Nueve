"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/authContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
      } else if (user.is_admin) {
        router.replace("/unauthorized");
      }
    }
  }, [user, loading, router]);
  
  if (loading || !user || user?.is_admin) {
    return <p>Loading...</p>;
  }

  return children;
}