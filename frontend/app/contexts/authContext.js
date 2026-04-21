"use client";
import { createContext, useContext, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

const UserContext = createContext();

function getInitialAuthState() {
  if (globalThis.window == "undefined") {
    return { user: null, loading: true };
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    return { user: null, loading: false };
  }

  const storedUser = localStorage.getItem("username");
  const storedIsAdmin = localStorage.getItem("is_admin") === "true";

  return {
    user: storedUser ? { username: storedUser, is_admin: storedIsAdmin } : null,
    loading: false,
  };
}

export function UserProvider({ children }) {
  const [{ user, loading }, setAuthState] = useState(getInitialAuthState);

  const login = useCallback((userName, accessToken, refreshToken, is_admin) => {
    localStorage.setItem("username", userName);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("is_admin", is_admin);

    setAuthState({ user: { username: userName, is_admin }, loading: false });
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, loading: false });
    localStorage.clear();
  }, []);

  const value = useMemo(() => {
    return { user, login, logout, loading };
  }, [user, login, logout, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
