import React from 'react';
import { X, Store, MessageSquare, CheckCircle, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { getStoredSheetConfig } from '../services/sheets';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const config = getStoredSheetConfig();
  const whatsappNumber = config.defaultWhatsApp || '595982309464';
  const textMsg = encodeURIComponent(
    '¡Hola Zori Delivery! 📱 Me interesa agregar mi local a la plataforma. ¿Me podrían dar info sobre cómo funciona?'
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${textMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-display">
                ¡Sumá tu negocio a Zory!
              </h3>
              <p className="text-[11px] text-gray-500">
                La plataforma de delivery número 1 en Ayolas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-rose-50 p-4 rounded-2xl border border-purple-100 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong>Más ventas cada día:</strong> Llegá a cientos de clientes de Ayolas y zonas aledañas.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[#F85800] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong>Catálogo 100% autogestionable:</strong> Cambiá fotos, precios y platos desde tu propio celular en segundos.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong>Pedidos directos a tu WhatsApp:</strong> Con detalle claro, ubicación GPS y cálculo de vuelto listo para cocina.
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Hacé clic abajo para hablar directamente con el equipo de soporte de Zory Delivery por WhatsApp.
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#FFA630] hover:bg-[#1ebd5a] text-white py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Contactar por WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
          >
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
