# Tasks: Core MVP

> Actionable task breakdown for Virtual Closet MVP implementation.
> Each wave becomes a GitHub issue for tracking.

---

## Wave 1: Project Setup & Foundation

- [ ] **T001** [--] Initialize Next.js 14 project with TypeScript, Tailwind, ESLint
- [ ] **T002** [--] Configure project structure (app/, components/, lib/ directories)
- [ ] **T003** [--] Set up SQLite database with better-sqlite3
- [ ] **T004** [--] Create database schema (clothing_items, outfits, outfit_logs, preferences)
- [ ] **T005** [--] Add database migration system
- [ ] **T006** [--] Set up shadcn/ui component library
- [ ] **T007** [--] Create root layout with basic navigation
- [ ] **T008** [--] Add TypeScript types for all data models

## Wave 2: Wardrobe Management - Backend

- [ ] **T009** [US1] Create API route POST /api/wardrobe (add clothing item)
- [ ] **T010** [US1] Create API route GET /api/wardrobe (list all items)
- [ ] **T011** [US1] Create API route GET /api/wardrobe/[id] (get single item)
- [ ] **T012** [US1] Create API route PATCH /api/wardrobe/[id] (update item)
- [ ] **T013** [US1] Create API route DELETE /api/wardrobe/[id] (delete item)
- [ ] **T014** [US1] Implement image upload handler (local file system)
- [ ] **T015** [US1] Add Zod validation schemas for wardrobe operations
- [ ] **T016** [US1] Add database indexes for category, formality, season

## Wave 3: Wardrobe Management - Frontend

- [ ] **T017** [US1] Create ImageUpload component (drag-drop or file picker)
- [ ] **T018** [US1] Build ClothingItemForm component (add/edit form)
- [ ] **T019** [US1] Create ClothingItemCard component (display single item)
- [ ] **T020** [US1] Build WardrobeGrid component (responsive grid layout)
- [ ] **T021** [US1] Add CategoryFilter component (filter by type)
- [ ] **T022** [US1] Create /wardrobe page with grid and add button
- [ ] **T023** [US1] Implement edit modal/page for existing items
- [ ] **T024** [US1] Add delete confirmation dialog
- [ ] **T025** [US1] Add loading states and error handling

## Wave 4: Weather Integration

- [ ] **T026** [US2] Sign up for OpenWeatherMap API (free tier)
- [ ] **T027** [US2] Create weather service client (lib/services/weather.ts)
- [ ] **T028** [US2] Build API route GET /api/weather (fetch current conditions)
- [ ] **T029** [US2] Implement weather caching (1-hour TTL)
- [ ] **T030** [US2] Create WeatherWidget component for UI display
- [ ] **T031** [US2] Add environment variable for API key
- [ ] **T032** [US2] Handle weather API errors gracefully

## Wave 5: Outfit Generation Algorithm

- [ ] **T033** [US2] Implement outfit-generator service (lib/services/outfit-generator.ts)
- [ ] **T034** [US2] Create matching rules for formality levels
- [ ] **T035** [US2] Create matching rules for weather (temperature, precipitation)
- [ ] **T036** [US2] Implement season-appropriate filtering
- [ ] **T037** [US2] Add color coordination logic (basic rules)
- [ ] **T038** [US2] Implement 7-day repeat prevention logic
- [ ] **T039** [US2] Create outfit combination generator (top+bottom or dress)
- [ ] **T040** [US2] Add randomization with constraints (3 suggestions)

## Wave 6: Outfit Suggestions - API & UI

- [ ] **T041** [US2] Create API route POST /api/outfits/suggest
- [ ] **T042** [US2] Build OutfitCard component (displays complete outfit)
- [ ] **T043** [US2] Create OutfitSuggestions component (shows 3 suggestions)
- [ ] **T044** [US2] Build /suggestions page with context controls
- [ ] **T045** [US2] Add dress code override selector
- [ ] **T046** [US2] Implement "refresh suggestions" button
- [ ] **T047** [US2] Add "save outfit" functionality
- [ ] **T048** [US2] Display weather context on suggestions page

## Wave 7: Outfit History & Logging

- [ ] **T049** [US3] Create API route POST /api/outfits/log (log worn outfit)
- [ ] **T050** [US3] Create API route GET /api/outfits/history (get past outfits)
- [ ] **T051** [US3] Build OutfitLogger component (mark as worn button)
- [ ] **T052** [US3] Create HistoryCalendar component (calendar view)
- [ ] **T053** [US3] Build OutfitHistoryItem component (past outfit display)
- [ ] **T054** [US3] Create /history page with calendar and list views
- [ ] **T055** [US3] Add manual entry form for past outfits
- [ ] **T056** [US3] Implement edit/delete for history entries

## Wave 8: User Preferences & Settings

- [ ] **T057** [US4] Create API route GET /api/preferences
- [ ] **T058** [US4] Create API route PUT /api/preferences
- [ ] **T059** [US4] Build SettingsForm component
- [ ] **T060** [US4] Add location input (city name or zip code)
- [ ] **T061** [US4] Add default dress code selector
- [ ] **T062** [US4] Create /settings page
- [ ] **T063** [US4] Implement preference persistence (local storage + DB)
- [ ] **T064** [US4] Add favorite/exclude toggles on wardrobe items

## Wave 9: Navigation & Polish

- [ ] **T065** [--] Build responsive Navigation component (mobile + desktop)
- [ ] **T066** [--] Create dashboard/home page with quick actions
- [ ] **T067** [--] Add proper page titles and meta tags (SEO)
- [ ] **T068** [--] Implement mobile-responsive design (all pages)
- [ ] **T069** [--] Add loading skeletons for async operations
- [ ] **T070** [--] Implement error boundaries for graceful failures
- [ ] **T071** [--] Add toast notifications for user actions
- [ ] **T072** [--] Create README with setup instructions

## Wave 10: Testing & Deployment

- [ ] **T073** [--] Write unit tests for outfit-generator service
- [ ] **T074** [--] Write unit tests for weather service
- [ ] **T075** [--] Write integration tests for wardrobe API routes
- [ ] **T076** [--] Write integration tests for outfit API routes
- [ ] **T077** [--] Set up Playwright for E2E testing
- [ ] **T078** [--] Write E2E test for complete user journey
- [ ] **T079** [--] Test mobile responsiveness on iOS/Android
- [ ] **T080** [--] Deploy to Vercel (production build)
- [ ] **T081** [--] Set up environment variables in Vercel
- [ ] **T082** [--] Verify production deployment works end-to-end

---

## Issue Sync Status

Use `/spec:sync core-mvp` to create GitHub issues from waves.

| Wave | Issue | Status |
|------|-------|--------|
| Wave 1: Project Setup & Foundation | #TBD | Not synced |
| Wave 2: Wardrobe Management - Backend | #TBD | Not synced |
| Wave 3: Wardrobe Management - Frontend | #TBD | Not synced |
| Wave 4: Weather Integration | #TBD | Not synced |
| Wave 5: Outfit Generation Algorithm | #TBD | Not synced |
| Wave 6: Outfit Suggestions - API & UI | #TBD | Not synced |
| Wave 7: Outfit History & Logging | #TBD | Not synced |
| Wave 8: User Preferences & Settings | #TBD | Not synced |
| Wave 9: Navigation & Polish | #TBD | Not synced |
| Wave 10: Testing & Deployment | #TBD | Not synced |

---

## Notes

- Each wave represents a logical chunk of work (1-3 days)
- Tasks marked [--] are infrastructure/foundation work
- Tasks marked [US#] implement specific user stories from spec.md
- Dependencies are implicit in wave ordering
- Estimate: ~15-20 days for complete MVP

---

*Tasks implement [spec.md](spec.md)*
