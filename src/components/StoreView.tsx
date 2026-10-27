import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Bike, 
  Search, 
  Phone, 
  Share2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { Store, Product, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { formatGs } from '../services/sheets';

interface StoreViewProps {
  store: Store;
  products: Product[];
  cartItems: CartItem[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
  onQuickRemove: (product: Product, e: React.MouseEvent) => void;
  onOpenCart: () => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  store,
  products,
  cartItems,
  onBack,
  onSelectProduct,
  onQuickAdd,
  onQuickRemove,
  onOpenCart,
}) => {
  const [searchInStore, setSearchInStore] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter products for this store
  const storeProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.local === store.id ||
        (p.local.includes('bodega') && store.id.includes('bodega')) ||
        (p.local.includes('farmacia') && store.id.includes('farmacia')) ||
        (p.local.includes('supermercado') && store.id.includes('supermercado'))
    );
  }, [products, store.id]);

  // Extract categories present in this store
  const categories = useMemo(() => {
    const set = new Set<string>();
    storeProducts.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [storeProducts]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoria === selectedCategory;
      const matchSearch =
        !searchInStore ||
        p.nombre.toLowerCase().includes(searchInStore.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchInStore.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [storeProducts, selectedCategory, searchInStore]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filteredProducts.forEach((p) => {
      const cat = p.categoria || 'Menú';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  // Calculate cart count for this specific store
  const storeCartCount = cartItems
    .filter((item) => item.localId === store.id)
    .reduce((sum, item) => sum + item.cantidad, 0);

  const storeCartTotal = cartItems
    .filter((item) => item.localId === store.id)
    .reduce((sum, item) => sum + item.cantidad * item.precio, 0);

  // Cart quantity lookup for each product
  const getProductCartQty = (prod: Product) => {
    return cartItems
      .filter((item) => item.productId === prod.key)
      .reduce((sum, item) => sum + item.cantidad, 0);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] pb-28">
      {/* Hero Banner */}
      <div className="relative h-44 sm:h-64 w-full bg-gray-900 overflow-hidden">
        <img
          src={store.banner || store.logo}
          alt={store.nombre}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        {/* Back and Action Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-lg active:scale-95 transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title="Compartir local"
            >
              {copiedLink ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <a
              href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`¡Hola ${store.nombre}! Vi su catálogo en Zory Delivery y tengo una consulta.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title="WhatsApp del local"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Store Logo floating */}
        <div className="absolute -bottom-6 left-6 z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-1.5 shadow-xl border-2 border-white overflow-hidden">
            <img
              src={store.logo}
              alt={store.nombre}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Store Header Info */}
      <div className="max-w-5xl mx-auto px-4 pt-9 sm:pt-10">
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
                  {store.nombre}
                </h1>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Abierto
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {store.ciudad}, Paraguay • {store.horario || '18:00 a 00:00 hs'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-2xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-sm text-amber-900">{store.rating || '4.8'}</span>
                <span className="text-[11px] text-amber-700">(150+ pedidos)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50">
              <span className="text-gray-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-500" /> Tiempo
              </span>
              <span className="font-bold text-gray-800 mt-0.5">{store.deliveryTime || '25-35 min'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50">
              <span className="text-gray-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                <Bike className="w-3 h-3 text-[#EA003D]" /> Envío
              </span>
              <span className="font-bold text-gray-800 mt-0.5">{formatGs(store.deliveryFee || 5000)}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50">
              <span className="text-gray-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Variedad
              </span>
              <span className="font-bold text-gray-800 mt-0.5">{storeProducts.length} productos</span>
            </div>
          </div>
        </div>

        {/* In-store Search Bar */}
        <div className="mt-5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInStore}
              onChange={(e) => setSearchInStore(e.target.value)}
              placeholder={`Buscá en el menú de ${store.nombre}...`}
              className="w-full bg-white border border-gray-200/90 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-rose-400 focus:ring-3 focus:ring-rose-500/15 outline-none shadow-xs transition-all"
            />
            {searchInStore && (
              <button
                onClick={() => setSearchInStore('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs (Sticky) */}
        {categories.length > 0 && (
          <div className="sticky top-[105px] z-20 bg-[#F6F7F9]/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#EA003D] text-white shadow-md shadow-rose-500/20'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todo ({storeProducts.length})
              </button>
              {categories.map((cat) => {
                const count = storeProducts.filter((p) => p.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#EA003D] text-white shadow-md shadow-rose-500/20'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Products List grouped or filtered */}
        <div className="mt-4 space-y-8">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#EA003D] flex items-center justify-center mx-auto mb-3 text-2xl">
                🔍
              </div>
              <h3 className="font-extrabold text-gray-800 text-lg">No encontramos productos</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No hay productos que coincidan con &quot;{searchInStore}&quot;. Probá con otra búsqueda o limpiá los filtros.
              </p>
              <button
                onClick={() => {
                  setSearchInStore('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Ver todos los platos
              </button>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([categoria, prods]) => (
              <section key={categoria} className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                  <h2 className="text-lg font-extrabold text-gray-900 font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EA003D]" />
                    {categoria}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {prods.length} {prods.length === 1 ? 'ítem' : 'ítems'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {prods.map((product) => (
                    <ProductCard
                      key={product.key}
                      product={product}
                      quantityInCart={getProductCartQty(product)}
                      onSelect={onSelectProduct}
                      onQuickAdd={onQuickAdd}
                      onQuickRemove={onQuickRemove}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar (PedidosYa style) */}
      {storeCartCount > 0 && (
        <div className="fixed bottom-[74px] left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#EA003D] hover:bg-[#d40037] text-white p-4 rounded-2xl font-extrabold shadow-xl shadow-rose-500/30 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                {storeCartCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-white/80 block font-normal">Tu pedido</span>
                <span className="text-sm font-black font-display">{formatGs(storeCartTotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-white text-[#EA003D] px-3.5 py-2 rounded-xl shadow-xs">
              <span>Ver Carrito</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
