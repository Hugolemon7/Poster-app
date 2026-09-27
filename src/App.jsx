import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [levels, setLevels] = useState(4);
  const [brightness, setBrightness] = useState(0);
  const [exportFormat, setExportFormat] = useState('png');

  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImageRef.current = img;
          setImageSrc(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!originalImageRef.current || !canvasRef.current) return;

    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const numLevels = levels;
    const step = 255 / (numLevels - 1);

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      gray = Math.min(255, Math.max(0, gray + brightness));

      const posterizedGray = Math.round(gray / step) * step;

      data[i] = posterizedGray;
      data[i + 1] = posterizedGray;
      data[i + 2] = posterizedGray;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [imageSrc, levels, brightness]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvasRef.current.toDataURL(mimeType, 0.95);

    const link = document.createElement('a');
    link.download = `posterized-image.${exportFormat}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      <header className="p-5 border-b border-neutral-800 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider uppercase">Poster Shine</h1>
        <span className="text-xs text-neutral-400">Grayscale Posterizer</span>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center bg-neutral-950 overflow-auto">
          {!imageSrc ? (
            <label className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-500 transition-colors bg-neutral-900/50">
              <svg className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-neutral-300">Haz clic para subir una imagen</span>
              <span className="text-xs text-neutral-500 mt-1">PNG, JPG o WebP</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-neutral-800">
              <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain" />
            </div>
          )}
        </div>

        {imageSrc && (
          <aside className="w-full md:w-80 p-6 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col gap-6">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">Ajustes</h2>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Niveles de tono</span>
                <span className="font-bold">{levels}</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Brillo</span>
                <span className="font-bold">{brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-neutral-300">Formato de descarga</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('png')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md border transition-all ${
                    exportFormat === 'png'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setExportFormat('jpg')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md border transition-all ${
                    exportFormat === 'jpg'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="mt-auto w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors shadow-lg text-sm"
            >
              Descargar Imagen
            </button>

            <label className="text-center text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors">
              Cambiar imagen
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </aside>
        )}
      </main>
    </div>
  );
}
