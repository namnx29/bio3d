import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Check, X } from 'lucide-react';

interface DrawingOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({ isActive, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // Default red
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#0f172a'];

  // Resize canvas to window size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Preserve existing drawings on resize
      const ctx = canvas.getContext('2d');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (ctx && tempCanvas.width > 0) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full pointer-events-auto cursor-crosshair"
      />

      {/* Floating Drawing Toolbar */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/20 pointer-events-auto text-white">
        <span className="text-xs font-semibold text-slate-300 pr-1">Bút vẽ:</span>

        {/* Color pickers */}
        <div className="flex items-center gap-1.5">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-all border ${
                color === c && !isEraser
                  ? 'ring-2 ring-white scale-125 border-white'
                  : 'border-white/30 hover:scale-110'
              }`}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {/* Line width */}
        <div className="flex items-center gap-1">
          {[2, 4, 8].map(w => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                lineWidth === w ? 'bg-white/30 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {w}px
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {/* Eraser */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`p-1.5 rounded-lg transition-all ${
            isEraser ? 'bg-amber-500 text-white shadow' : 'hover:bg-white/20 text-slate-300'
          }`}
          title="Tẩy nét vẽ"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Clear all */}
        <button
          onClick={clearCanvas}
          className="p-1.5 rounded-lg hover:bg-red-500/80 text-slate-300 hover:text-white transition-all"
          title="Xóa toàn bộ nét vẽ"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {/* Close drawing mode */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Xong</span>
        </button>
      </div>
    </div>
  );
};
