import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ShoppingBag, 
  AlertCircle,
  Sparkles,
  Navigation,
  Check
} from 'lucide-react';
import type { CartItem, Store, OrderCustomerInfo } from '../types';
import { formatGs } from '../services/sheets';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  stores: Store[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
  onProceedToOrder: (customerInfo: OrderCustomerInfo, store: Store) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  stores,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToOrder,
}) => {
  // Stored customer info
  const [nombre, setNombre] = useState(() => localStorage.getItem('zori_customer_name') || '');
  const [telefono, setTelefono] = useState(() => localStorage.getItem('zori_customer_phone') || '');
  const [direccion, setDireccion] = useState(() => localStorage.getItem('zori_customer_address') || '');
  const [gpsLocation, setGpsLocation] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [pagaCon, setPagaCon] = useState('');
  const [notas, setNotas] = useState('');
  const [validationError, setValidationError] = useState('');

  // Primary store associated with cart items
  const primaryStoreId = cartItems[0]?.localId;
  const store = stores.find((s) => s.id === primaryStoreId) || stores[0];

  useEffect(() => {
    if (nombre) localStorage.setItem('zori_customer_name', nombre);
    if (telefono) localStorage.setItem('zori_customer_phone', telefono);
    if (direccion) localStorage.setItem('zori_customer_address', direccion);
  }, [nombre, telefono, direccion]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const deliveryFee = store?.deliveryFee ?? 10000;
  const total = subtotal + deliveryFee;

  // Change calculation for cash payment
  const pagaConNum = parseInt(pagaCon.replace(/\D/g, ''), 10);
  const vuelto = !isNaN(pagaConNum) && pagaConNum > total ? pagaConNum - total : 0;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        setGpsLocation(link);
        if (!direccion) {
          setDireccion(`Ubicación GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
        alert('No pudimos acceder a tu ubicación. Podés escribir tu dirección manualmente.');
      },
      { timeout: 10000 }
    );
  };

  const handleConfirmOrder = () => {
    if (!nombre.trim()) {
      setValidationError('Por favor ingresá tu nombre para identificarte.');
      return;
    }
    if (!direccion.trim() && !gpsLocation) {
      setValidationError('Por favor ingresá tu dirección de entrega o compartí tu ubicación.');
      return;
    }
    if (!store) {
      setValidationError('No se pudo identificar el local del pedido.');
      return;
    }

    setValidationError('');
    onProceedToOrder(
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        ubicacionGps: gpsLocation,
        metodoPago,
        pagaCon: metodoPago === 'efectivo' && pagaCon ? pagaCon : undefined,
        notas: notas.trim(),
      },
      store
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#F85800] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-display">
                Tu Pedido
              </h3>
              <p className="text-[11px] text-gray-500">
                {store ? store.nombre : 'Zory Delivery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                title="Vaciar carrito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 font-display">
              Tu carrito está vacío
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Elegí platos deliciosos de tus locales favoritos en Ayolas y hacé tu pedido.
            </p>
            <button
              onClick={onClose}
              className="mt-5 bg-[#F85800] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-[#D94E00] transition-all"
            >
              Explorar menú
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Store Banner Mini */}
            {store && (
              <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-2xl border border-rose-100/80">
                <img
                  src={store.logo}
                  alt={store.nombre}
                  className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#F85800] font-extrabold uppercase tracking-wider block">
                    Local seleccionado
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 truncate font-display">
                    {store.nombre}
                  </h4>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Platos seleccionados ({cartItems.reduce((a, b) => a + b.cantidad, 0)})
              </span>

              {cartItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate font-display">
                      {item.nombre}
                    </h5>
                    {item.variante && (
                      <span className="text-[11px] font-semibold text-[#F85800] block">
                        • {item.variante}
                      </span>
                    )}
                    {item.instrucciones && (
                      <span className="text-[10px] text-gray-500 italic block truncate">
                        💬 &quot;{item.instrucciones}&quot;
                      </span>
                    )}
                    <span className="text-xs font-black text-gray-800 font-display mt-0.5 block">
                      {formatGs(item.precio * item.cantidad)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 shadow-xs border border-gray-200/60">
                    <button
                      onClick={() => onUpdateQuantity(item.key, -1)}
                      className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black w-5 text-center text-gray-900">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.key, 1)}
                      className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery & Customer Info Form */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Datos de Entrega
              </span>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Tu nombre y apellido: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 0982 123 456"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-700">
                    Dirección / Casa: <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gpsLoading}
                    className="text-[11px] text-[#F85800] hover:underline font-bold flex items-center gap-1"
                  >
                    <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLocation ? 'GPS capturado ✓' : 'Usar mi GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Barrio San José Obrero, frente a la plaza"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 outline-none"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-gray-700 block">
                  Método de pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('efectivo')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      metodoPago === 'efectivo'
                        ? 'border-[#F85800] bg-rose-50/60 text-[#F85800] font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[11px]">Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('transferencia')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      metodoPago === 'transferencia'
                        ? 'border-[#F85800] bg-rose-50/60 text-[#F85800] font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[11px]">Transf. / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('tarjeta')}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      metodoPago === 'tarjeta'
                        ? 'border-[#F85800] bg-rose-50/60 text-[#F85800] font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px]">POS / Tarjeta</span>
                  </button>
                </div>

                {metodoPago === 'efectivo' && (
                  <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-600">¿Con cuánto pagás? (vuelto)</span>
                    <input
                      type="text"
                      value={pagaCon}
                      onChange={(e) => setPagaCon(e.target.value)}
                      placeholder="Ej: 100.000"
                      className="w-28 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-right font-bold text-gray-800"
                    />
                  </div>
                )}
                {vuelto > 0 && (
                  <div className="text-[11px] text-emerald-600 font-bold text-right">
                    Tu vuelto estimado: {formatGs(vuelto)}
                  </div>
                )}
              </div>

              {/* Validation alert */}
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-[#F85800] rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with totals and action button */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-100 space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">{formatGs(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Costo de envío estimado</span>
                <span className="font-semibold text-gray-700">{formatGs(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total a pagar</span>
                <span className="text-base text-[#F85800] font-display">{formatGs(total)}</span>
              </div>
            </div>

            {/* 3-Second Trigger Button */}
            <button
              onClick={handleConfirmOrder}
              className="w-full bg-[#F85800] hover:bg-[#D94E00] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between shadow-xl shadow-rose-500/25 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Confirmar Pedido</span>
              </div>
              <span className="font-display">{formatGs(total)}</span>
            </button>
            <p className="text-[10px] text-center text-gray-400">
              ⚡ Al confirmar, verás el efecto de 3 segundos de Zory antes de despachar a WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
