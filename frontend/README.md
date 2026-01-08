# Agragrati Frontend

React + TypeScript frontend for the Agragrati AI Career Platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Routing

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env.local` from template:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_SUPABASE_URL` | Supabase project URL | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | - |

## Project Structure

```
src/
├── pages/      # Route components
├── components/   
│  ├── layout/   # Layout components (Header, Footer, etc.)
│  └── ui/     # shadcn/ui components
├── hooks/     # Custom React hooks
├── lib/      # Utilities (API client, helpers)
├── store/     # Zustand state management
└── types/     # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Adding Components

Use shadcn/ui CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## Deployment

### Vercel

1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

See [vercel.json](./vercel.json) for configuration.

### Docker

```bash
docker build -t agragrati-frontend .
docker run -p 3000:80 agragrati-frontend
```

## Features

- Dark/Light/System theme
- Responsive mobile design
- PWA support
- Keyboard shortcuts
- Framer Motion animations
- Error boundaries
- Loading skeletons
