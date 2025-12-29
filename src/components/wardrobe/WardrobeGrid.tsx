'use client';

import { ClothingItemCard } from './ClothingItemCard';
import type { ClothingItem } from '@/lib/types';

interface WardrobeGridProps {
  items: ClothingItem[];
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
  isLoading?: boolean;
}

export function WardrobeGrid({ items, onEdit, onDelete, isLoading }: WardrobeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-800 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👔</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No clothing items yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your first item to start building your virtual wardrobe
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
