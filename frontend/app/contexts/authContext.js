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

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof globalThis.window === "undefined") return;

    const token = localStorage.getItem("accessToken");

    // ✅ compute everything first
    let newAuthState = {
      user: null,
      loading: false,
    };

    if (token) {
      const storedUser = localStorage.getItem("username");
      const storedIsAdmin = localStorage.getItem("is_admin") === "true";

      newAuthState.user = storedUser
        ? { username: storedUser, is_admin: storedIsAdmin }
        : null;
    }

    // ✅ single setState (lint-safe)
    setAuth(newAuthState);
  }, []);

  const login = useCallback(
    (userName, accessToken, refreshToken, is_admin) => {
      localStorage.setItem("username", userName);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("is_admin", is_admin);

      setAuth({
        user: { username: userName, is_admin },
        loading: false,
      });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.clear();
    setAuth({ user: null, loading: false });
  }, []);

  const value = useMemo(
    () => ({
      user: auth.user,
      loading: auth.loading,
      login,
      logout,
    }),
    [auth.user, auth.loading, login, logout]
  );

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