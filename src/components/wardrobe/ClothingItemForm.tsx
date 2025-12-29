'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import type { ClothingItem, ClothingType, FormalityLevel } from '@/lib/types';

interface ClothingItemFormProps {
  item?: ClothingItem;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClothingItemForm({ item, onSubmit, onCancel, isLoading }: ClothingItemFormProps) {
  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState<ClothingType>(item?.type || 'top');
  const [color, setColor] = useState(item?.color || '');
  const [warmthRating, setWarmthRating] = useState(item?.warmth_rating || 3);
  const [formalityLevel, setFormalityLevel] = useState<FormalityLevel>(item?.formality_level || 'casual');
  const [tags, setTags] = useState(item?.tags?.join(', ') || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!color.trim()) {
      setError('Color is required');
      return;
    }

    try {
      // Upload image first if there's a new file
      let imagePath = item?.image_path || null;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        imagePath = uploadData.path;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('type', type);
      formData.append('color', color.trim());
      formData.append('warmth_rating', warmthRating.toString());
      formData.append('formality_level', formalityLevel);
      if (imagePath) {
        formData.append('image_path', imagePath);
      }
      if (tags.trim()) {
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('tags', JSON.stringify(tagArray));
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Photo</label>
        <ImageUpload
          value={item?.image_path}
          onChange={setImageFile}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Blue Oxford Shirt"
          required
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as ClothingType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="shoes">Shoes</option>
          <option value="outerwear">Outerwear</option>
          <option value="accessory">Accessory</option>
        </select>
      </div>

      {/* Color */}
      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-2">
          Color <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Navy Blue"
          required
        />
      </div>

      {/* Warmth Rating */}
      <div>
        <label htmlFor="warmth" className="block text-sm font-medium mb-2">
          Warmth Rating: {warmthRating} / 5
        </label>
        <input
          type="range"
          id="warmth"
          min="1"
          max="5"
          value={warmthRating}
          onChange={(e) => setWarmthRating(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Light</span>
          <span>Very Warm</span>
        </div>
      </div>

      {/* Formality Level */}
      <div>
        <label htmlFor="formality" className="block text-sm font-medium mb-2">
          Formality Level <span className="text-red-500">*</span>
        </label>
        <select
          id="formality"
          value={formalityLevel}
          onChange={(e) => setFormalityLevel(e.target.value as FormalityLevel)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="casual">Casual</option>
          <option value="business_casual">Business Casual</option>
          <option value="formal">Formal</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., work, summer, favorite"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}
