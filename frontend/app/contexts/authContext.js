"use client";
import { createContext, useContext, useState, useEffect } from "react";

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

  
  async function login(userName, accessToken, refreshToken, is_admin) {
    localStorage.setItem("username", userName);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("is_admin", is_admin); // ⚡ save as string
    setUser({ username: userName, is_admin: is_admin }); // ⚡ use is_admin
  }
 
  function logout() {
    setUser(null);
    localStorage.clear();
  }

  return (
    <UserContext.Provider value={{ user,login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}