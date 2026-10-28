import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Utensils, Phone, ShieldCheck, Zap } from 'lucide-react';

interface PromoBannersProps {
  onOpenAddStore: () => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  onOpenAddStore,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const banners = [
    {
      id: 'welcome',
      tag: '¡BIENVENIDO A ZORY!',
      title: 'Tu delivery favorito en Ayolas',
      desc: 'Comida, bebidas, farmacia y más en minutos.',
      action: 'Explorar locales',
      bg: 'from-[#F85800] via-[#FF8A3D] to-[#FF8C00]',
      icon: Zap,
      onClick: undefined,
    },
    {
      id: 'combos',
      tag: '¡PROMOS & COMBOS!',
      title: 'Los mejores precios de Ayolas',
      desc: 'Pizzas, lomitos, hamburguesas y postres con envío rápido.',
      action: 'Ver platos',
      bg: 'from-purple-600 via-teal-600 to-cyan-600',
      icon: Utensils,
      onClick: undefined,
    },
    {
      id: 'partner',
      tag: 'COMERCIOS & LOCALES',
      title: '¡Sumá tu negocio a Zory!',
      desc: 'Empezá a recibir pedidos en tu WhatsApp hoy mismo.',
      action: 'Unirme ahora',
      bg: 'from-purple-600 via-indigo-600 to-blue-600',
      icon: Phone,
      onClick: onOpenAddStore,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners[activeSlide];
  const Icon = current.icon;

  return (
    <div className="px-4 py-2">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${current.bg} text-white p-5 sm:p-6 shadow-lg shadow-black/5 transition-all duration-500`}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-20 -top-10 w-28 h-28 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-white/95 mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {current.tag}
            </span>
            <h2 className="text-lg sm:text-2xl font-black font-display tracking-tight leading-snug">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-normal">
              {current.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {current.onClick ? (
              <button
                onClick={current.onClick}
                className="bg-white text-gray-900 hover:bg-white/95 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span>{current.action}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F85800]" />
              </button>
            ) : (
              <div className="bg-white/20 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>100% Verificado</span>
              </div>
            )}
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-1.5 mt-4">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Ir a banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
