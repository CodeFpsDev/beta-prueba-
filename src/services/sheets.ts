import type { Store, Product, ProductVariant, SheetConfig } from '../types';
import rawLocalesCSV from '../data/locales.csv?raw';
import rawProductosCSV from '../data/productos.csv?raw';
import { EXTRA_DEFAULT_STORES, EXTRA_DEFAULT_PRODUCTS } from './catalogDefaults';

export const DEFAULT_SHEET_CONFIG: SheetConfig = {
  sheetId: "1SykSOH61COs6gVVO1yLHw69l074qPx6eSABYk3xfcF8",
  tabLocales: "Locales",
  tabProductos: "Productos",
  cacheMinutes: 5,
  defaultWhatsApp: "595982309464",
};

const GITHUB_ASSETS_BASE = "https://raw.githubusercontent.com/zorydelivery-ship-it/zory-beta-2.0/main/";

export function getStoredSheetConfig(): SheetConfig {
  return DEFAULT_SHEET_CONFIG;
}

export const norm = (s: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const slug = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const si = (v: any) => !['no', 'n', '0', 'false', 'agotado', 'inactivo'].includes(norm(v));

export function formatGs(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Gs. 0';
  return 'Gs. ' + Number(amount).toLocaleString('es-PY');
}

export function resolveImageUrl(url: string | undefined | null, type: 'locales' | 'productos' = 'productos'): string {
  const val = String(url || '').trim();
  if (!val) {
    if (type === 'locales') {
      return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
  }
  if (/^(https?:)?\/\//.test(val) || val.startsWith('data:')) {
    return val;
  }
  // GitHub repo file
  return `${GITHUB_ASSETS_BASE}${encodeURIComponent(val)}`;
}

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let insideQuote = false;

  text = text.replace(/^\uFEFF/, ''); // Strip BOM

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (insideQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuote = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      insideQuote = true;
    } else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') {
        i++;
      }
      row.push(cur);
      cur = '';
      if (row.some((x) => x.trim() !== '')) {
        rows.push(row);
      }
      row = [];
    } else {
      cur += c;
    }
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== '')) {
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => norm(h).replace(/\s+/g, '_'));
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim();
    });
    return obj;
  });
}

export function parseVariantes(txt: string | undefined): ProductVariant[] {
  if (!txt) return [];
  return String(txt)
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const idx = x.lastIndexOf(':');
      if (idx < 0) return null;
      const precio = parseInt(x.slice(idx + 1).replace(/\D/g, ''), 10);
      return isNaN(precio) ? null : { etiqueta: x.slice(0, idx).trim(), precio };
    })
    .filter((v): v is ProductVariant => v !== null);
}

export function normalizeData(rawLocales: Record<string, string>[], rawProductos: Record<string, string>[]) {
  const config = getStoredSheetConfig();

  const locales: Store[] = rawLocales
    .filter((l) => l.id && l.nombre && si(l.activo || 'si'))
    .map((l, index) => {
      const id = slug(l.id);
      const cats = (l.categoria || 'restaurantes')
        .split(/[,;]/)
        .map((c) => slug(c))
        .filter(Boolean);

      // Auto-tag postres for known ice cream and dessert stores
      if (
        id === 'amandau' ||
        id === 'francol' ||
        id === 'acai' ||
        norm(l.nombre).includes('acai') ||
        norm(l.nombre).includes('amandau') ||
        norm(l.nombre).includes('helad') ||
        norm(l.nombre).includes('postre')
      ) {
        if (!cats.includes('postres')) cats.push('postres');
      }

      // Default ratings and times for polish
      const baseRating = 4.5 + ((index * 3) % 5) * 0.1;
      const baseTime = 20 + ((index * 5) % 25);

      return {
        id,
        nombre: l.nombre,
        categoria: l.categoria || 'restaurantes',
        categorias: cats.length > 0 ? cats : ['restaurantes'],
        destacado: l.destacado ? !['no', '', '0'].includes(norm(l.destacado)) : false,
        logo: resolveImageUrl(l.logo, 'locales'),
        banner: resolveImageUrl(l.banner || l.logo, 'locales'),
        whatsapp: String(l.whatsapp || '').replace(/\D/g, '') || config.defaultWhatsApp,
        ciudad: l.ciudad || 'Ayolas',
        activo: si(l.activo || 'si'),
        horario: l.horario || '18:00 a 00:00 hs',
        rating: Number(baseRating.toFixed(1)),
        deliveryTime: `${baseTime}-${baseTime + 15} min`,
        deliveryFee: 5000,
      };
    });

  // Ensure Bodega, Farmacia and Supermercados stores exist so they are never missing
  EXTRA_DEFAULT_STORES.forEach((extraStore) => {
    const exists = locales.some(
      (l) => l.id === extraStore.id || l.categorias.some((c) => extraStore.categorias.includes(c))
    );
    if (!exists) {
      locales.push(extraStore);
    }
  });

  const validStoreIds = new Set(locales.map((l) => l.id));
  validStoreIds.add('bodega');
  validStoreIds.add('farmacia');
  validStoreIds.add('supermercados');

  const productos: Product[] = rawProductos
    .filter((p) => p.local && p.nombre && (validStoreIds.has(slug(p.local)) || slug(p.local).includes('bodega') || slug(p.local).includes('farmacia') || slug(p.local).includes('supermercado')))
    .map((p, i) => {
      const variantes = parseVariantes(p.variantes);
      const rawPrice = parseInt(String(p.precio || '').replace(/\D/g, ''), 10);
      const precio = isNaN(rawPrice) ? (variantes.length > 0 ? variantes[0].precio : null) : rawPrice;
      const localId = slug(p.local);

      return {
        key: `${localId}#${i}`,
        local: localId,
        categoria: p.categoria || 'General',
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio,
        variantes,
        imagen: resolveImageUrl(p.imagen, 'productos'),
        disponible: si(p.disponible || 'si'),
        nombrePedido: p.nombre_pedido || p.nombre,
      };
    })
    .filter((p) => p.variantes.length > 0 || p.precio !== null);

  // If bodega, farmacia or supermercados don't have products in the sheet, ensure full catalog is present!
  const hasBodegaProds = productos.some((p) => p.local.includes('bodega'));
  if (!hasBodegaProds) {
    productos.push(...EXTRA_DEFAULT_PRODUCTS.filter((p) => p.local === 'bodega'));
  }

  const hasFarmaciaProds = productos.some((p) => p.local.includes('farmacia'));
  if (!hasFarmaciaProds) {
    productos.push(...EXTRA_DEFAULT_PRODUCTS.filter((p) => p.local === 'farmacia'));
  }

  const hasSuperProds = productos.some((p) => p.local.includes('supermercado'));
  if (!hasSuperProds) {
    productos.push(...EXTRA_DEFAULT_PRODUCTS.filter((p) => p.local === 'supermercados'));
  }

  return { locales, productos };
}

export interface FetchResult {
  locales: Store[];
  productos: Product[];
  source: 'google_sheets' | 'fallback_csv' | 'cache';
  lastUpdated: string;
}

export async function fetchStoreData(forceRefresh = false): Promise<FetchResult> {
  const config = getStoredSheetConfig();
  const CACHE_KEY = 'zori_datos_cache';
  const now = Date.now();

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (now - parsed.timestamp < config.cacheMinutes * 60 * 1000 && parsed.sheetId === config.sheetId) {
          return {
            locales: parsed.locales,
            productos: parsed.productos,
            source: 'cache',
            lastUpdated: parsed.lastUpdated || new Date().toLocaleTimeString(),
          };
        }
      }
    } catch (e) {
      console.warn('Error reading data cache:', e);
    }
  }

  // Attempt 1: Google Sheets GViz endpoint
  if (config.sheetId) {
    try {
      const baseUrl = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=`;
      
      const [resLocales, resProductos] = await Promise.all([
        fetch(baseUrl + encodeURIComponent(config.tabLocales), { cache: 'no-store' }),
        fetch(baseUrl + encodeURIComponent(config.tabProductos), { cache: 'no-store' }),
      ]);

      if (!resLocales.ok || !resProductos.ok) {
        throw new Error(`Google Sheets HTTP status: ${resLocales.status} / ${resProductos.status}`);
      }

      const [textLocales, textProductos] = await Promise.all([
        resLocales.text(),
        resProductos.text(),
      ]);

      const rawLocales = parseCSV(textLocales);
      const rawProductos = parseCSV(textProductos);

      if (rawLocales.length > 0 && rawProductos.length > 0) {
        const { locales, productos } = normalizeData(rawLocales, rawProductos);
        const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: now,
              sheetId: config.sheetId,
              locales,
              productos,
              lastUpdated,
            })
          );
        } catch (e) {}

        return {
          locales,
          productos,
          source: 'google_sheets',
          lastUpdated,
        };
      }
    } catch (sheetError) {
      console.warn('Fallo al obtener datos de Google Sheets, intentando fallback CSV:', sheetError);
    }
  }
  // Attempt 2: Fallback to bundled CSVs
  try {
    const rawLocales = parseCSV(rawLocalesCSV);
    const rawProductos = parseCSV(rawProductosCSV);
    const { locales, productos } = normalizeData(rawLocales, rawProductos);
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      locales,
      productos,
      source: 'fallback_csv',
      lastUpdated,
    };
  } catch (csvError) {
    console.error('Error al procesar CSVs embebidos:', csvError);
    // Last ditch: check if we have any stale cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        locales: parsed.locales,
        productos: parsed.productos,
        source: 'cache',
        lastUpdated: parsed.lastUpdated || '',
      };
    }
    throw csvError;
  }
}
