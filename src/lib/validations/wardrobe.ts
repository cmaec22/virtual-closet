import { z } from 'zod';

// Clothing type enum
export const clothingTypeSchema = z.enum(['top', 'bottom', 'shoes', 'outerwear', 'accessory']);

// Formality level enum
export const formalityLevelSchema = z.enum(['casual', 'business_casual', 'formal']);

// Warmth rating (1-5)
export const warmthRatingSchema = z.number().int().min(1).max(5);

// Create clothing item schema
export const createClothingItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: clothingTypeSchema,
  color: z.string().min(1, 'Color is required').max(50, 'Color is too long'),
  warmth_rating: warmthRatingSchema,
  formality_level: formalityLevelSchema,
  image_path: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

// Update clothing item schema (all fields optional except partial validation)
export const updateClothingItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: clothingTypeSchema.optional(),
  color: z.string().min(1).max(50).optional(),
  warmth_rating: warmthRatingSchema.optional(),
  formality_level: formalityLevelSchema.optional(),
  image_path: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// Query parameters for listing items
export const listClothingItemsSchema = z.object({
  type: clothingTypeSchema.optional(),
  formality_level: formalityLevelSchema.optional(),
  warmth_rating: warmthRatingSchema.optional(),
  color: z.string().optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Image upload validation
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

// Export types inferred from schemas
export type CreateClothingItemInput = z.infer<typeof createClothingItemSchema>;
export type UpdateClothingItemInput = z.infer<typeof updateClothingItemSchema>;
export type ListClothingItemsQuery = z.infer<typeof listClothingItemsSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
