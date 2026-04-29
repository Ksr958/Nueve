"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import PropTypes from "prop-types";

import axiosClient from "../utils/apis";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    loading: true,
  });

  const loadSession = useCallback(async () => {
    try {
      const response = await axiosClient.get("/session/");
      setAuth({
        user: {
          username: response.data.username,
          is_admin: response.data.is_admin,
        },
        loading: false,
      });
    } catch {
      setAuth({
        user: null,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback((userName, isAdmin) => {
    setAuth({
      user: { username: userName, is_admin: isAdmin },
      loading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/logout/");
    } 
     finally {
      setAuth({ user: null, loading: false });
    }
  }, []);

  const value = useMemo(
    () => ({
      user: auth.user,
      loading: auth.loading,
      login,
      logout,
      reloadSession: loadSession,
    }),
    [auth.user, auth.loading, login, logout, loadSession]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
