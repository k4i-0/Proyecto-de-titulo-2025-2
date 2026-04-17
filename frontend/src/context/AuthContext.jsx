import React, { createContext, useContext, useEffect, useState } from "react";
import { miEstado, finSesion } from "../services/Auth.services.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const storedUser = sessionStorage.getItem("userData");
      if (storedUser) {
        sessionStorage.removeItem("userData");
      }
      try {
        const response = await miEstado();

        if (response.status === 200) {
          const userData = response.data.payload;
          setUser(userData);
          setIsAuthenticated(true);
          sessionStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (error) {
        console.log("Error en autenticación:", error);
        logout();
      } finally {
        setInitializing(false);
      }
    }

    checkAuth();
  }, []);

  const login = (usuario) => {
    sessionStorage.setItem("userData", JSON.stringify(usuario));
    setUser(usuario);
    setIsAuthenticated(true);
  };

  const logout = () => {
    finSesion();
    sessionStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, initializing, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
