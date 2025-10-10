import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inicioSesion from "../services/Auth.services";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const elem = document.documentElement;
  //
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Esto normalmente NO funciona debido a restricciones del navegador
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
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
    <form onSubmit={handleSubmit} onClick={handleFirstClick}>
      <h2>Login</h2>
      <label htmlFor="email">Correo</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="text-xl mb-4">Presiona ESC para salir</p>
      <div className="text-sm opacity-75">
        Estado: {isFullscreen ? "✓ Activo" : "✗ Inactivo"}
      </div>
    </form>
  );
};

export default Login;
