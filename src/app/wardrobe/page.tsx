'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { WardrobeGrid } from '@/components/wardrobe/WardrobeGrid';
import { CategoryFilter } from '@/components/wardrobe/CategoryFilter';
import { ClothingItemForm } from '@/components/wardrobe/ClothingItemForm';
import { DeleteConfirmDialog } from '@/components/wardrobe/DeleteConfirmDialog';
import { Modal } from '@/components/shared/Modal';
import type { ClothingItem, ClothingType, FormalityLevel } from '@/lib/types';

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<ClothingType | 'all'>('all');
  const [selectedFormality, setSelectedFormality] = useState<FormalityLevel | 'all'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch items
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedFormality !== 'all') params.append('formality_level', selectedFormality);

      const res = await fetch(`/api/wardrobe?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await res.json();
      setItems(data.items || []);
      setFilteredItems(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load wardrobe items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedFormality]);

  // Add item
  const handleAdd = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const data: any = {};
      formData.forEach((value, key) => {
        if (key === 'tags') {
          data[key] = JSON.parse(value as string);
        } else if (key === 'warmth_rating') {
          data[key] = parseInt(value as string);
        } else {
          data[key] = value;
        }
      });

      const res = await fetch('/api/wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add item');
      }

      setIsAddModalOpen(false);
      fetchItems();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit item
  const handleEdit = async (formData: FormData) => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const data: any = {};
      formData.forEach((value, key) => {
        if (key === 'tags') {
          data[key] = JSON.parse(value as string);
        } else if (key === 'warmth_rating') {
          data[key] = parseInt(value as string);
        } else {
          data[key] = value;
        }
      });

      const res = await fetch(`/api/wardrobe/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update item');
      }

      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/wardrobe/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      setItemToDelete(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Wardrobe
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <CategoryFilter
          selectedType={selectedType}
          selectedFormality={selectedFormality}
          onTypeChange={setSelectedType}
          onFormalityChange={setSelectedFormality}
        />
      </div>

      {/* Grid */}
      <WardrobeGrid
        items={filteredItems}
        onEdit={openEditModal}
        onDelete={setItemToDelete}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Clothing Item"
        size="lg"
      >
        <ClothingItemForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        title="Edit Clothing Item"
        size="lg"
      >
        {selectedItem && (
          <ClothingItemForm
            item={selectedItem}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        item={itemToDelete}
        isOpen={!!itemToDelete}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
