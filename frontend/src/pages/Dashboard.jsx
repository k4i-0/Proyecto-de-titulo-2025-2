import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import Navegacion from "../components/Navegacion";
import Home from "../components/Home";

import { finSesion } from "../services/Auth.services";

function Dashboard() {
  const { user, logout } = useAuth();
  const [vistaActual, setVistaActual] = useState("home");

  const cerrarSesion = async () => {
    try {
      const response = await finSesion();
      console.log(response);
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
  };
  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      <Navegacion
        nombreRol={user.nombreRol}
        onLogout={cerrarSesion}
        onCambiarVista={cambiarVista}
      />
      <div style={{ margin: 0, padding: 0 }}>
        <Home
          nombreRol={user.nombre}
          vista={vistaActual}
          onCambiarVista={cambiarVista}
        />
      </div>
    </div>
  );
}

export default Dashboard;
