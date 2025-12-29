'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Sparkles, History, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Shirt },
  { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { href: '/suggestions', label: 'Suggestions', icon: Sparkles },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shirt className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">Virtual Closet</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
