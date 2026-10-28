import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bike, 
  Sparkles, 
  Database, 
  CheckCircle, 
  X, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import type { CartItem, Store, OrderCustomerInfo } from '../types';
import { formatGs } from '../services/sheets';

interface OrderCountdownModalProps {
  store: Store;
  cartItems: CartItem[];
  customerInfo: OrderCustomerInfo;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onCancel: () => void;
  onComplete: () => void;
}

export const OrderCountdownModal: React.FC<OrderCountdownModalProps> = ({
  store,
  cartItems,
  customerInfo,
  subtotal,
  deliveryFee,
  total,
  onCancel,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [stageText, setStageText] = useState('Preparando tu pedido...');
  const [stageIcon, setStageIcon] = useState<'order' | 'kitchen' | 'done'>('order');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Stage updates over the 3 seconds
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 3) {
      setStageText('Preparando tu pedido...');
      setStageIcon('order');
    } else if (secondsLeft === 2) {
      setStageText(`Notificando a la cocina de ${store.nombre}...`);
      setStageIcon('kitchen');
    } else if (secondsLeft === 1) {
      setStageText('¡Listo! Abriendo WhatsApp con tu pedido...');
      setStageIcon('done');
    } else if (secondsLeft === 0) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F85800', '#F85800', '#FFA630', '#FFD700', '#FFFFFF'],
        });
      } catch (e) {}

      // Trigger completion callback
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [secondsLeft, store.nombre, onComplete]);

  // Stroke calculation for circular countdown progress (radius 52, perimeter ~326)
  const strokeDashoffset = 326 - (326 * (3 - secondsLeft)) / 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top subtle badge */}
        <div className="inline-flex items-center gap-1 bg-rose-50 text-[#F85800] text-[11px] font-extrabold uppercase px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Confirmación Inteligente</span>
        </div>

        <h3 className="text-xl font-black text-gray-900 font-display">
          {secondsLeft > 0 ? 'Enviando tu Pedido...' : '¡Pedido Confirmado! 🎉'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {store.nombre} • Total: <strong className="text-gray-900">{formatGs(total)}</strong>
        </p>

        {/* 3-Second Circular Countdown Animation */}
        <div className="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="52"
              stroke="#F3F4F6"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="52"
              stroke="#F85800"
              strokeWidth="8"
              strokeDasharray="326"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Number / Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {secondsLeft > 0 ? (
              <>
                <span className="text-4xl font-black text-[#F85800] font-display animate-pulse">
                  {secondsLeft}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  segundos
                </span>
              </>
            ) : (
              <CheckCircle className="w-14 h-14 text-emerald-500 animate-in zoom-in-50 duration-300" />
            )}
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-5 flex items-center justify-center gap-2">
          {stageIcon === 'order' && <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />}
          {stageIcon === 'kitchen' && <Bike className="w-4 h-4 text-[#F85800] animate-bounce" />}
          {stageIcon === 'done' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
          <span className="text-xs font-semibold text-gray-700">{stageText}</span>
        </div>

        {/* Security & safety note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mb-5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Pedido seguro sincronizado con Zory Delivery</span>
        </div>

        {/* Cancel Button during the 3 seconds */}
        {secondsLeft > 0 ? (
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              onCancel();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancelar pedido ({secondsLeft}s)</span>
          </button>
        ) : (
          <div className="text-xs font-bold text-emerald-600 animate-pulse">
            Redirigiendo a WhatsApp...
          </div>
        )}
      </div>
    </div>
  );
};
