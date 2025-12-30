'use client';

import { useEffect, useState } from 'react';
import type { WeatherData } from '@/lib/types';

interface WeatherWidgetProps {
  city?: string;
  latitude?: number;
  longitude?: number;
  units?: 'fahrenheit' | 'celsius';
  className?: string;
}

interface WeatherResponse {
  weather: WeatherData;
  location?: {
    name?: string;
    latitude: number;
    longitude: number;
  };
}

export default function WeatherWidget({
  city,
  latitude,
  longitude,
  units = 'celsius',
  className = '',
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);

        // Build API URL with query parameters
        const params = new URLSearchParams();

        if (city) {
          params.append('city', city);
        } else if (latitude !== undefined && longitude !== undefined) {
          params.append('latitude', latitude.toString());
          params.append('longitude', longitude.toString());
        } else {
          throw new Error('Either city or coordinates must be provided');
        }

        params.append('units', units);

        const response = await fetch(`/api/weather?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch weather');
        }

        const data: WeatherResponse = await response.json();
        setWeather(data.weather);

        if (data.location?.name) {
          setLocationName(data.location.name);
        } else if (city) {
          setLocationName(city);
        } else {
          setLocationName('Current Location');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather');
        console.error('Weather widget error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [city, latitude, longitude, units]);

  // Weather condition emoji/icon mapping
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'snow':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <p className="text-sm text-red-800 dark:text-red-200">
          ⚠️ Weather unavailable: {error}
        </p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const unitSymbol = units === 'fahrenheit' ? '°F' : '°C';

  return (
    <div className={`p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Weather Icon */}
        <div className="text-5xl" role="img" aria-label={weather.description}>
          {getWeatherIcon(weather.condition)}
        </div>

        {/* Weather Info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {weather.temperature}{unitSymbol}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Feels like {weather.feels_like}{unitSymbol}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            {weather.description}
          </p>

          {locationName && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              📍 {locationName}
            </p>
          )}
        </div>

        {/* Humidity */}
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Humidity
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {weather.humidity}%
          </div>
        </div>
      </div>
    </div>
  );
}
