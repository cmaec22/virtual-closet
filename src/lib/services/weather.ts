// Weather Service using Open-Meteo API
// API Docs: https://open-meteo.com/

import type { WeatherData, WeatherCondition, TemperatureUnit } from '../types';

// Open-Meteo API Response Types
interface OpenMeteoCurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrentWeather;
  current_units: {
    temperature_2m: string;
    apparent_temperature: string;
  };
}

// Weather code mapping from Open-Meteo to our WeatherCondition type
// Reference: https://open-meteo.com/en/docs
function mapWeatherCode(code: number): { condition: WeatherCondition; description: string } {
  if (code === 0) return { condition: 'clear', description: 'Clear sky' };
  if (code === 1) return { condition: 'clear', description: 'Mainly clear' };
  if (code === 2) return { condition: 'cloudy', description: 'Partly cloudy' };
  if (code === 3) return { condition: 'cloudy', description: 'Overcast' };
  if (code >= 45 && code <= 48) return { condition: 'cloudy', description: 'Foggy' };
  if (code >= 51 && code <= 67) return { condition: 'rain', description: 'Rainy' };
  if (code >= 71 && code <= 77) return { condition: 'snow', description: 'Snowy' };
  if (code >= 80 && code <= 82) return { condition: 'rain', description: 'Rain showers' };
  if (code >= 85 && code <= 86) return { condition: 'snow', description: 'Snow showers' };
  if (code >= 95 && code <= 99) return { condition: 'rain', description: 'Thunderstorm' };

  return { condition: 'cloudy', description: 'Unknown' };
}

// In-memory cache for weather data
interface WeatherCache {
  data: WeatherData;
  expiresAt: number;
}

const cache = new Map<string, WeatherCache>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

function getCacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

/**
 * Fetch current weather data for a location
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param temperatureUnit - Temperature unit (fahrenheit or celsius)
 * @returns WeatherData object
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit = 'fahrenheit'
): Promise<WeatherData> {
  const cacheKey = getCacheKey(latitude, longitude);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    // Build API URL
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code',
      temperature_unit: temperatureUnit,
      timezone: 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoResponse = await response.json();
    const { condition, description } = mapWeatherCode(data.current.weather_code);

    const weatherData: WeatherData = {
      temperature: Math.round(data.current.temperature_2m),
      condition,
      description,
      feels_like: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    cache.set(cacheKey, {
      data: weatherData,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return weatherData;
  } catch (error) {
    // Clear stale cache on error
    cache.delete(cacheKey);

    if (error instanceof Error) {
      throw new Error(`Failed to fetch weather: ${error.message}`);
    }
    throw new Error('Failed to fetch weather: Unknown error');
  }
}

/**
 * Geocode a city name to coordinates using Open-Meteo Geocoding API
 * @param cityName - City name (e.g., "New York" or "London, UK")
 * @returns Object with latitude, longitude, and location name
 */
export async function geocodeCity(cityName: string): Promise<{
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}> {
  try {
    const params = new URLSearchParams({
      name: cityName,
      count: '1',
      language: 'en',
      format: 'json',
    });

    const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`Location not found: ${cityName}`);
    }

    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to geocode location: ${error.message}`);
    }
    throw new Error('Failed to geocode location: Unknown error');
  }
}

/**
 * Clear the weather cache (useful for testing or forced refresh)
 */
export function clearWeatherCache(): void {
  cache.clear();
}

/**
 * Get cached weather data if available (without making API call)
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Cached WeatherData or null if not in cache
 */
export function getCachedWeather(latitude: number, longitude: number): WeatherData | null {
  const cacheKey = getCacheKey(latitude, longitude);
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  return null;
}
