import WeatherWidget from '@/components/shared/WeatherWidget';

export default function Home() {
  const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Toronto';
  const temperatureUnit = (process.env.NEXT_PUBLIC_TEMPERATURE_UNIT || 'celsius') as 'fahrenheit' | 'celsius';

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">Virtual Closet</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Smart wardrobe management and outfit planning
          </p>
        </div>

        {/* Weather Widget Demo */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Today&apos;s Weather</h2>
          <WeatherWidget city={defaultCity} units={temperatureUnit} />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <a
            href="/wardrobe"
            className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">👔 My Wardrobe</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your clothing items
            </p>
          </a>

          <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg opacity-50">
            <h3 className="text-xl font-semibold mb-2">✨ Outfit Suggestions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
