import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inicioSesion from "../services/Auth.services";
import { Form, Button, Container } from "react-bootstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const elem = document.documentElement;
  Container;
  //
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.log("Error al activar pantalla completa:", err);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    setIsFullscreen(true);
    setShowPrompt(false);
  };

  const handleFirstClick = () => {
    if (!autoAttempted) {
      enterFullscreen();
      setAutoAttempted(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //llamada backend para autenticar
    const usuario = await inicioSesion(email, password);
    if (usuario.code) {
      alert(usuario.message);
      return;
    }
    console.log(usuario.token.token);
    login(usuario.datos, usuario.token.token);
    // Redirigir a la página de inicio después del inicio de sesión
    navigate("/dashboard");
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" onClick={handleFirstClick}>
            <h2 className="text-center mb-4">Login</h2>

            <Form.Label htmlFor="email">Correo</Form.Label>
            <Form.Control
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mb-3"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="password">Contraseña</Form.Label>
            <Form.Control
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-100"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Iniciar Sesión
          </Button>

          <p className="text-center mb-2">Presiona ESC para salir</p>

          <div className="text-center text-muted small">
            Estado: {isFullscreen ? "✓ Activo" : "✗ Inactivo"}
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
