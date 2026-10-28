import React from 'react';
import { 
  Flame, 
  UtensilsCrossed, 
  Wine, 
  Pill, 
  ShoppingCart, 
  IceCream, 
  LayoutGrid,
  Store as StoreIcon
} from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  counts: Record<string, number>;
}

export const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: LayoutGrid, emoji: '🏠' },
  { id: 'vendidos', label: 'Más Vendidos', icon: Flame, emoji: '🔥', highlight: true },
  { id: 'restaurantes', label: 'Restaurantes', icon: UtensilsCrossed, emoji: '🍕' },
  { id: 'bodega', label: 'Bodegas', icon: Wine, emoji: '🍷' },
  { id: 'farmacia', label: 'Farmacias', icon: Pill, emoji: '💊' },
  { id: 'supermercados', label: 'Supermercados', icon: ShoppingCart, emoji: '🛒' },
  { id: 'postres', label: 'Postres', icon: IceCream, emoji: '🍨' },
];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2.5 min-w-max px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = counts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-[#F85800] text-white shadow-md shadow-rose-500/25 scale-102 ring-2 ring-rose-400/40'
                  : cat.highlight
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-300'
                  : 'bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
