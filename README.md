# Shh Me 🤫

Anonymous romantic investigation app. Send a "shh" (3-second gesture) to someone. They receive secret thoughts, filtered vocals, a progressive blur photo — without ever knowing who. Every morning a question, every afternoon a clue. Until the mutual reveal.

## Stack

- **Backend**: Laravel 12, PHP 8.4, PostgreSQL 16 + PostGIS 3.4, Redis 7
- **Mobile**: React Native + Expo SDK 55, Zustand, NativeWind, Reanimated 3
- **Admin**: Filament v3.3
- **Audio**: FFmpeg + SoX (server-side, $0 cost)
- **Storage**: Cloudflare R2 (2 buckets: public + private)

## Setup

### Prerequisites

- PHP 8.2+, Composer 2.x
- Node 20+, npm 10+
- Docker & Docker Compose
- FFmpeg

### Backend

```bash
docker compose up -d
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

### Tests

```bash
cd backend
vendor/bin/pint --test        # Code style
vendor/bin/phpstan analyse    # Static analysis (level 6)
vendor/bin/pest               # Tests

cd mobile
npx tsc --noEmit              # TypeScript check
```

## Architecture

```
Shh-me_dev/
├── backend/     # Laravel 12 (API + admin + crons + jobs)
├── mobile/      # React Native + Expo (iOS + Android)
└── docker-compose.yml
```

## License

Proprietary — All rights reserved.
