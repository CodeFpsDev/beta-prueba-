import React, { useState } from 'react';
import { X, Plus, Minus, Check, MessageSquare, Sparkles } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { formatGs } from '../services/sheets';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
    instructions: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const hasVariants = product.variantes && product.variantes.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    hasVariants ? product.variantes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [imgError, setImgError] = useState(false);

  const currentPrice = selectedVariant
    ? selectedVariant.precio
    : product.precio || 0;
  const totalPrice = currentPrice * quantity;

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, quantity, instructions.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-48 sm:h-56 w-full bg-gray-100 shrink-0">
          <img
            src={
              imgError || !product.imagen
                ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                : product.imagen
            }
            alt={product.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
            {product.categoria}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 font-display">
              {product.nombre}
            </h3>
            {product.descripcion && (
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                {product.descripcion}
              </p>
            )}
            <div className="mt-2 text-lg font-black text-[#EA003D] font-display">
              {formatGs(currentPrice)}
            </div>
          </div>

          {/* Variants Selector */}
          {hasVariants && (
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Elegí tu opción (Obligatorio)
                </span>
                <span className="text-[11px] text-gray-400">1 requerida</span>
              </div>

              <div className="space-y-2">
                {product.variantes.map((v, idx) => {
                  const isChecked = selectedVariant?.etiqueta === v.etiqueta;
                  return (
                    <label
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#EA003D] bg-rose-50/40 text-gray-900 shadow-xs'
                          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'border-[#EA003D] bg-[#EA003D]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className="text-sm font-semibold">{v.etiqueta}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 font-display">
                        {formatGs(v.precio)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
              ¿Alguna aclaración para el local? (Opcional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej: Sin cebolla, la salsa aparte, pan bien tostado..."
              maxLength={150}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 border border-gray-200/80">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-gray-800 flex items-center justify-center shadow-xs transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-black w-6 text-center text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-white hover:bg-gray-50 text-gray-800 flex items-center justify-center shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="flex-1 bg-[#EA003D] hover:bg-[#d40037] text-white py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-between shadow-lg shadow-rose-500/25 active:scale-98 transition-all"
          >
            <span>Agregar al pedido</span>
            <span className="font-display">{formatGs(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
