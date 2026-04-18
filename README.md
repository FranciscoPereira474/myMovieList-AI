# MyMovieList — AI-Assisted Version

A Letterboxd-inspired movie platform built with **Next.js 16**, **React 19**, and **Supabase**. Users can browse films, write reviews, create lists, manage watchlists, and get personalized recommendations.

This is the **AI-assisted version** — developed using LLMs for code generation, testing, and documentation. A [traditional version](https://github.com/FranciscoPereira474/myMovieList) was built in parallel for comparison.

> Academic project for the **Automated Software Engineering (ADS)** course — Master's in Computer Engineering, University of Coimbra, 2025/2026.

## Features

- Browse 5000+ movies sourced from TMDB (cast, trailers, posters)
- Advanced search with filters (genre, year, rating, runtime) and sorting
- User authentication (email/password, Google OAuth)
- Write and share reviews with star ratings
- Create public/private movie lists
- Personal watchlist and diary tracking
- Movie recommendations engine
- Follow other users and comment on reviews

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, RSC) |
| Frontend | React 19, Tailwind CSS, Radix UI, shadcn/ui |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Auth) |
| Carousel | Embla Carousel |
| CI/CD | GitLab CI/CD |
| Deployment | Vercel |

## CI/CD Pipeline

The GitLab CI pipeline automates the full delivery workflow across 7 stages:

```
Merge Request → Lint → Preview Deploy → Notify MR
Dev Branch → Manual Promote to Main
Main Branch → Production Deploy → Health Check → Auto Rollback (on failure)
```

Key highlights:
- **Preview environments** for every merge request, with URL posted to MR comments
- **Automated health checks** after production deploys
- **Auto-rollback** via `vercel rollback` if health checks fail
- **TypeDoc** documentation generation on GitLab Pages

## Project Structure

```
ads-ai-main/
├── adsai/              # Next.js application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # Shared UI components
│   │   └── lib/        # Supabase clients, utilities
│   └── scripts/        # Utility scripts
├── DOC/                # Project documentation
├── REQ/                # Requirements
├── MOCKUPS/            # UI mockups
├── SCRIPTS/            # Database population scripts
├── .gitlab-ci.yml      # CI/CD pipeline
└── typedoc-*.json      # Documentation config
```

## Getting Started

```bash
cd adsai
npm install
cp .env.example .env.local   # Fill in your credentials
npm run dev                  # http://localhost:3000
```

### Environment Variables

Create `.env.local` in the `adsai/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_KEY=your_tmdb_api_key
```

## Team

Developed by a team of 6 MSc students in Computer Engineering (MEI) at the University of Coimbra:

- Bruno Vilas-Boas
- Francisco Loureiro
- Francisco Pereira
- Gonçalo Borges
- Lucas Caetano
- Tiago Mendes

## Attribution

This product uses the [TMDB API](https://www.themoviedb.org/) but is not endorsed or certified by TMDB.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
