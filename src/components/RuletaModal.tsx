import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Dices, Sparkles, Search, ArrowRight, Utensils } from 'lucide-react';

interface RuletaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchDish: (dishName: string) => void;
}

const OPCIONES_CENA = [
  { nombre: 'Lomito Completo', emoji: '🍔', query: 'lomito', color: '#EA003D' },
  { nombre: 'Pizza Muzzarella', emoji: '🍕', query: 'pizza', color: '#FF5A00' },
  { nombre: 'Empanadas Surtidas', emoji: '🥟', query: 'empanada', color: '#8B5CF6' },
  { nombre: 'Pizzanesa con Papas', emoji: '🥩', query: 'pizzanesa', color: '#2563EB' },
  { nombre: 'Hamburguesa Doble', emoji: '🍔', query: 'hamburguesa', color: '#10B981' },
  { nombre: 'Picada de Lomito', emoji: '🍟', query: 'picada', color: '#F59E0B' },
  { nombre: 'Sushi / Japonés', emoji: '🍣', query: 'sushi', color: '#EC4899' },
  { nombre: 'Lomito Árabe', emoji: '🌯', query: 'arabe', color: '#6366F1' },
];

export const RuletaModal: React.FC<RuletaModalProps> = ({
  isOpen,
  onClose,
  onSearchDish,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<(typeof OPCIONES_CENA)[0] | null>(null);

  if (!isOpen) return null;

  const totalSlices = OPCIONES_CENA.length;
  const sliceAngle = 360 / totalSlices;

  const girarRuleta = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    // Pick random index
    const randomIndex = Math.floor(Math.random() * totalSlices);
    // Extra full spins (5 to 8 full turns)
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    
    // Top pointer is at 270 degrees in SVG coordinate or 0 deg top
    // Align slice center with top pointer
    const targetSliceAngle = randomIndex * sliceAngle + sliceAngle / 2;
    // Calculate new total rotation
    const newRotation = rotation + extraSpins + (360 - (rotation % 360)) + (360 - targetSliceAngle);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = OPCIONES_CENA[randomIndex];
      setWinner(chosen);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#EA003D', '#FF5A00', '#F59E0B', '#10B981', '#2563EB', '#8B5CF6'],
        });
      } catch (e) {}
    }, 4500);
  };

  const handleSelectWinner = () => {
    if (!winner) return;
    onSearchDish(winner.query);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-gray-900 text-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden border border-gray-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Dices className="w-5 h-5 animate-spin-slow" />
            </span>
            <div className="text-left">
              <h3 className="font-black text-base text-white font-display">
                ¿Qué ceno hoy?
              </h3>
              <p className="text-[10px] text-gray-400">Ruleta de decisión Zory Delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-5 flex items-center justify-center">
          {/* Top Marker Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />
          </div>

          {/* Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 shadow-[0_0_30px_rgba(251,191,36,0.2)] pointer-events-none" />

          {/* Spinning SVG Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {OPCIONES_CENA.map((item, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);

                const d = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                // Text position angle
                const textAngle = startAngle + sliceAngle / 2;
                const textRad = (textAngle * Math.PI) / 180;
                const tx = 100 + 62 * Math.cos(textRad);
                const ty = 100 + 62 * Math.sin(textRad);

                return (
                  <g key={i}>
                    <path d={d} fill={item.color} stroke="#111827" strokeWidth="1.5" />
                    <text
                      x={tx}
                      y={ty}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {item.emoji}
                    </text>
                  </g>
                );
              })}
              {/* Center Cap */}
              <circle cx="100" cy="100" r="16" fill="#111827" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="100" cy="100" r="6" fill="#F59E0B" />
            </svg>
          </div>
        </div>

        {/* Winner Result Card */}
        {winner && (
          <div className="p-3 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/40 rounded-2xl mb-4 animate-in zoom-in-95 duration-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
              ¡La ruleta decidió!
            </span>
            <div className="text-lg font-black text-white mt-0.5 font-display flex items-center justify-center gap-1.5">
              <span>{winner.emoji}</span>
              <span>{winner.nombre}</span>
            </div>
            <button
              onClick={handleSelectWinner}
              className="mt-2 w-full bg-[#EA003D] hover:bg-[#d40037] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Ver locales que preparan {winner.nombre}</span>
            </button>
          </div>
        )}

        {/* Spin Action Button */}
        <button
          onClick={girarRuleta}
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-[#EA003D] via-[#FF5A00] to-amber-500 hover:opacity-95 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-rose-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{isSpinning ? 'Girando la ruleta...' : '¡Girar Ruleta!'}</span>
        </button>
      </div>
    </div>
  );
};
