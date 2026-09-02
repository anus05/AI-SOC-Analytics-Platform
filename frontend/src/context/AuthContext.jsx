import React, { createContext, useState, useEffect } from "react";
import client, { registerTokenGetter } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("soc_token")
  );

  const [operator, setOperator] = useState(() => {
    const saved = localStorage.getItem("soc_operator");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("soc_token")
  );

  const [error, setError] = useState(null);

  useEffect(() => {
    registerTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setError("Session expired. Please login again.");
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);

    return () =>
      window.removeEventListener(
        "auth-unauthorized",
        handleUnauthorized
      );
  }, []);

  // ---------------- LOGIN ----------------

  const login = async (username, password) => {
    try {
      setError(null);

      const response = await client.post("/auth/login", {
        username,
        password,
      });

      const access_token = response.data.access_token;

      localStorage.setItem("soc_token", access_token);

      setToken(access_token);

      // fetch logged-in user
      const me = await client.get("/auth/me");

      localStorage.setItem(
        "soc_operator",
        JSON.stringify(me.data)
      );

      setOperator(me.data);

      setIsAuthenticated(true);

      return true;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid username or password"
      );
      return false;
    }
  };

  // ---------------- REGISTER ----------------

  const register = async (email, username, password) => {
    try {
      setError(null);

      await client.post("/auth/register", {
        username,
        email,
        password,
        role: "analyst",
      });

      return true;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed."
      );
      return false;
    }
  };

  // ---------------- LOGOUT ----------------

  const logout = () => {
    localStorage.removeItem("soc_token");
    localStorage.removeItem("soc_operator");

    setToken(null);
    setOperator(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        operator,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};