import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StoreCard 
} from './components/StoreCard';
import { Header } from './components/Header';
import { CategoryChips } from './components/CategoryChips';
import { PromoBanners } from './components/PromoBanners';
import { StoreView } from './components/StoreView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderCountdownModal } from './components/OrderCountdownModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { AddStoreModal } from './components/AddStoreModal';
import { BottomNavBar } from './components/BottomNavBar';
import { ReviewModal } from './components/ReviewModal';
import { RuletaModal } from './components/RuletaModal';
import type { 
  Store, 
  Product, 
  ProductVariant, 
  CartItem, 
  OrderCustomerInfo, 
  OrderRecord 
} from './types';
import { 
  fetchStoreData, 
  formatGs, 
  slug, 
  norm, 
  getStoredSheetConfig 
} from './services/sheets';
import { registrarPedidoEnFirebase } from './services/firebase';
import { Store as StoreIcon, AlertTriangle, RefreshCw, Sparkles, Phone, MessageSquare } from 'lucide-react';

export default function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedCity, setSelectedCity] = useState<string>(() => localStorage.getItem('zori-ciudad') || 'Ayolas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zori_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRuletaOpen, setIsRuletaOpen] = useState(false);

  // 3-second Countdown & Order State
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [pendingCustomerInfo, setPendingCustomerInfo] = useState<OrderCustomerInfo | null>(null);
  const [pendingStore, setPendingStore] = useState<Store | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Order history
  const [ordersHistory, setOrdersHistory] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('zori_orders_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zori_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Error saving cart:', e);
    }
  }, [cartItems]);

  // Load Catalog Data (Google Sheets with fallback)
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      const result = await fetchStoreData(forceRefresh);
      setStores(result.locales);
      setProducts(result.productos);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('No pudimos conectar con el catálogo. Verificá tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Handle URL Param ?id=... (retains compatibility with original app `local.html?id=bacoa`)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeIdParam = params.get('id') || params.get('local');
    if (storeIdParam && stores.length > 0) {
      const matched = stores.find((s) => s.id === slug(storeIdParam));
      if (matched) {
        setActiveStoreId(matched.id);
      }
    }
  }, [stores]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('zori-ciudad', city);
    } catch {}
  };

  const handleSelectStore = (store: Store) => {
    setActiveStoreId(store.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(store.id)}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleBackToHome = () => {
    setActiveStoreId(null);
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart helpers
  const handleAddToCart = (
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
    instructions: string
  ) => {
    const key = variant ? `${product.key}::${slug(variant.etiqueta)}` : product.key;
    const price = variant ? variant.precio : product.precio || 0;
    const name = variant ? `${product.nombre} (${variant.etiqueta})` : product.nombre;

    setCartItems((prev) => {
      // If adding from a different store, ask or reset to maintain single store delivery
      const differentStore = prev.length > 0 && prev[0].localId !== product.local;
      let base = differentStore ? [] : [...prev];

      const existingIndex = base.findIndex((i) => i.key === key && i.instrucciones === instructions);
      if (existingIndex >= 0) {
        base[existingIndex] = {
          ...base[existingIndex],
          cantidad: base[existingIndex].cantidad + quantity,
        };
        return base;
      }

      return [
        ...base,
        {
          key,
          productId: product.key,
          localId: product.local,
          nombre: name,
          precio: price,
          cantidad: quantity,
          variante: variant?.etiqueta,
          instrucciones: instructions,
          imagen: product.imagen,
        },
      ];
    });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variantes && product.variantes.length > 0) {
      setModalProduct(product);
    } else {
      handleAddToCart(product, undefined, 1, '');
    }
  };

  const handleQuickRemove = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.key);
      if (idx < 0) return prev;
      if (prev[idx].cantidad <= 1) {
        return prev.filter((_, i) => i !== idx);
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad - 1 };
      return updated;
    });
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Flow: Proceed to 3-second countdown
  const handleProceedToOrder = (customerInfo: OrderCustomerInfo, store: Store) => {
    setPendingCustomerInfo(customerInfo);
    setPendingStore(store);
    setIsCartOpen(false);
    setIsCountdownOpen(true);
  };

  // When the 3-second countdown completes:
  const handleOrderConfirmedAfter3Seconds = async () => {
    if (!pendingStore || !pendingCustomerInfo || cartItems.length === 0) return;

    const subtotal = cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    const deliveryFee = pendingStore.deliveryFee || 5000;
    const total = subtotal + deliveryFee;
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Prepare Order Record
    const orderData: Omit<OrderRecord, 'creado'> = {
      cliente: pendingCustomerInfo.nombre,
      telefono: pendingCustomerInfo.telefono,
      direccion: pendingCustomerInfo.direccion,
      ubicacionGps: pendingCustomerInfo.ubicacionGps,
      tienda: pendingStore.nombre,
      tiendaId: pendingStore.id,
      productos: cartItems.map((i) => ({
        cantidad: i.cantidad,
        nombre: i.nombre,
        precio: i.precio,
        variante: i.variante,
        instrucciones: i.instrucciones,
      })),
      subtotal,
      costoEnvio: deliveryFee,
      total,
      metodoPago: pendingCustomerInfo.metodoPago,
      pagaCon: pendingCustomerInfo.pagaCon,
      notas: pendingCustomerInfo.notas,
      estado: 'pendiente',
      hora,
    };

    // 2. Save into Firebase Firestore (as requested)
    registrarPedidoEnFirebase(orderData).catch((err) =>
      console.warn('Registro Firestore diferido:', err)
    );

    // 3. Save into local orders history
    const finalOrderRecord: OrderRecord = {
      ...orderData,
      id: `zori-${Date.now()}`,
      creado: new Date().toISOString(),
    };

    setOrdersHistory((prev) => {
      const updated = [finalOrderRecord, ...prev];
      try {
        localStorage.setItem('zori_orders_history', JSON.stringify(updated.slice(0, 30)));
      } catch {}
      return updated;
    });

    // 4. Build formatted WhatsApp message (in Spanish, clean PedidosYa style)
    let paymentDesc = 'Efectivo';
    if (pendingCustomerInfo.metodoPago === 'transferencia') paymentDesc = 'Transferencia Bancaria / QR';
    if (pendingCustomerInfo.metodoPago === 'tarjeta') paymentDesc = 'Tarjeta / POS contra entrega';
    if (pendingCustomerInfo.metodoPago === 'efectivo' && pendingCustomerInfo.pagaCon) {
      paymentDesc += ` (Paga con: Gs. ${pendingCustomerInfo.pagaCon})`;
    }

    let msg = `🛵 *NUEVO PEDIDO - ZORY DELIVERY*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏪 *Local:* ${pendingStore.nombre}\n`;
    msg += `👤 *Cliente:* ${pendingCustomerInfo.nombre}\n`;
    if (pendingCustomerInfo.telefono) {
      msg += `📞 *Teléfono:* ${pendingCustomerInfo.telefono}\n`;
    }
    msg += `📍 *Dirección de entrega:* ${pendingCustomerInfo.direccion}\n`;
    if (pendingCustomerInfo.ubicacionGps) {
      msg += `🗺️ *Ubicación GPS:* ${pendingCustomerInfo.ubicacionGps}\n`;
    }
    msg += `💳 *Método de pago:* ${paymentDesc}\n\n`;

    msg += `📋 *DETALLE DEL PEDIDO:*\n`;
    cartItems.forEach((it) => {
      msg += `• *${it.cantidad}x* ${it.nombre} - ${formatGs(it.precio * it.cantidad)}\n`;
      if (it.instrucciones) {
        msg += `   💬 _"${it.instrucciones}"_\n`;
      }
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal: ${formatGs(subtotal)}\n`;
    msg += `Costo de envío: ${formatGs(deliveryFee)}\n`;
    msg += `💰 *TOTAL A PAGAR: ${formatGs(total)}*\n`;
    if (pendingCustomerInfo.notas) {
      msg += `\n📝 *Nota general:* ${pendingCustomerInfo.notas}\n`;
    }
    msg += `\n_Pedido enviado vía Zory Delivery_`;

    const targetWhatsApp = pendingStore.whatsapp || getStoredSheetConfig().defaultWhatsApp;
    const finalWaUrl = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(msg)}`;
    setWhatsappUrl(finalWaUrl);
    setCompletedOrder(finalOrderRecord);

    // Open WhatsApp in a new tab
    try {
      window.open(finalWaUrl, '_blank');
    } catch (e) {
      console.warn('Popup blocked, will use button in modal');
    }

    // Clear cart and switch modals
    setCartItems([]);
    setIsCountdownOpen(false);
    setIsSuccessOpen(true);
  };

  // Filtered stores
  const filteredStores = useMemo(() => {
    let result = [...stores];

    // Category filter
    if (selectedCategory === 'vendidos') {
      result = result.filter((s) => s.destacado);
    } else if (selectedCategory !== 'todos') {
      result = result.filter((s) => s.categorias.includes(slug(selectedCategory)));
    }

    // Search query filter (matches store name OR products inside store)
    if (searchQuery.trim()) {
      const q = norm(searchQuery);
      // find store IDs that have products matching query
      const matchingStoreIds = new Set(
        products.filter((p) => norm(p.nombre).includes(q) || norm(p.descripcion).includes(q)).map((p) => p.local)
      );

      result = result.filter((s) => norm(s.nombre).includes(q) || matchingStoreIds.has(s.id));
    }

    return result;
  }, [stores, products, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: stores.length,
      vendidos: stores.filter((s) => s.destacado).length,
    };
    stores.forEach((s) => {
      s.categorias.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [stores]);

  const activeStore = useMemo(() => {
    return stores.find((s) => s.id === activeStoreId) || null;
  }, [stores, activeStoreId]);

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.cantidad, 0);
  const totalCartAmount = cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900 selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Header */}
      <Header
        totalCartItems={totalCartCount}
        cartTotal={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenAddStore={() => setIsAddStoreOpen(true)}
        selectedCity={selectedCity}
        onSelectCity={handleCityChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStoreName={activeStore ? activeStore.nombre : undefined}
        onBackToHome={activeStore ? handleBackToHome : undefined}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-100 border-t-[#EA003D] animate-spin" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EA003D] to-[#FF4B2B] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                Z
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 font-display">
              Cargando Zory Delivery...
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Cargando los mejores locales y platos de Ayolas...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-red-100 text-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 font-display">No pudimos conectar</h3>
            <p className="text-xs text-gray-600 mt-1 mb-4">{error}</p>
            <button
              onClick={() => loadData(true)}
              className="bg-[#EA003D] hover:bg-[#d40037] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 mx-auto shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar conexión</span>
            </button>
          </div>
        ) : activeStore ? (
          /* Single Store View */
          <StoreView
            store={activeStore}
            products={products}
            cartItems={cartItems}
            onBack={handleBackToHome}
            onSelectProduct={(p) => setModalProduct(p)}
            onQuickAdd={handleQuickAdd}
            onQuickRemove={handleQuickRemove}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          /* Store Catalog / Home View (PedidosYa style) */
          <div className="max-w-6xl mx-auto pb-20">
            {/* Promo Banners */}
            <PromoBanners
              onOpenAddStore={() => setIsAddStoreOpen(true)}
            />

            {/* Category Chips Bar */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
            />

            {/* Store Listing Section */}
            <div id="seccion-locales" className="px-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display flex items-center gap-2">
                    <span>
                      {selectedCategory === 'vendidos'
                        ? 'Los más pedidos 🔥'
                        : selectedCategory === 'todos'
                        ? 'Locales Disponibles'
                        : `Locales de ${selectedCategory.toUpperCase()}`}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredStores.length} {filteredStores.length === 1 ? 'local abierto' : 'locales abiertos'} en {selectedCity}
                  </p>
                </div>
              </div>

              {filteredStores.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-6">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-[#EA003D] flex items-center justify-center mx-auto mb-3 text-2xl">
                    🏪
                  </div>
                  <h3 className="font-extrabold text-gray-800 text-lg">No hay locales en esta categoría</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Probá seleccionando otra categoría o explorá todos los locales.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('todos');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-[#EA003D] text-white text-xs font-bold rounded-xl"
                  >
                    Ver todos los locales
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStores.map((st) => {
                    const storeProds = products.filter(
                      (p) =>
                        p.local === st.id ||
                        (p.local.includes('bodega') && st.id.includes('bodega')) ||
                        (p.local.includes('farmacia') && st.id.includes('farmacia')) ||
                        (p.local.includes('supermercado') && st.id.includes('supermercado'))
                    );
                    return (
                      <StoreCard
                        key={st.id}
                        store={st}
                        productCount={storeProds.length}
                        onClick={() => handleSelectStore(st)}
                      />
                    );
                  })}

                  {/* Add store partner card */}
                  <div
                    onClick={() => setIsAddStoreOpen(true)}
                    className="bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 rounded-3xl p-6 border-2 border-dashed border-purple-200/80 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white text-purple-600 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                      <StoreIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-100/60 px-2.5 py-0.5 rounded-full mb-1.5">
                      ¡Unite a Zory!
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900 font-display">
                      ¿Tenés un local o delivery?
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Publicá tu menú digital y recibí pedidos directos a tu WhatsApp.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs">
                      Sumar mi negocio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart pill if not on store view or if cart has items */}
      {!activeStore && totalCartCount > 0 && (
        <div className="fixed bottom-[74px] left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#EA003D] hover:bg-[#d40037] text-white p-4 rounded-2xl font-extrabold shadow-xl shadow-rose-500/30 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                {totalCartCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-white/80 block font-normal">Carrito activo</span>
                <span className="text-sm font-black font-display">{formatGs(totalCartAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-white text-[#EA003D] px-3.5 py-2 rounded-xl shadow-xs">
              <span>Ver Carrito</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile App Style Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={activeStoreId ? 'locales' : selectedCategory === 'todos' && !searchQuery ? 'inicio' : 'locales'}
        onNavigateHome={() => {
          handleBackToHome();
          setSelectedCategory('todos');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLocales={() => {
          handleBackToHome();
          setSelectedCategory('todos');
          setSearchQuery('');
          setTimeout(() => {
            const el = document.getElementById('seccion-locales');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }}
        onOpenReviewModal={() => setIsReviewOpen(true)}
        onOpenRuletaModal={() => setIsRuletaOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartItemCount={totalCartCount}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4 text-center text-xs text-gray-400 mt-auto pb-24">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-gray-800 font-display">
              zori<span className="text-[#EA003D]">delivery</span>
            </span>
            <span className="text-gray-300">•</span>
            <span>Ayolas, Misiones, Paraguay 🇵🇾</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsAddStoreOpen(true)}
              className="hover:text-gray-700 underline transition-colors"
            >
              Sumar mi local
            </button>
          </div>
        </div>
      </footer>

      {/* Review Anonymous Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />

      {/* Ruleta "¿Qué ceno hoy?" Modal */}
      <RuletaModal
        isOpen={isRuletaOpen}
        onClose={() => setIsRuletaOpen(false)}
        onSearchDish={(dishQuery) => {
          handleBackToHome();
          setSearchQuery(dishQuery);
          setTimeout(() => {
            const el = document.getElementById('seccion-locales');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
      />

      {/* Product Detail Modal (for variants and special instructions) */}
      <ProductDetailModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        stores={stores}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToOrder={handleProceedToOrder}
      />

      {/* 3-Second Animated Confirmation Countdown Modal */}
      {isCountdownOpen && pendingStore && pendingCustomerInfo && (
        <OrderCountdownModal
          store={pendingStore}
          cartItems={cartItems}
          customerInfo={pendingCustomerInfo}
          subtotal={cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0)}
          deliveryFee={pendingStore.deliveryFee || 5000}
          total={cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0) + (pendingStore.deliveryFee || 5000)}
          onCancel={() => {
            setIsCountdownOpen(false);
            setIsCartOpen(true);
          }}
          onComplete={handleOrderConfirmedAfter3Seconds}
        />
      )}

      {/* Order Success Receipt Modal */}
      <OrderSuccessModal
        order={completedOrder}
        whatsappUrl={whatsappUrl}
        onClose={() => setIsSuccessOpen(false)}
        onViewOrders={() => {
          setIsSuccessOpen(false);
          setIsMyOrdersOpen(true);
        }}
      />

      {/* My Orders Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={ordersHistory}
      />

      {/* Add Store Partner Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
      />
    </div>
  );
}
