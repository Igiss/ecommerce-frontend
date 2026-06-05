# Project Spec & Conventions

> Guest-facing web
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · TanStack React Query · Zod · next-auth v4

---

## 1. Folder Structure

```
src/
├── app/                    # Pages & routing (App Router)
│   ├── layout.tsx          # Root layout — fonts, providers, toaster
│   ├── globals.css         # Tailwind imports + global styles
│   ├── (main)/             # Route group: landing, home, policy
│   ├── (auth)/             # Route group: login, register, profile
│   ├── orders/             # /orders page
│   ├── vouchers/           # /vouchers page
│   └── api/                # API routes (NextAuth)
│
├── components/             # Reusable UI components
│   ├── buttonField/        # Form field components (index.tsx export)
│   ├── inputField/
│   ├── selectField/
│   ├── landing/            # Components chỉ dùng cho landing page
│   ├── layout/             # Layout shell: topbar, footer, sections
│   ├── vouchers/           # Components riêng cho feature vouchers
│   ├── policy/             # Components riêng cho feature policy
│   └── UI/                 # Shared UI primitives (toast, etc.)
│
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries & API services
│   ├── auth.ts             # NextAuth config
│   └── api/                # API layer
│       ├── client.ts       # HTTP client (fetch wrapper)
│       ├── utils.ts        # Shared API utilities
│       └── *.service.ts    # Domain-specific API services
│
├── schemas/                # Zod validation schemas
├── store/                  # Zustand stores
├── types/                  # TypeScript interfaces & type definitions
├── utils/                  # Pure utility functions
├── styles/                 # Shared CSS modules
├── config/                 # App-wide constants (SEO, etc.)
└── provider/               # React context providers
```

---

## 2. Quy tắc đặt file — Mỗi loại file để ở đâu

### Pages & Routes → `src/app/`

| Loại                  | Vị trí                              | Ví dụ                                     |
| --------------------- | ----------------------------------- | ----------------------------------------- |
| Page component        | `src/app/<route>/page.tsx`          | `src/app/orders/page.tsx`                 |
| Layout                | `src/app/<route>/layout.tsx`        | `src/app/(main)/layout.tsx`               |
| CSS module riêng page | `src/app/<route>/<name>.module.css` | `src/app/vouchers/vouchers.module.css`    |
| API route             | `src/app/api/<path>/route.ts`       | `src/app/api/auth/[...nextauth]/route.ts` |

**Lưu ý:**

- Route groups dùng `(tên)` — không ảnh hưởng URL
- Page file chỉ chứa page component + sub-components inline nếu chúng nhỏ (<50 dòng) và chỉ dùng ở page đó
- Nếu sub-component lớn (>50 dòng) hoặc tái sử dụng → tách ra `src/components/`

### Components → `src/components/`

| Loại              | Vị trí                                           | Ví dụ                                             |
| ----------------- | ------------------------------------------------ | ------------------------------------------------- |
| Shared form field | `src/components/<tên>/index.tsx`                 | `src/components/inputField/index.tsx`             |
| Feature-specific  | `src/components/<feature>/<TênComponent>.tsx`    | `src/components/vouchers/VoucherDetailsModal.tsx` |
| Layout component  | `src/components/layout/<area>/<Tên>.tsx`         | `src/components/layout/landing/AppTopbar.tsx`     |
| Landing section   | `src/components/layout/section/<Tên>Section.tsx` | `src/components/layout/section/BannerSection.tsx` |

### Hooks → `src/hooks/`

| Loại          | Vị trí                      | Ví dụ                                  |
| ------------- | --------------------------- | -------------------------------------- |
| Auth hooks    | `src/hooks/useAuth.ts`      | `useLogin`, `useRegister`, `useLogout` |
| Profile hooks | `src/hooks/useProfile.ts`   | `useGetProfile`, `useUpdateProfile`    |
| Feature hooks | `src/hooks/use<Feature>.ts` | `useOrders.ts`, `useVouchers.ts`       |
| Utility hooks | `src/hooks/use<Tên>.ts`     | `useDebounce.ts`                       |

**Quy tắc:**

- Mỗi file hook group theo **domain** (auth, profile, orders), không nhồi nhiều domain vào 1 file
- KHÔNG thêm `"use client"` — hooks được import từ client components nên tự động thuộc client boundary
- Navigation/redirect logic nên nằm ở **page**, không nằm trong hook

### API Services → `src/lib/api/`

| Loại             | Vị trí                            | Ví dụ                                            |
| ---------------- | --------------------------------- | ------------------------------------------------ |
| HTTP client      | `src/lib/api/client.ts`           | `apiRequest`, `api.get/post/put/delete`          |
| Shared utilities | `src/lib/api/utils.ts`            | `toStringValue`, `toNumberValue`, `ApiPrimitive` |
| Domain service   | `src/lib/api/<domain>.service.ts` | `order.service.ts`, `voucher.service.ts`         |

**Quy tắc:**

- Tất cả services dùng chung `apiRequest` từ `client.ts`
- KHÔNG tự viết `fetch()` wrapper riêng trong service
- Normalization logic (API DTO → domain model) nằm trong service file
- Shared helpers (type conversion, etc.) nằm trong `utils.ts`

### Schemas → `src/schemas/`

| Loại              | Vị trí                    | Ví dụ                 |
| ----------------- | ------------------------- | --------------------- |
| Validation schema | `src/schemas/<domain>.ts` | `src/schemas/auth.ts` |

**Quy tắc:**

- Dùng Zod
- Export cả schema lẫn inferred type: `export type LoginFormValues = z.infer<typeof loginSchema>`
- KHÔNG đặt schema trong `components/` — schema là validation logic, không phải UI

### Types → `src/types/`

| Loại         | Vị trí                  | Ví dụ                               |
| ------------ | ----------------------- | ----------------------------------- |
| Domain types | `src/types/<domain>.ts` | `auth.ts`, `order.ts`, `voucher.ts` |

**Quy tắc:**

- Chứa interfaces cho domain models, API responses, API DTOs
- KHÔNG define inline type trong page nếu đã có shared type hoặc có thể dùng `z.infer`
- Xoá type không ai import (dead types)

### Store → `src/store/`

| Loại          | Vị trí                       | Ví dụ             |
| ------------- | ---------------------------- | ----------------- |
| Zustand store | `src/store/use<Tên>Store.ts` | `useAuthStore.ts` |

**Quy tắc:**

- Store file CHỈ chứa Zustand store definition
- KHÔNG đặt API logic, service functions, hay utility helpers trong store file
- Mỗi store 1 concern: auth store, app store, cart store, v.v.

### Utils → `src/utils/`

| Loại           | Vị trí               | Ví dụ                              |
| -------------- | -------------------- | ---------------------------------- |
| Pure functions | `src/utils/<tên>.ts` | `format.ts`, `cn.tsx`, `device.ts` |

**Quy tắc:**

- Chỉ chứa pure functions, không có side effects
- Nếu function dùng ở ≥2 files → đưa vào utils, KHÔNG copy-paste

### Styles → `src/styles/`

| Loại              | Vị trí                        | Ví dụ                |
| ----------------- | ----------------------------- | -------------------- |
| Shared CSS module | `src/styles/<tên>.module.css` | `page-bg.module.css` |

**Quy tắc:**

- CSS dùng chung giữa nhiều pages → `src/styles/`
- CSS riêng 1 page → cùng folder với page (`src/app/vouchers/vouchers.module.css`)
- Dùng `@import` để compose shared CSS vào page CSS

---

## 3. Naming Conventions

| Loại              | Convention                                    | Ví dụ                                      |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| Component files   | **PascalCase**                                | `AppTopbar.tsx`, `VoucherDetailsModal.tsx` |
| Component folders | **camelCase**                                 | `buttonField/`, `inputField/`              |
| Feature folders   | **camelCase**                                 | `landing/`, `vouchers/`, `policy/`         |
| Hook files        | **camelCase** + `use` prefix                  | `useAuth.ts`, `useOrders.ts`               |
| Store files       | **camelCase** + `use` prefix + `Store` suffix | `useAuthStore.ts`                          |
| Service files     | **kebab-case** + `.service.ts`                | `order.service.ts`, `auth.service.ts`      |
| Type files        | **kebab-case** hoặc **camelCase**             | `system-config.ts`, `auth.ts`              |
| Schema files      | **camelCase**                                 | `auth.ts`                                  |
| CSS modules       | **kebab-case** + `.module.css`                | `page-bg.module.css`                       |
| Route folders     | **kebab-case**                                | `orders/`, `vouchers/`                     |
| Route groups      | **`(tên)`**                                   | `(auth)`, `(main)`                         |
| Utility files     | **camelCase**                                 | `format.ts`, `cn.tsx`                      |

---

## 4. Import Order Convention

Short Keys:
Windows: Shift + ALT + O
Mac: Shift + Option + O

Sắp xếp imports theo thứ tự:

```tsx
// 1. React / framework
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Phone, LockKeyhole } from "lucide-react";

// 3. Internal: schemas, hooks, utils, stores
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { useLogin } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";

// 4. Internal: components
import InputField from "@/components/inputField";
import ButtonField from "@/components/buttonField";

// 5. Internal: types (type-only imports)
import type { Order } from "@/types/order";

// 6. Local: CSS modules, relative imports
import styles from "./orders.module.css";
```

---

## 5. Dependency Flow

```
Page (src/app/)
  ├── imports Hooks (src/hooks/)
  │     └── imports Services (src/lib/api/*.service.ts)
  │           └── imports Client (src/lib/api/client.ts)
  │                 └── imports Utils (src/lib/api/utils.ts)
  ├── imports Schemas (src/schemas/)
  ├── imports Components (src/components/)
  ├── imports Utils (src/utils/)
  └── imports Types (src/types/)

Store (src/store/)
  └── imports Types (src/types/)

Service (src/lib/api/)
  ├── imports Client (src/lib/api/client.ts)
  ├── imports Utils (src/lib/api/utils.ts)
  └── imports Types (src/types/)
```

**KHÔNG tạo circular dependencies.** Hướng luôn là: Page → Hook → Service → Client.

---

## 6. Các điều lưu ý quan trọng

### DO ✓

- **Dùng `apiRequest` / `api` từ `client.ts`** cho mọi API call
- **Dùng `z.infer<typeof schema>`** cho form types thay vì define inline
- **Tách hook theo domain** — 1 file = 1 domain (auth, profile, orders)
- **Tách component khi >50 dòng** hoặc dùng ở nhiều nơi
- **Dùng shared format functions** từ `src/utils/format.ts`
- **Đặt redirect/navigation ở page** (onSubmit handler), không ở hook
- **Export type kèm schema** — `export type XFormValues = z.infer<typeof xSchema>`
- **`"use client"` chỉ ở page/component level**, không ở hooks hay utils
- **Dùng `async/await`** nhất quán, không mix với `.then()`
- **Inline logic đơn giản** vào method gọi nó nếu chỉ dùng 1 lần

### DON'T ✗

- **KHÔNG copy-paste functions** giữa các files — extract ra shared utils
- **KHÔNG đặt API logic trong store** — store chỉ chứa state + actions
- **KHÔNG define schema trong `components/`** — schemas thuộc `src/schemas/`
- **KHÔNG inline type** khi đã có shared type hoặc schema infer
- **KHÔNG để dead code** — xoá exports không ai import, xoá commented-out blocks
- **KHÔNG tự viết fetch wrapper** riêng trong service — dùng `client.ts`
- **KHÔNG redirect ở cả hook lẫn page** — chọn 1 nơi (ưu tiên page)
- **KHÔNG dùng `"use client"` trong hook files**
- **KHÔNG đặt PascalCase cho folder** (trừ component files)
- **KHÔNG tạo function con chỉ dùng 1 lần** trừ khi logic phức tạp (>5 dòng) hoặc cần giải thích ý nghĩa
- **KHÔNG dùng `.then()` chains** — dùng `async/await` cho nhất quán
- **KHÔNG tạo identity functions** (functions chỉ return đúng input, vd: `buildPath(path) { return path }`)

### Quy tắc tách / gom function trong service

```
Dùng ≥2 lần?
  ├── Có  → Tách thành function riêng (vd: normalizeOrder, getOrderDtos)
  └── Không (chỉ dùng 1 lần)
        ├── Logic ≤5 dòng hoặc 1 expression → Inline vào method gọi nó
        └── Logic >5 dòng VÀ phức tạp       → Có thể tách, đặt tên rõ nghĩa
```

Ví dụ **NÊN inline** (dùng 1 lần, logic đơn giản):
```typescript
// ✗ Tách thừa
function extractArray(res) { return res.data ?? []; }
function buildPath(path) { return path; }
function toQueryParams(params) { return { page: params.page, limit: params.limit }; }

// ✓ Inline trực tiếp
const items = response.data ?? [];
const params = { page: p.page, limit: p.limit };
```

Ví dụ **NÊN tách** (dùng nhiều lần, hoặc logic phức tạp):
```typescript
// ✓ Dùng 3 lần → tách
function getOrderDtos(res: OrderApiResponse): OrderApiDto[] {
  return Array.isArray(res.data) ? res.data : (res.data?.orders ?? []);
}

// ✓ Logic phức tạp, nhiều bước → tách dù dùng 1 lần
function normalizeOrder(record: OrderApiDto): Order {
  // 20+ dòng mapping, normalization, fallback...
}
```

### Tech Stack Notes

- **Tailwind CSS v4** — config qua CSS (`@import "tailwindcss"` trong `globals.css`), không có `tailwind.config.js`
- **Next.js 16** — có breaking changes so với training data, check `node_modules/next/dist/docs/` trước khi viết code mới
- **Zod v4** — dùng cho validation, kết hợp `@hookform/resolvers/zod`
- **Auth flow** — NextAuth v4 cho session, Zustand `useAuthStore` cho client-side token management (localStorage)
- **React Query** — dùng cho server state (API data), Zustand cho client state (auth, theme)

---

## 7. Hướng dẫn cấu hình Editor & Tools

### 7.1 Prettier — Auto Format on Save

**Yêu cầu:** Cài extension [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`) trong VS Code / Cursor.

Config đã được thiết lập sẵn:

| File | Mục đích |
|---|---|
| `.prettierrc` | Prettier rules (semi, quotes, tab width, Tailwind plugin) |
| `.vscode/settings.json` | Auto format on save, ESLint fix on save |

**Cách hoạt động:**
- Mỗi lần **Save** (`Ctrl+S`) → Prettier tự format file
- ESLint auto-fix chạy kèm khi save
- Tailwind classes được tự động sort theo chuẩn nhờ `prettier-plugin-tailwindcss`

**Prettier rules chính:**

| Rule | Giá trị | Giải thích |
|---|---|---|
| `semi` | `true` | Luôn có dấu `;` cuối dòng |
| `singleQuote` | `false` | Dùng `"double quotes"` |
| `tabWidth` | `2` | Indent 2 spaces |
| `trailingComma` | `"all"` | Dấu `,` cuối cùng trong object/array |
| `printWidth` | `80` | Xuống dòng khi quá 80 ký tự |
| `endOfLine` | `"lf"` | Unix line endings |

**Nếu format không hoạt động:**

1. Kiểm tra extension Prettier đã cài chưa: `Ctrl+Shift+X` → search "Prettier"
2. Kiểm tra default formatter: `Ctrl+Shift+P` → "Format Document With..." → chọn Prettier
3. Kiểm tra setting: `Ctrl+,` → search "format on save" → bật lên
4. Restart editor nếu vừa cài extension

### 7.2 ESLint

Config: `eslint.config.mjs` (flat config format)

- Dùng `eslint-config-next` với core-web-vitals + TypeScript rules
- `eslint-config-prettier` đã cài để tắt các ESLint rules xung đột với Prettier
- Auto-fix on save đã bật trong `.vscode/settings.json`

Chạy lint thủ công:
```bash
npm run lint
```

### 7.3 TypeScript

Config: `tsconfig.json`

| Setting | Giá trị | Giải thích |
|---|---|---|
| `strict` | `true` | Bật tất cả strict checks |
| `paths.@/*` | `./src/*` | Import alias: `@/hooks/useAuth` thay vì `../../hooks/useAuth` |
| `moduleResolution` | `bundler` | Resolve kiểu bundler (Next.js) |

### 7.4 Tailwind CSS v4

- **Không có `tailwind.config.js`** — Tailwind v4 config qua CSS
- Config nằm trong `src/app/globals.css` với `@import "tailwindcss"`
- Plugin sort classes: `prettier-plugin-tailwindcss` (tự động khi format)

### 7.5 Scripts

```bash
npm run dev        # Chạy dev server tại http://localhost:3005
npm run build      # Build production
npm run start      # Chạy production build
npm run lint       # Chạy ESLint check
```

---

## 8. Tạo feature mới — Checklist

Khi thêm 1 feature mới (ví dụ: `cart`), tạo các files theo thứ tự:

1. **Types:** `src/types/cart.ts` — interfaces cho domain models + API DTOs
2. **Service:** `src/lib/api/cart.service.ts` — API calls, dùng `apiRequest` từ `client.ts`
3. **Hook:** `src/hooks/useCart.ts` — React Query hooks wrap service
4. **Schema (nếu có form):** `src/schemas/cart.ts` — Zod schemas + inferred types
5. **Components (nếu cần tái sử dụng):** `src/components/cart/<Component>.tsx`
6. **Page:** `src/app/cart/page.tsx` — page component
7. **CSS (nếu cần):** `src/app/cart/cart.module.css` hoặc import shared từ `src/styles/`
