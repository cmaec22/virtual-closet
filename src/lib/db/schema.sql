-- Virtual Closet Database Schema

-- Clothing Items Table
CREATE TABLE IF NOT EXISTS clothing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'top', 'bottom', 'shoes', 'outerwear', 'accessory'
  color TEXT NOT NULL,
  warmth_rating INTEGER CHECK(warmth_rating >= 1 AND warmth_rating <= 5), -- 1=light, 5=very warm
  formality_level TEXT CHECK(formality_level IN ('casual', 'business_casual', 'formal')),
  image_path TEXT,
  tags TEXT, -- JSON array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Outfits Table
CREATE TABLE IF NOT EXISTS outfits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  top_id INTEGER,
  bottom_id INTEGER,
  shoes_id INTEGER,
  outerwear_id INTEGER,
  accessory_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (top_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
  FOREIGN KEY (bottom_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
  FOREIGN KEY (shoes_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
  FOREIGN KEY (outerwear_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
  FOREIGN KEY (accessory_id) REFERENCES clothing_items(id) ON DELETE SET NULL
);

-- Outfit Logs Table
CREATE TABLE IF NOT EXISTS outfit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  outfit_id INTEGER NOT NULL,
  worn_date DATE NOT NULL,
  weather_temp REAL, -- Temperature in Fahrenheit
  weather_condition TEXT, -- 'clear', 'rain', 'snow', 'cloudy'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS preferences (
  id INTEGER PRIMARY KEY CHECK(id = 1), -- Single row table
  location_city TEXT,
  location_state TEXT,
  preferred_units TEXT CHECK(preferred_units IN ('fahrenheit', 'celsius')) DEFAULT 'fahrenheit',
  formality_preference TEXT CHECK(formality_preference IN ('casual', 'business_casual', 'formal', 'mixed')) DEFAULT 'mixed',
  weather_api_key TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default preferences row
INSERT OR IGNORE INTO preferences (id, preferred_units, formality_preference)
VALUES (1, 'fahrenheit', 'mixed');

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clothing_type ON clothing_items(type);
CREATE INDEX IF NOT EXISTS idx_clothing_formality ON clothing_items(formality_level);
CREATE INDEX IF NOT EXISTS idx_clothing_warmth ON clothing_items(warmth_rating);
CREATE INDEX IF NOT EXISTS idx_clothing_color ON clothing_items(color);
CREATE INDEX IF NOT EXISTS idx_clothing_type_formality ON clothing_items(type, formality_level);
CREATE INDEX IF NOT EXISTS idx_outfit_logs_date ON outfit_logs(worn_date);
CREATE INDEX IF NOT EXISTS idx_outfit_logs_outfit_id ON outfit_logs(outfit_id);
