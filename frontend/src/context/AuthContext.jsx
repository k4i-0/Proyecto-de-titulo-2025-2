import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { miEstado, finSesion } from "../services/Auth.services.js";

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const storedUser = sessionStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.log("Error leyendo userData desde sessionStorage:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const storedUser = getStoredUser();
  const [user, setUser] = useState(storedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedUser));
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    finSesion();
    sessionStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await miEstado();

      if (response.status === 200) {
        const userData = response.data.payload;
        setUser(userData);
        setIsAuthenticated(true);
        sessionStorage.setItem("userData", JSON.stringify(userData));
      }
      if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.log("Error en autenticación:", error);
      logout();
    } finally {
      setInitializing(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((usuario) => {
    sessionStorage.setItem("userData", JSON.stringify(usuario));
    setUser(usuario);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        initializing,
        login,
        logout,
        setUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
