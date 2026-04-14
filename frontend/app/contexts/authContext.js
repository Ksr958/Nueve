"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem("username");
    const storedIsAdmin = localStorage.getItem("is_admin") === "true";

    if (storedUser) {
      setUser({ username: storedUser, is_admin: storedIsAdmin });
    }

    setLoading(false);
  }, []);

  // ✅ memoized login function
  const login = useCallback((userName, accessToken, refreshToken, is_admin) => {
    localStorage.setItem("username", userName);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("is_admin", is_admin);

    setUser({ username: userName, is_admin });
  }, []);

  // ✅ memoized logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.clear();
  }, []);

  // ✅ FIX SonarQube S6481
  const value = useMemo(() => {
    return { user, login, logout, loading };
  }, [user, login, logout, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};