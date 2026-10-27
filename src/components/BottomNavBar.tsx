import React from 'react';
import { 
  Home, 
  Store, 
  MessageSquare, 
  Dices, 
  Phone, 
  ShoppingBag 
} from 'lucide-react';

interface BottomNavBarProps {
  currentTab: 'inicio' | 'locales';
  onNavigateHome: () => void;
  onNavigateLocales: () => void;
  onOpenReviewModal: () => void;
  onOpenRuletaModal: () => void;
  onOpenCart: () => void;
  cartItemCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onNavigateHome,
  onNavigateLocales,
  onOpenReviewModal,
  onOpenRuletaModal,
  onOpenCart,
  cartItemCount,
}) => {
  const helpWhatsApp = 'https://wa.me/595982309464?text=' + encodeURIComponent('¡Hola Zori Delivery! Necesito ayuda con la app o con mi pedido.');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full z-[1000] bg-white border-t border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
      }}
    >
      <nav className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around gap-1">
        {/* Inicio */}
        <button
          onClick={onNavigateHome}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl active:scale-95 ${
            currentTab === 'inicio'
              ? 'text-[#EA003D] font-extrabold'
              : 'text-gray-500 hover:text-gray-900 font-medium'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 stroke-[2.2]" />
            {currentTab === 'inicio' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#EA003D]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Inicio</span>
        </button>

        {/* Locales */}
        <button
          onClick={onNavigateLocales}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl active:scale-95 ${
            currentTab === 'locales'
              ? 'text-[#EA003D] font-extrabold'
              : 'text-gray-500 hover:text-gray-900 font-medium'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5 stroke-[2.2]" />
            {currentTab === 'locales' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#EA003D]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Locales</span>
        </button>

        {/* Ruleta "¿Qué ceno hoy?" */}
        <button
          onClick={onOpenRuletaModal}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-amber-600 hover:text-amber-700 font-medium group active:scale-95"
        >
          <div className="relative">
            <Dices className="w-5 h-5 group-hover:rotate-45" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight">Ruleta</span>
        </button>

        {/* Reseña Anónima */}
        <button
          onClick={onOpenReviewModal}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-gray-500 hover:text-gray-900 font-medium active:scale-95"
        >
          <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-1 tracking-tight">Reseña</span>
        </button>

        {/* Ayuda WhatsApp */}
        <a
          href={helpWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-emerald-600 hover:text-emerald-700 font-medium active:scale-95"
        >
          <Phone className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-1 tracking-tight">Ayuda</span>
        </a>

        {/* Carrito Shortcut */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#EA003D] text-white shadow-md shadow-rose-500/30 hover:bg-[#d40037] active:scale-90 ml-1 shrink-0"
          title="Ver Carrito"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-gray-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartItemCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
