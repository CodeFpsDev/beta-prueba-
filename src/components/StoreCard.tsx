import React, { useState } from 'react';
import { Star, Clock, Bike, Flame } from 'lucide-react';
import type { Store } from '../types';
import { formatGs } from '../services/sheets';

interface StoreCardProps {
  store: Store;
  productCount: number;
  onClick: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  productCount,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Banner / Cover */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gray-100">
        <img
          src={
            imgError
              ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
              : store.banner || store.logo
          }
          alt={store.nombre}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {store.destacado && (
            <span className="bg-[#F85800] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3" />
              Más Vendido
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
            {store.categoria}
          </span>
        </div>

        {/* Delivery Time Pill */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{store.deliveryTime || '25-35 min'}</span>
        </div>

        {/* Logo overlay */}
        <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-2xl bg-white p-1 shadow-md border-2 border-white overflow-hidden">
          <img
            src={
              logoError
                ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                : store.logo
            }
            alt={store.nombre}
            onError={() => setLogoError(true)}
            className="w-full h-full object-contain rounded-xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Content info */}
      <div className="pt-6 p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#F85800] transition-colors font-display line-clamp-1">
              {store.nombre}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{store.rating || '4.8'}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {store.horario ? `🕒 ${store.horario}` : 'Abierto hoy en Ayolas'}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 font-medium text-gray-700">
            <Bike className="w-3.5 h-3.5 text-[#F85800]" />
            <span>Envío {formatGs(store.deliveryFee || 5000)}</span>
          </div>

          <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
            {productCount} {productCount === 1 ? 'producto' : 'platos'}
          </div>
        </div>
      </div>
    </div>
  );
};
