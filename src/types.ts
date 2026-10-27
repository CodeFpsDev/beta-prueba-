export interface Store {
  id: string;
  nombre: string;
  categoria: string;
  categorias: string[];
  destacado: boolean;
  logo: string;
  banner: string;
  whatsapp: string;
  ciudad: string;
  activo: boolean;
  horario?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
}

export interface ProductVariant {
  etiqueta: string;
  precio: number;
}

export interface Product {
  key: string;
  local: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number | null;
  variantes: ProductVariant[];
  imagen: string;
  disponible: boolean;
  nombrePedido: string;
}

export interface CartItem {
  key: string;
  productId: string;
  localId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  variante?: string;
  instrucciones?: string;
  imagen?: string;
}

export interface OrderCustomerInfo {
  nombre: string;
  telefono: string;
  direccion: string;
  ubicacionGps?: string;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta';
  pagaCon?: string;
  notas?: string;
}

export interface OrderRecord {
  id?: string;
  cliente: string;
  telefono?: string;
  direccion?: string;
  ubicacionGps?: string;
  tienda: string;
  tiendaId: string;
  productos: {
    cantidad: number;
    nombre: string;
    precio: number;
    variante?: string;
    instrucciones?: string;
  }[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string;
  pagaCon?: string;
  notas?: string;
  estado: 'pendiente' | 'confirmado' | 'en_camino' | 'entregado';
  hora: string;
  creado: any;
}

export interface SheetConfig {
  sheetId: string;
  tabLocales: string;
  tabProductos: string;
  cacheMinutes: number;
  defaultWhatsApp: string;
}
