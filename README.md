# Frontend (Next.js 16 App Router + React 19)

Quick start:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3005`. Requests under `/api/*` are
rewritten to `API_URL`, which defaults to `http://localhost:3000`.

## Source structure

```text
src/
├── app/              # Next.js App Router, route groups, global CSS
├── components/       # Shared and feature-specific React components
│   ├── customizer/
│   ├── landing/
│   └── UI/
├── config/           # App-wide constants and metadata
├── hooks/            # Custom React hooks
├── lib/api/          # Typed API client and domain services
├── provider/         # Root React providers
├── schemas/          # Validation schemas
├── store/            # Zustand stores
├── styles/           # Shared CSS modules
├── types/            # Shared TypeScript types
└── utils/            # Pure utility functions
```

Add route groups such as `(auth)` and feature routes such as `orders/` or
`vouchers/` under `src/app` when those screens are implemented.
