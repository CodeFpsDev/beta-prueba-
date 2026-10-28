import React from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, Clock, MapPin, Receipt, Share2 } from 'lucide-react';
import type { OrderRecord } from '../types';
import { formatGs } from '../services/sheets';

interface OrderSuccessModalProps {
  order: OrderRecord | null;
  whatsappUrl: string;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsappUrl,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ¡Pedido Enviado!
          </span>
          <h3 className="text-2xl font-black text-gray-900 font-display mt-2">
            ¡Gracias por tu pedido!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Tu pedido fue recibido con éxito por <strong>{order.tienda}</strong>.
          </p>
        </div>

        {/* Order Card summary */}
        <div className="my-5 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 font-bold text-gray-800">
            <span>Cliente: {order.cliente}</span>
            <span className="text-gray-400 font-normal">{order.hora}</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {order.productos.map((p, idx) => (
              <div key={idx} className="flex justify-between text-gray-600">
                <span>
                  {p.cantidad}x {p.nombre} {p.variante && !String(p.nombre).includes(p.variante) ? `(${p.variante})` : ''}
                </span>
                <span className="font-semibold text-gray-800">
                  {formatGs(p.precio * p.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-sm font-extrabold text-gray-900">
            <span>Total:</span>
            <span className="text-base text-[#F85800] font-display">{formatGs(order.total)}</span>
          </div>

          <div className="text-[11px] text-gray-500 pt-1">
            📍 Entrega en: <span className="font-medium text-gray-700">{order.direccion || 'Ubicación enviada'}</span>
          </div>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#F85800] hover:bg-[#D94E00] text-white py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Abrir chat de WhatsApp de nuevo</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewOrders}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ver mis pedidos</span>
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition-all"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
