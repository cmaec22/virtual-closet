// API Route: GET /api/weather
// Fetch current weather for a location

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, geocodeCity } from '@/lib/services/weather';
import type { TemperatureUnit } from '@/lib/types';

export const dynamic = 'force-dynamic'; // Disable caching for weather data

/**
 * GET /api/weather
 *
 * Query Parameters:
 * - latitude (number): Latitude coordinate
 * - longitude (number): Longitude coordinate
 * OR
 * - city (string): City name (e.g., "New York" or "London, UK")
 *
 * - units (optional): Temperature unit - 'fahrenheit' or 'celsius' (default: fahrenheit)
 *
 * Examples:
 * - /api/weather?latitude=40.7128&longitude=-74.0060
 * - /api/weather?city=New York&units=fahrenheit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const latParam = searchParams.get('latitude');
    const lonParam = searchParams.get('longitude');
    const units = (searchParams.get('units') || 'fahrenheit') as TemperatureUnit;

    // Validate units parameter
    if (units !== 'fahrenheit' && units !== 'celsius') {
      return NextResponse.json(
        { error: 'Invalid units parameter. Must be "fahrenheit" or "celsius".' },
        { status: 400 }
      );
    }

    let latitude: number;
    let longitude: number;
    let locationName: string | undefined;

    // Option 1: City name provided - geocode it first
    if (city) {
      try {
        const location = await geocodeCity(city);
        latitude = location.latitude;
        longitude = location.longitude;
        locationName = `${location.name}, ${location.country}`;
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Location not found',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 404 }
        );
      }
    }
    // Option 2: Coordinates provided
    else if (latParam && lonParam) {
      latitude = parseFloat(latParam);
      longitude = parseFloat(lonParam);

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates. Latitude and longitude must be valid numbers.' },
          { status: 400 }
        );
      }

      if (latitude < -90 || latitude > 90) {
        return NextResponse.json(
          { error: 'Invalid latitude. Must be between -90 and 90.' },
          { status: 400 }
        );
      }

      if (longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { error: 'Invalid longitude. Must be between -180 and 180.' },
          { status: 400 }
        );
      }
    }
    // Missing required parameters
    else {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          details: 'Provide either "city" or both "latitude" and "longitude"',
          examples: [
            '/api/weather?city=New York',
            '/api/weather?latitude=40.7128&longitude=-74.0060',
          ],
        },
        { status: 400 }
      );
    }

    // Fetch weather data
    const weatherData = await fetchWeather(latitude, longitude, units);

    return NextResponse.json({
      weather: weatherData,
      location: locationName
        ? { name: locationName, latitude, longitude }
        : { latitude, longitude },
    });
  } catch (error) {
    console.error('Weather API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
