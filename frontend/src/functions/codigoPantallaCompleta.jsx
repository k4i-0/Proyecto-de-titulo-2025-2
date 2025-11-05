import { useState, useEffect } from "react";
import { Maximize, AlertCircle } from "lucide-react";

export default function AutoFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [autoAttempted, setAutoAttempted] = useState(false);

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

  // Intento 1: Al hacer clic en cualquier parte de la página
  const handleFirstClick = () => {
    if (!autoAttempted) {
      enterFullscreen();
      setAutoAttempted(true);
    }
  };

  // Intento 2: Al cargar la página (generalmente bloqueado)
  useEffect(() => {
    // Esto normalmente NO funciona debido a restricciones del navegador
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Detectar cambios en el estado de pantalla completa
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

  return (
    <div
      onClick={handleFirstClick}
      className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4"
    >
      {showPrompt && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-500" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
              Activación Requerida
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            Por seguridad, los navegadores requieren una interacción del usuario
            para activar la pantalla completa.
          </p>

          <button
            onClick={enterFullscreen}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
          >
            <Maximize size={24} />
            Activar Pantalla Completa
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              💡 Alternativa: Haz clic en cualquier parte de la pantalla
            </p>
            <p className="text-xs text-blue-600">
              La pantalla completa se activará automáticamente con tu primer
              clic
            </p>
          </div>
        </div>
      )}

      {!showPrompt && (
        <div className="text-center text-white">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              🎉 ¡Pantalla Completa Activada!
            </h2>
            <p className="text-xl mb-4">Presiona ESC para salir</p>
            <div className="text-sm opacity-75">
              Estado: {isFullscreen ? "✓ Activo" : "✗ Inactivo"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
