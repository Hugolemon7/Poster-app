import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [levels, setLevels] = useState(4); // Niveles de grises / tonalidades (de 2 a 16)
  const [brightness, setBrightness] = useState(0); // Ajuste de brillo (-100 a 100)
  const [posterUrl, setPosterUrl] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Carga de la imagen seleccionada por el usuario
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Lógica de posterización (2-16 tonos) y ajuste de brillo
  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Tamaño de cada escalón según la cantidad de niveles seleccionados (2 a 16)
      const step = 255 / (levels - 1);

      for (let i = 0; i < data.length; i += 4) {
        // 1. Convertir a escala de grises relativa
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // 2. Aplicar el ajuste de brillo (-100 a +100)
        gray = Math.min(255, Math.max(0, gray + brightness));

        // 3. Cuantizar/posterizar en los niveles seleccionados (2 a 16 tonalidades)
        const posterizedValue = Math.round(gray / step) * step;

        // Asignar el nuevo valor RGB uniforme (Grises)
        data[i] = posterizedValue;     // R
        data[i + 1] = posterizedValue; // G
        data[i + 2] = posterizedValue; // B
      }

      ctx.putImageData(imgData, 0, 0);
      setPosterUrl(canvas.toDataURL('image/png'));
    };
  }, [imageSrc, levels, brightness]);

  // Función para abrir la imagen en una pestaña nueva (Solución para móviles / iOS Safari)
  const handleOpenInNewTab = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        window.location.href = blobUrl; // Fallback por si bloquea emergentes
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-black tracking-wider">POSTER SHINE</h1>
          <p className="text-sm text-slate-400">Transforma tus imágenes en pósters en escalas de grises</p>
        </header>

        {/* Panel de Controles */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-5 border border-slate-700">
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
            {imageSrc ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
          </button>

          {imageSrc && (
            <div className="flex flex-col gap-4">
              {/* Selector de Tonalidades / Niveles (2 a 16) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <label>Tonalidades de grises:</label>
                  <span className="font-bold text-indigo-400">{levels} tonos</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="16" 
                  step="1"
                  value={levels} 
                  onChange={(e) => setLevels(Number(e.target.value))}
                  className="accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>2 (Alto Contraste)</span>
                  <span>16 (Escala Suave)</span>
                </div>
              </div>

              {/* Ajuste de Brillo */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <label>Ajuste de Brillo:</label>
                  <span className="font-bold text-indigo-400">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input 
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="1"
                  value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Canvas oculto para procesamiento de píxeles */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Vista del Resultado Generado */}
        {posterUrl && (
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-slate-700 animate-fade-in">
            <h2 className="text-lg font-bold">¡Tu póster está listo!</h2>
            <p className="text-xs text-center text-slate-400">
              Mantén presionada la imagen para guardarla en tu carrete (en celular), o usa el botón para abrirla en una pestaña nueva.
            </p>

            {/* Etiqueta <img> nativa para permitir toque prolongado en móviles */}
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
