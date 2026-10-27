import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  Store as StoreIcon
} from 'lucide-react';

interface HeaderProps {
  totalCartItems: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenMyOrders: () => void;
  onOpenAddStore: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeStoreName?: string;
  onBackToHome?: () => void;
}

const CITIES = ['Ayolas', 'Corateí', 'San Cosme y Damián', 'Santiago', 'Encarnación'];

export const Header: React.FC<HeaderProps> = ({
  totalCartItems,
  cartTotal,
  onOpenCart,
  onOpenMyOrders,
  onOpenAddStore,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange,
  activeStoreName,
  onBackToHome,
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Top Banner - Status & City */}
      <div className="bg-[#EA003D] text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1.5 font-medium hover:opacity-90 transition-opacity bg-black/15 px-2 py-0.5 rounded-full"
            >
              <MapPin className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>{selectedCity}, Paraguay</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {showCityDropdown && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Elegí tu ciudad
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-rose-50 hover:text-[#EA003D] transition-colors ${
                      selectedCity === city ? 'font-bold text-[#EA003D] bg-rose-50/60' : ''
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#EA003D]"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="hidden sm:inline-block text-white/60">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/90">
            <Sparkles className="w-3 h-3 text-amber-300" />
            ¡Delivery rápido directo a tu WhatsApp!
          </span>
        </div>

        {/* Clean top right status - customer friendly */}
        <div className="flex items-center gap-2 text-[11px] text-white/90 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Abierto ahora</span>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {activeStoreName && onBackToHome ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-700 hover:text-[#EA003D] font-bold text-sm transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                ←
              </div>
              <div className="hidden xs:block text-left">
                <span className="text-[10px] text-gray-400 block font-normal uppercase">Volver</span>
                <span className="text-xs font-semibold text-gray-700">Explorar locales</span>
              </div>
            </button>
          ) : (
            <div 
              onClick={onBackToHome}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA003D] to-[#FF4B2B] flex items-center justify-center text-white shadow-md shadow-rose-500/25">
                <span className="font-extrabold text-2xl tracking-tighter">Z</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-xl tracking-tight text-gray-900 font-display">
                    zori<span className="text-[#EA003D]">delivery</span>
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Ayolas, Paraguay</p>
              </div>
            </div>
          )}
        </div>

        {/* Central Search Bar (Expanded on desktop/tablet) */}
        <div className="flex-1 max-w-lg mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscá pizzas, hamburguesas, farmacias, bodegas..."
              className="w-full bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-gray-800 text-sm pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-rose-400 focus:ring-3 focus:ring-rose-500/15 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-200 hover:bg-gray-300 w-4 h-4 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddStore}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#EA003D] px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <StoreIcon className="w-4 h-4 text-[#EA003D]" />
            <span>Sumar mi local</span>
          </button>

          <button
            onClick={onOpenMyOrders}
            className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Ver mis pedidos recientes"
          >
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="hidden xs:inline">Mis Pedidos</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#EA003D] hover:bg-[#d40037] text-white px-3.5 py-2 rounded-xl font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Carrito</span>
            {totalCartItems > 0 && (
              <span className="bg-white text-[#EA003D] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscá comidas o locales..."
            className="w-full bg-gray-100 text-gray-800 text-xs pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/15 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
