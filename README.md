# Virtual Closet

A smart wardrobe management and outfit planning web app for working professionals.

## Overview

Virtual Closet helps you:
- 📸 Catalog your clothing items with photos
- 🌤️ Get outfit suggestions based on weather
- 👔 Plan professional work outfits daily
- 🔄 Avoid outfit repetition
- 📅 Track your outfit history

## Features

- **Smart Suggestions**: Context-aware outfit recommendations based on weather, occasion, and dress code
- **Outfit History**: Track what you've worn to avoid repetition
- **Weather Integration**: Automatic weather-based outfit filtering
- **Mobile-Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (MVP) → PostgreSQL (production)
- **Image Optimization**: Next.js Image
- **Weather API**: OpenWeatherMap
- **Deployment**: Vercel

## Project Structure

This project uses **Spec-Driven Development** (based on [GitHub Spec Kit](https://github.com/github/spec-kit)).

```
.specify/
├── memory/
│   └── constitution.md    # Project principles
└── specs/
    └── core-mvp/          # MVP specification
        ├── spec.md        # Requirements & user stories
        ├── plan.md        # Technical implementation plan
        └── tasks.md       # Actionable task breakdown
```

## Development Workflow

1. **Specification First**: All features start with a detailed spec
2. **Tasks → Issues**: Tasks sync to GitHub issues for tracking
3. **Test-Driven**: Tests written alongside implementation
4. **Iterative**: Build, measure, learn, refine

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run db:migrate

# Start development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

Create a `.env.local` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
DATABASE_URL=./data/virtual-closet.db
```

## License

MIT

---

*Built with ❤️ for anyone tired of staring at their closet every morning*
