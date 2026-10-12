import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [threshold, setThreshold] = useState(128); // O tus parámetros originales de posterización
  const [posterUrl, setPosterUrl] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Función para manejar la carga de la imagen original
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Procesamiento del canvas (mantén aquí tu lógica original de dibujo / poster Shine)
  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Ajusta las dimensiones según tu app original
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Aquí va tu lógica de procesamiento de píxeles / grises / posterizado
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const val = avg >= threshold ? 255 : 0; // Ejemplo de umbral
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
      }
      ctx.putImageData(imgData, 0, 0);

      // Guardamos la URL de la imagen generada para mostrarla en la etiqueta <img>
      setPosterUrl(canvas.toDataURL('image/png'));
    };
  }, [imageSrc, threshold]);

  // Función clave para abrir la imagen en una pestaña nueva (Solución para móviles / iOS)
  const handleOpenInNewTab = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        window.location.href = blobUrl; // Fallback
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-black tracking-wider">POSTER SHINE</h1>
          <p className="text-sm text-slate-400">Transforma tus imágenes en pósters de alto contraste</p>
        </header>

        {/* Controles originales de tu app */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4 border border-slate-700">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className="bg-indigo-600 hover:bg-indigo-500 font-bold py-3 px-6 rounded-xl transition-all text-center cursor-pointer shadow-lg"
          >
            Seleccionar Imagen
          </button>

          {imageSrc && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300 font-medium">Ajuste de Umbral / Efecto:</label>
              <input 
                type="range" 
                min="0" 
                max="255" 
                value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="accent-indigo-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Canvas oculto necesario para procesar los pixeles */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Sección del resultado con soporte móvil optimizado */}
        {posterUrl && (
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-slate-700 animate-fade-in">
            <h2 className="text-lg font-bold">¡Tu póster está listo!</h2>
            <p className="text-xs text-center text-slate-400">
              Mantén presionada la imagen para guardarla en tu carrete (en iPhone/Android), o usa el botón de abajo.
            </p>

            {/* Imagen nativa para permitir toque prolongado y menú de guardado en móvil */}
            <img 
              src={posterUrl} 
              alt="Póster Poster Shine" 
              className="max-h-[60vh] w-auto object-contain rounded-lg border border-slate-600 shadow-md bg-white"
            />

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleOpenInNewTab}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-2"
              >
                <span>Abrir en pestaña nueva</span>
                <span className="text-lg">↗</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
