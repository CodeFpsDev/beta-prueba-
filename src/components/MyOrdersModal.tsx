import React from 'react';
import { X, Clock, MessageSquare, CheckCircle, Package, ArrowUpRight } from 'lucide-react';
import type { OrderRecord } from '../types';
import { formatGs } from '../services/sheets';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#F85800] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-display">
                Mis Pedidos Recientes
              </h3>
              <p className="text-[11px] text-gray-500">
                Historial de pedidos realizados en tu dispositivo
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

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-700 font-display">Aún no realizaste pedidos</h4>
              <p className="text-xs text-gray-400 mt-1">
                Tus pedidos aparecerán aquí con su estado y detalle.
              </p>
            </div>
          ) : (
            orders.map((ord, idx) => (
              <div
                key={ord.id || idx}
                className="p-4 bg-gray-50/90 rounded-2xl border border-gray-100 space-y-2 hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 font-display">
                      {ord.tienda}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Enviado
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{ord.hora}</span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  {ord.productos.map((p, pIdx) => (
                    <div key={pIdx} className="flex justify-between">
                      <span>{p.cantidad}x {p.nombre} {p.variante ? `(${p.variante})` : ''}</span>
                      <span className="font-semibold text-gray-800">{formatGs(p.precio * p.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-gray-900">
                  <span>Total con envío:</span>
                  <span className="text-sm text-[#F85800] font-display">{formatGs(ord.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
