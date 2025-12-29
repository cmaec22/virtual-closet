// Virtual Closet - TypeScript Type Definitions

export type ClothingType = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory';

export type FormalityLevel = 'casual' | 'business_casual' | 'formal';

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'cloudy';

export type TemperatureUnit = 'fahrenheit' | 'celsius';

export type FormalityPreference = 'casual' | 'business_casual' | 'formal' | 'mixed';

export interface ClothingItem {
  id: number;
  name: string;
  type: ClothingType;
  color: string;
  warmth_rating: number; // 1-5, where 1=light and 5=very warm
  formality_level: FormalityLevel;
  image_path: string | null;
  tags: string[]; // Stored as JSON in database
  created_at: string;
  updated_at: string;
}

export interface ClothingItemInput {
  name: string;
  type: ClothingType;
  color: string;
  warmth_rating: number;
  formality_level: FormalityLevel;
  image_path?: string | null;
  tags?: string[];
}

export interface Outfit {
  id: number;
  name: string | null;
  top_id: number | null;
  bottom_id: number | null;
  shoes_id: number | null;
  outerwear_id: number | null;
  accessory_id: number | null;
  created_at: string;
}

export interface OutfitWithItems extends Outfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
  outerwear: ClothingItem | null;
  accessory: ClothingItem | null;
}

export interface OutfitInput {
  name?: string | null;
  top_id?: number | null;
  bottom_id?: number | null;
  shoes_id?: number | null;
  outerwear_id?: number | null;
  accessory_id?: number | null;
}

export interface OutfitLog {
  id: number;
  outfit_id: number;
  worn_date: string; // ISO date string
  weather_temp: number | null;
  weather_condition: WeatherCondition | null;
  notes: string | null;
  created_at: string;
}

export interface OutfitLogWithOutfit extends OutfitLog {
  outfit: OutfitWithItems;
}

export interface OutfitLogInput {
  outfit_id: number;
  worn_date: string;
  weather_temp?: number | null;
  weather_condition?: WeatherCondition | null;
  notes?: string | null;
}

export interface Preferences {
  id: number;
  location_city: string | null;
  location_state: string | null;
  preferred_units: TemperatureUnit;
  formality_preference: FormalityPreference;
  weather_api_key: string | null;
  updated_at: string;
}

export interface PreferencesInput {
  location_city?: string | null;
  location_state?: string | null;
  preferred_units?: TemperatureUnit;
  formality_preference?: FormalityPreference;
  weather_api_key?: string | null;
}

// Weather API Response Types
export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  description: string;
  feels_like: number;
  humidity: number;
  timestamp: string;
}

// Outfit Suggestion Types
export interface OutfitSuggestion {
  outfit: OutfitWithItems;
  score: number;
  reason: string;
}
