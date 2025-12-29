# Implementation Plan: Core MVP

## Summary

We'll build Virtual Closet using Next.js 14 with the App Router, leveraging server components for performance and SEO. The architecture follows a simple three-tier pattern: React components for UI, Next.js API routes for business logic, and SQLite for data persistence. Image uploads will use Next.js built-in image optimization with local file storage. Weather data will be fetched server-side to protect API keys and improve performance.

The implementation prioritizes rapid iteration and user validation over premature optimization. We'll start with a simple, working MVP and refine based on real usage patterns.

## Architecture

### Components

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **Wardrobe Manager** | Display, add, edit, delete clothing items | React Server/Client Components |
| **Outfit Generator** | Generate smart outfit suggestions | Next.js API Route + Algorithm |
| **Weather Service** | Fetch and cache weather data | Next.js API Route + OpenWeatherMap |
| **Outfit Logger** | Track outfit history and prevent repeats | React + API Routes |
| **Settings Manager** | User preferences and context | React + Local Storage/Database |
| **Image Handler** | Upload, optimize, serve clothing photos | Next.js Image + File System |
| **Database Layer** | CRUD operations for all entities | SQLite + better-sqlite3 |

### Data Model

```
User (future - MVP is single-user)
├── id
├── email
├── location
└── default_dress_code

ClothingItem
├── id
├── image_path
├── category (enum: top, bottom, dress, shoes, outerwear, accessory)
├── color
├── season (enum: spring, summer, fall, winter, all)
├── formality (enum: casual, smart_casual, business_casual, business_formal)
├── pattern (enum: solid, striped, plaid, floral, other)
├── is_favorite
├── is_excluded
├── created_at
└── updated_at

Outfit
├── id
├── name (optional)
├── top_id (nullable)
├── bottom_id (nullable)
├── dress_id (nullable)
├── shoes_id
├── outerwear_id (nullable)
├── accessory_ids (JSON array)
├── is_favorite
├── created_at
└── updated_at

OutfitLog
├── id
├── outfit_id
├── worn_date
├── weather_conditions (JSON)
├── occasion (text)
└── notes (text, optional)

Preferences
├── id
├── location (city name or zip)
├── default_dress_code
├── suggestion_count (default: 3)
└── updated_at
```

### Data Flow

```
User Action → Client Component → API Route → Database → Response → UI Update

Example: Add Clothing Item
1. User uploads photo in ClothingItemForm (client)
2. Form submits to /api/wardrobe/create
3. API route saves image to /public/uploads/
4. API route inserts record to clothing_items table
5. Returns new item with ID and image URL
6. UI updates wardrobe grid with new item
```

### File Structure

```
virtual-closet/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home/dashboard
│   │   ├── wardrobe/
│   │   │   └── page.tsx                # Wardrobe management
│   │   ├── suggestions/
│   │   │   └── page.tsx                # Outfit suggestions
│   │   ├── history/
│   │   │   └── page.tsx                # Outfit history
│   │   ├── settings/
│   │   │   └── page.tsx                # User preferences
│   │   ├── api/
│   │   │   ├── wardrobe/
│   │   │   │   ├── route.ts            # GET all, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET, PATCH, DELETE item
│   │   │   ├── outfits/
│   │   │   │   ├── suggest/
│   │   │   │   │   └── route.ts        # POST generate suggestions
│   │   │   │   └── log/
│   │   │   │       └── route.ts        # POST log worn outfit
│   │   │   ├── weather/
│   │   │   │   └── route.ts            # GET current weather
│   │   │   └── preferences/
│   │   │       └── route.ts            # GET, PUT preferences
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── wardrobe/
│   │   │   ├── ClothingItemCard.tsx
│   │   │   ├── ClothingItemForm.tsx
│   │   │   ├── WardrobeGrid.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── outfits/
│   │   │   ├── OutfitCard.tsx
│   │   │   ├── OutfitSuggestions.tsx
│   │   │   └── OutfitLogger.tsx
│   │   ├── history/
│   │   │   ├── HistoryCalendar.tsx
│   │   │   └── OutfitHistoryItem.tsx
│   │   ├── shared/
│   │   │   ├── Navigation.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── WeatherWidget.tsx
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.sql              # Database schema
│   │   │   ├── db.ts                   # Database connection
│   │   │   └── migrations/
│   │   ├── services/
│   │   │   ├── outfit-generator.ts     # Outfit suggestion logic
│   │   │   ├── weather.ts              # Weather API client
│   │   │   └── image-handler.ts        # Image upload/processing
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   └── utils/
│   │       ├── date.ts
│   │       └── validation.ts
│   └── public/
│       └── uploads/                    # User-uploaded images
├── .specify/                           # Spec-driven development
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.2.0 | Framework (App Router, API routes, Image optimization) |
| react | ^18.3.0 | UI library |
| typescript | ^5.4.0 | Type safety |
| better-sqlite3 | ^11.0.0 | SQLite database driver (synchronous, fast) |
| tailwindcss | ^3.4.0 | Styling framework |
| shadcn/ui | latest | UI component library |
| zod | ^3.22.0 | Schema validation (API routes, forms) |
| date-fns | ^3.0.0 | Date manipulation |
| lucide-react | ^0.index | Icons |

## Implementation Phases

### Phase 1: Foundation & Wardrobe Management
**Goal:** Users can add, view, edit, and delete clothing items

**Tasks:**
- [ ] Set up Next.js 14 project with TypeScript and Tailwind
- [ ] Configure SQLite database and create schema
- [ ] Build image upload component
- [ ] Create API routes for wardrobe CRUD operations
- [ ] Build wardrobe grid view with category filtering
- [ ] Add clothing item form with validation
- [ ] Implement edit and delete functionality

**Dependencies:** None

**Estimated Time:** 3-4 days

### Phase 2: Outfit Suggestions
**Goal:** Generate intelligent outfit suggestions based on rules

**Tasks:**
- [ ] Implement outfit generation algorithm (rule-based)
- [ ] Create API route for suggestions
- [ ] Build suggestions page UI
- [ ] Integrate weather API (OpenWeatherMap)
- [ ] Add dress code and weather filtering logic
- [ ] Implement "refresh suggestions" functionality
- [ ] Add "save outfit" feature

**Dependencies:** Phase 1 complete (need wardrobe data)

**Estimated Time:** 4-5 days

### Phase 3: Outfit History & Tracking
**Goal:** Track worn outfits and prevent recent repeats

**Tasks:**
- [ ] Create outfit logging database table
- [ ] Build API routes for outfit history
- [ ] Create calendar view component
- [ ] Implement "mark as worn" functionality
- [ ] Add 7-day repeat prevention logic
- [ ] Build history page with past outfits
- [ ] Add manual entry/editing for history

**Dependencies:** Phase 2 complete (need outfit structure)

**Estimated Time:** 2-3 days

### Phase 4: Settings & Polish
**Goal:** User preferences and final UX improvements

**Tasks:**
- [ ] Create preferences page
- [ ] Implement settings API routes
- [ ] Add location setting for weather
- [ ] Add dress code preferences
- [ ] Build navigation component
- [ ] Add loading states and error handling
- [ ] Implement responsive design (mobile-first)
- [ ] Add basic SEO (metadata, titles)

**Dependencies:** Phases 1-3 complete

**Estimated Time:** 2-3 days

## Testing Strategy

- **Unit Tests:**
  - Outfit generation algorithm (various weather/dress code combinations)
  - Date utilities (checking 7-day window)
  - Validation schemas (Zod)

- **Integration Tests:**
  - API routes (CRUD operations)
  - Image upload flow (upload → save → retrieve)
  - Outfit suggestion flow (wardrobe → weather → suggestions)

- **E2E Tests (Playwright):**
  - Complete user journey: Add items → Get suggestions → Log outfit → View history
  - Mobile responsive testing

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Weather API rate limits | Medium | Cache weather data (1hr TTL), graceful degradation |
| Image storage fills disk | Low | MVP scope is small; add cleanup for unused images |
| SQLite performance with many items | Low | SQLite handles thousands of records fine; add indexes |
| Complex outfit matching logic | High | Start simple (rule-based), iterate based on user feedback |
| Mobile image upload UX | Medium | Test early on iOS/Android, use native file picker |

## Performance Considerations

- **Image Optimization:** Use Next.js `<Image>` component with automatic WebP conversion
- **Weather Caching:** Cache weather data for 1 hour to reduce API calls
- **Database Indexes:** Add indexes on `category`, `formality`, `season` for fast filtering
- **Server Components:** Use RSC for wardrobe grid (faster initial load)
- **Code Splitting:** Lazy load calendar component on history page

## Security Considerations

- **Input Validation:** Validate all API inputs with Zod schemas
- **Image Upload:** Restrict file types (jpg, png, webp) and size (<5MB)
- **Path Traversal:** Sanitize filenames to prevent directory traversal
- **Rate Limiting:** Add basic rate limiting to API routes (future)

---

*Plan aligns with [spec.md](spec.md) and [constitution.md](../../memory/constitution.md)*
