'use client';

import type { ClothingType, FormalityLevel } from '@/lib/types';

interface CategoryFilterProps {
  selectedType?: ClothingType | 'all';
  selectedFormality?: FormalityLevel | 'all';
  onTypeChange: (type: ClothingType | 'all') => void;
  onFormalityChange: (formality: FormalityLevel | 'all') => void;
}

export function CategoryFilter({
  selectedType = 'all',
  selectedFormality = 'all',
  onTypeChange,
  onFormalityChange,
}: CategoryFilterProps) {
  const types: Array<{ value: ClothingType | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '👗' },
    { value: 'top', label: 'Tops', icon: '👕' },
    { value: 'bottom', label: 'Bottoms', icon: '👖' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { value: 'accessory', label: 'Accessories', icon: '👔' },
  ];

  const formalities: Array<{ value: FormalityLevel | 'all'; label: string }> = [
    { value: 'all', label: 'All Styles' },
    { value: 'casual', label: 'Casual' },
    { value: 'business_casual', label: 'Business Casual' },
    { value: 'formal', label: 'Formal' },
  ];

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-1.5">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formality Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Formality
        </h3>
        <div className="flex flex-wrap gap-2">
          {formalities.map((formality) => (
            <button
              key={formality.value}
              onClick={() => onFormalityChange(formality.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFormality === formality.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {formality.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
