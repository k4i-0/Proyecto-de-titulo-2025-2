import React from "react";

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  return (
    <div>
      <h1>Bienvenido {user.nombre}</h1>
      <button onClick={handleLogout}>Salir</button>
    </div>
  );
}
