import React, { useRef, useState } from 'react';

export default function App() {
  // Supongamos que tienes una referencia a tu canvas o un estado con la URL de la imagen generada
  const canvasRef = useRef(null);
  const [posterUrl, setPosterUrl] = useState(null);

  // Función para abrir la imagen generada en una pestaña nueva (Solución para móviles / Safari)
  const handleOpenInNewTab = () => {
    // Si usas un elemento <canvas> directo:
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      
      // Abre el blob en una pestaña nueva de forma nativa
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        // Fallback en caso de bloqueo de popups
        window.location.href = blobUrl;
      }

      // Limpia el blob tras un tiempo prudente para liberar memoria
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Contenedor principal de tu app */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-black text-center tracking-tight text-gray-900">
          Poster Shine
        </h1>

        {/* Aquí va tu lógica de controles / canvas oculto o visible */}
        {/* Asegúrate de mantener tu referencia del canvas activa: */}
        {/* <canvas ref={canvasRef} className="hidden" /> */}

        {/* Sección de Resultado / Vista para el celular */}
        <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">¡Tu póster está listo!</h2>
          <p className="text-xs text-center text-gray-500">
            Mantén presionada la imagen para guardarla directamente en tu carrete, o ábrela en una pestaña nueva.
          </p>

          {/* Imagen nativa: al mantener presionado en iOS/Android aparece "Guardar en Fotos" */}
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt="Póster generado" 
              className="w-full h-auto object-contain rounded-lg shadow-md border border-gray-200 max-h-[60vh]"
            />
          )}

          {/* Botón adaptado para abrir en pestaña nueva */}
          <button
            onClick={handleOpenInNewTab}
            className="w-full bg-black text-white font-medium py-3 px-4 rounded-xl shadow hover:bg-gray-800 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>Abrir en pestaña nueva</span>
            <span className="text-lg">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
