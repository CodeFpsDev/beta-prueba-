import React, { useState } from 'react';
import { Plus, Minus, Layers } from 'lucide-react';
import type { Product } from '../types';
import { formatGs } from '../services/sheets';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
  onQuickRemove: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onSelect,
  onQuickAdd,
  onQuickRemove,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasVariants = product.variantes && product.variantes.length > 0;
  const isAgotado = !product.disponible;

  const displayPrice = hasVariants
    ? `Desde ${formatGs(product.variantes[0].precio)}`
    : formatGs(product.precio);

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex gap-3 relative select-none ${
        isAgotado ? 'opacity-60 grayscale-40' : ''
      }`}
    >
      {/* Left Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#EA003D] transition-colors line-clamp-1 font-display">
              {product.nombre}
            </h4>
          </div>

          {product.descripcion && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {product.descripcion}
            </p>
          )}

          {hasVariants && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <Layers className="w-3 h-3" />
              <span>{product.variantes.length} opciones disponibles</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-extrabold text-sm sm:text-base text-gray-900 font-display">
            {displayPrice}
          </span>

          {isAgotado && (
            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Right Image + Action Button */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
        <img
          src={
            imgError || !product.imagen
              ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'
              : product.imagen
          }
          alt={product.nombre}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Action Button: Stepper if in cart and no variants, or Add button */}
        {!isAgotado && (
          <div className="absolute bottom-2 right-2">
            {hasVariants ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(product);
                }}
                className="bg-white/95 hover:bg-white text-[#EA003D] shadow-md border border-gray-100 rounded-full px-2 py-1 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>PEDIR</span>
              </button>
            ) : quantityInCart > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-[#EA003D] text-white rounded-full p-0.5 shadow-md"
              >
                <button
                  onClick={(e) => onQuickRemove(product, e)}
                  className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="text-xs font-black px-1 min-w-4 text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={(e) => onQuickAdd(product, e)}
                  className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => onQuickAdd(product, e)}
                className="w-8 h-8 rounded-full bg-white/95 hover:bg-[#EA003D] text-[#EA003D] hover:text-white shadow-md border border-gray-100 flex items-center justify-center active:scale-90 transition-all"
                title="Agregar al pedido"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
