'use client';

import Image from 'next/image';
import { Edit, Trash2, Flame } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';

interface ClothingItemCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

const typeColors: Record<string, string> = {
  top: 'bg-blue-100 text-blue-800',
  bottom: 'bg-green-100 text-green-800',
  shoes: 'bg-purple-100 text-purple-800',
  outerwear: 'bg-orange-100 text-orange-800',
  accessory: 'bg-pink-100 text-pink-800',
};

const formalityLabels: Record<string, string> = {
  casual: 'Casual',
  business_casual: 'Business Casual',
  formal: 'Formal',
};

export function ClothingItemCard({ item, onEdit, onDelete }: ClothingItemCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900">
        {item.image_path ? (
          <Image
            src={item.image_path}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-4xl">👕</span>
          </div>
        )}

        {/* Action buttons - show on hover */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Edit item"
          >
            <Edit className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
            title="Delete item"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 truncate">
          {item.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {item.color}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Flame className="h-4 w-4" />
            <span>{item.warmth_rating}/5</span>
          </div>

          <span className="text-gray-600 dark:text-gray-400">
            {formalityLabels[item.formality_level]}
          </span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
