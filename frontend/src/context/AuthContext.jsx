import React, { createContext, useState, useEffect } from "react";
import client, { registerTokenGetter } from "../api/client";

export const AuthContext = createContext();

const DEFAULT_OPERATOR = {
  id: 1,
  email: "analyst@socvigil.net",
  username: "analyst@socvigil.net",
  name: "Security Analyst",
  role: "admin",
  auth_provider: "local",
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("soc_token") || "dev_bypass_token"
  );

  const [operator, setOperator] = useState(() => {
    const saved = localStorage.getItem("soc_operator");
    return saved ? JSON.parse(saved) : DEFAULT_OPERATOR;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

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

  const login = async (emailOrUsername, password) => {
    try {
      setError(null);

      const response = await client.post("/auth/login", {
        email: emailOrUsername,
        username: emailOrUsername,
        password,
      });

      const access_token = response.data.access_token;
      localStorage.setItem("soc_token", access_token);
      setToken(access_token);

      // fetch logged-in user profile
      const me = await client.get("/auth/me");
      const userData = me.data || response.data.user;

      localStorage.setItem(
        "soc_operator",
        JSON.stringify(userData)
      );

      setOperator(userData);
      setIsAuthenticated(true);

      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password";
      setError(msg);
      return false;
    }
  };

  // ---------------- REGISTER ----------------

  const register = async (email, name, password) => {
    try {
      setError(null);

      await client.post("/auth/register", {
        email,
        name: name || email.split("@")[0],
        password,
        role: "analyst",
      });

      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed.";
      setError(msg);
      return false;
    }
  };

  // ---------------- GOOGLE LOGIN ----------------

  const googleLogin = async (payload) => {
    try {
      setError(null);

      const response = await client.post("/auth/google", payload);

      const access_token = response.data.access_token;
      const userData = response.data.user;

      localStorage.setItem("soc_token", access_token);
      setToken(access_token);

      localStorage.setItem("soc_operator", JSON.stringify(userData));
      setOperator(userData);

      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || "Google authentication failed.";
      setError(msg);
      return false;
    }
  };

  // ---------------- FORGOT PASSWORD ----------------

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await client.post("/auth/forgot-password", { email });
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.detail || "Unable to request password reset.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ---------------- RESET PASSWORD ----------------

  const resetPassword = async (resetToken, newPassword) => {
    try {
      setError(null);
      const response = await client.post("/auth/reset-password", {
        token: resetToken,
        new_password: newPassword,
      });
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to reset password.";
      setError(msg);
      return { success: false, error: msg };
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
        googleLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};