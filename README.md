# Sweepro Frontend

Modern React SPA powering the Sweepro home cleaning subscription platform. Built with React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

**Live URL:** `https://www.sweepro.in`
**Backend API:** `https://sweepro.in`
**Hosted on:** Vercel

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Features](#features)
7. [Routing & Pages](#routing--pages)
8. [Authentication](#authentication)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Payment Flow (Razorpay)](#payment-flow-razorpay)
12. [Real-Time Notifications](#real-time-notifications)
13. [UI & Design System](#ui--design-system)
14. [Forms & Validation](#forms--validation)
15. [Role-Based Access Control](#role-based-access-control)
16. [Performance](#performance)
17. [Deployment](#deployment)
18. [Configuration Files](#configuration-files)
19. [Service Area Coverage](#service-area-coverage)
20. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Language | TypeScript | 5.5 |
| Bundler | Vite + SWC | 5.4 |
| Styling | Tailwind CSS | 3.4 |
| UI Components | shadcn/ui (Radix UI) | 40+ primitives |
| State (Server) | TanStack React Query | 5.x |
| State (Client) | React Context API | - |
| Routing | React Router | 6.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Auth | Firebase (Google OAuth) + JWT | - |
| Payments | Razorpay (dynamic SDK) | - |
| Charts | Recharts | 2.12 |
| Icons | Lucide React, Tabler Icons | - |
| Animation | Framer Motion (`motion`) | 12.x |
| Toasts | Sonner + shadcn Toast | - |
| File Upload | react-dropzone | 14.x |
| QR Code | html5-qrcode | 2.3 |
| Theme | next-themes (dark mode) | 0.3 |

---

## Architecture Overview

```
 ┌──────────────────────────────────────────────────────────────┐
 │                         Browser                              │
 │                                                              │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │                   React Application                     │  │
 │  │                                                        │  │
 │  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
 │  │  │  Pages   │  │  Route   │  │   React Contexts     │ │  │
 │  │  │  (35+)   │──│  Guards  │  │  - UserContext       │ │  │
 │  │  │          │  │          │  │  - BookingFormContext │ │  │
 │  │  └────┬─────┘  └──────────┘  │  - NotificationCtx   │ │  │
 │  │       │                      └──────────┬───────────┘ │  │
 │  │       ▼                                 │             │  │
 │  │  ┌──────────────┐   ┌──────────────────┐│             │  │
 │  │  │  Components  │   │ React Query      ││             │  │
 │  │  │  shadcn/ui   │   │ (Server State)   ││             │  │
 │  │  │  40+ prims   │   │ 10+ query hooks  ││             │  │
 │  │  └──────────────┘   └────────┬─────────┘│             │  │
 │  │                              │           │             │  │
 │  │                    ┌─────────▼───────────▼──────────┐  │  │
 │  │                    │      Services Layer (17)       │  │  │
 │  │                    │  Fetch API + CSRF + Auth       │  │  │
 │  │                    └──────────┬──────────┬──────────┘  │  │
 │  └───────────────────────────────┼──────────┼─────────────┘  │
 │                                  │          │                │
 └──────────────────────────────────┼──────────┼────────────────┘
                                    │          │
                      HTTPS (REST)  │          │  WSS (WebSocket)
                                    ▼          ▼
                          ┌─────────────────────────────┐
                          │     Backend API (Render)     │
                          │     https://sweepro.in       │
                          └─────────────────────────────┘
```

---

## Project Structure

```
sweep-pro-frontend/
├── public/
│   ├── assets/
│   │   ├── logo.png                    # Brand logo (dark background)
│   │   └── logo-black.png             # Brand logo (light background)
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── site.webmanifest                # PWA manifest
│   └── notification-sound.mp3         # Real-time notification audio
│
├── src/
│   ├── main.tsx                        # React root mount (createRoot)
│   ├── App.tsx                         # Provider tree + all route definitions
│   ├── index.css                       # Global CSS variables, design system, animations
│   │
│   ├── config/
│   │   └── firebase.ts                 # Firebase app/auth initialization
│   │
│   ├── constants/
│   │   └── addresses.ts                # 39 Hyderabad service area localities
│   │
│   ├── contexts/                       # React Context providers
│   │   ├── UserContext.tsx              # Auth state, login/logout, offline detection
│   │   ├── BookingFormContext.tsx       # Global booking modal state
│   │   └── NotificationContext.tsx     # WebSocket notifications + query cache sync
│   │
│   ├── data/
│   │   └── plans.ts                    # Static plan data (Basic/Standard/Premium)
│   │
│   ├── features/
│   │   └── notifications/              # Notification feature module
│   │       ├── api.ts                  # REST API wrappers
│   │       ├── hooks.ts                # 6 React Query hooks (with optimistic updates)
│   │       ├── queryKeys.ts            # Query key factory
│   │       ├── types.ts                # TypeScript types
│   │       ├── utils.tsx               # Routing/display helpers
│   │       └── components/
│   │           ├── NotificationItem.tsx
│   │           ├── NotificationEmptyState.tsx
│   │           └── NotificationSkeletonList.tsx
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-mobile.tsx              # useIsMobile() — 768px breakpoint
│   │   ├── use-toast.ts                # shadcn toast hook
│   │   ├── useBufferAccess.ts          # Buffer system access check
│   │   ├── useBufferPeriod.ts          # Buffer period status polling
│   │   └── queries/                    # React Query hooks
│   │       ├── useBookingQueries.ts
│   │       ├── useBufferQueries.ts
│   │       ├── useMaidAssignmentQuery.ts
│   │       ├── usePaymentQueries.ts
│   │       ├── useProfileQueries.ts
│   │       └── useSubscriptionQueries.ts
│   │
│   ├── lib/
│   │   ├── queryKeys.ts                # Centralized query key factories
│   │   └── utils.ts                    # cn() utility (clsx + tailwind-merge)
│   │
│   ├── pages/                          # Page-level components (35+)
│   │   │
│   │   │ -- Public
│   │   ├── LandingPage.tsx             # Marketing page (hero, features, pricing, FAQ)
│   │   ├── LoginPage.tsx               # Email/password + Google OAuth
│   │   ├── SignupPage.tsx              # Registration with role selector
│   │   ├── ForgotPasswordPage.tsx      # Password reset request
│   │   ├── ResetPasswordPage.tsx       # Token-based password reset
│   │   ├── TermsPage.tsx
│   │   ├── PrivacyPolicyPage.tsx
│   │   ├── CookiePolicyPage.tsx
│   │   ├── NotFound.tsx                # 404 page
│   │   │
│   │   │ -- Shared (authenticated)
│   │   ├── CompleteProfilePage.tsx      # Post-OAuth onboarding
│   │   ├── ProfilePage.tsx
│   │   ├── EnhancedProfilePage.tsx
│   │   ├── NotificationsPage.tsx
│   │   │
│   │   │ -- Customer
│   │   ├── UserDashboard.tsx           # Stats, subscription, maid info, quick booking
│   │   ├── BookingsPage.tsx            # View/filter/cancel bookings
│   │   ├── SubscriptionPage.tsx        # Browse plans
│   │   ├── SubscriptionDetailsPage.tsx # Plan detail with pricing
│   │   ├── MonthlySubscriptionDashboard.tsx
│   │   ├── MonthlyServiceCalendar.tsx
│   │   ├── BufferManagementPage.tsx    # Buffer day requests
│   │   ├── PaymentOptionsPage.tsx
│   │   ├── ReviewPaymentPage.tsx
│   │   ├── PaymentsPage.tsx            # Payment history + invoices
│   │   ├── SupportPage.tsx
│   │   │
│   │   │ -- Maid
│   │   ├── MaidDashboard.tsx
│   │   ├── MaidDashboardEnhanced.tsx   # Full dashboard with stats
│   │   ├── MaidBookingsPage.tsx        # Accept/reject bookings
│   │   ├── MaidVerification.tsx        # Submit documents
│   │   ├── MaidAvailabilityPage.tsx
│   │   ├── MaidSupportPage.tsx
│   │   ├── MaidProfilePage.tsx
│   │   │
│   │   │ -- Admin
│   │   ├── AdminDashboard.tsx          # Tab-based admin panel
│   │   ├── AdminFeedbackPage.tsx
│   │   ├── AdminMaidVerification.tsx
│   │   └── AdminProfilePage.tsx
│   │
│   ├── services/                       # API service layer (17 modules)
│   │   ├── api.ts                      # Base URL, fetch wrapper, CSRF, auth tokens
│   │   ├── authService.ts              # Login, register, OAuth, logout
│   │   ├── firebaseAuth.ts             # Google OAuth popup
│   │   ├── bookingService.ts           # Booking CRUD
│   │   ├── subscriptionService.ts      # Plans, subscribe, monthly status
│   │   ├── paymentService.ts           # Razorpay orders, verify, invoices
│   │   ├── notificationService.ts      # Notification REST API
│   │   ├── websocketService.ts         # WebSocket singleton (reconnect, heartbeat)
│   │   ├── maidService.ts              # Maid availability
│   │   ├── assignmentService.ts        # Booking assignment workflow
│   │   ├── verificationService.ts      # Maid document verification
│   │   ├── bufferService.ts            # Buffer day management
│   │   ├── feedbackService.ts          # Customer feedback
│   │   ├── qrService.ts               # QR-based booking completion
│   │   ├── automaticBookingService.ts  # Auto-generated bookings
│   │   ├── customerAssignmentService.ts # Admin maid-customer assignment
│   │   └── addressService.ts           # localStorage address storage
│   │
│   ├── types/
│   │   └── user.ts                     # User, Subscription, Plan, PaymentDetails types
│   │
│   ├── utils/
│   │   ├── errorUtils.ts               # parseApiError() for user-friendly messages
│   │   └── debug.ts                    # Dev API debug helpers
│   │
│   └── components/
│       ├── ErrorBoundary.tsx            # Root + section-level error boundaries
│       ├── Navbar.tsx                   # Landing page responsive navbar
│       ├── Footer.tsx                   # Landing page footer
│       ├── ScrollToTop.tsx              # Scroll restoration on route change
│       ├── PaymentForm.tsx              # Razorpay checkout
│       ├── SubscriptionModal.tsx        # Plan selection modal
│       ├── UserProfileForm.tsx
│       │
│       ├── auth/
│       │   └── RequireAuth.tsx          # RequireAuth, RequireGuest, RequireRole
│       │
│       ├── admin/                       # Admin dialog components
│       │   ├── EditPlanDialog.tsx
│       │   ├── EditUserDialog.tsx
│       │   ├── MaidDetailsModal.tsx
│       │   └── UserDetailsModal.tsx
│       │
│       ├── dashboard/                   # 20+ dashboard components
│       │   ├── AdminDashboardLayout.tsx
│       │   ├── AdminDashboardSidebar.tsx
│       │   ├── AdminUsersSection.tsx
│       │   ├── AdminMaidsSection.tsx
│       │   ├── AdminBookingsSection.tsx
│       │   ├── AdminSubscriptionsSection.tsx
│       │   ├── AdminPaymentsSection.tsx
│       │   ├── AdminMaidVerificationSection.tsx
│       │   ├── AdminBufferManagementSection.tsx
│       │   ├── AdminAutomaticBookingsSection.tsx
│       │   ├── DashboardLayout.tsx      # Customer layout
│       │   ├── DashboardNavbar.tsx       # Top bar (notifications, user menu)
│       │   ├── DashboardSidebar.tsx      # Customer sidebar
│       │   ├── MaidDashboardLayout.tsx
│       │   ├── MaidDashboardSidebar.tsx
│       │   ├── MaidAssignmentCard.tsx
│       │   ├── MaidAssignmentRequestsSection.tsx
│       │   ├── MaidBookingRequestsSection.tsx
│       │   ├── MonthlySubscriptionCard.tsx
│       │   └── UserDashboardSkeleton.tsx
│       │
│       ├── feedback/                    # Feedback components
│       │   ├── FeedbackCard.tsx
│       │   ├── FeedbackForm.tsx         # Multi-dimensional star rating
│       │   ├── FeedbackActionPanel.tsx
│       │   ├── AuditTrailModal.tsx
│       │   └── MaidPerformanceOverview.tsx
│       │
│       ├── forms/
│       │   ├── QuickBookingForm.tsx      # Global booking modal
│       │   └── BufferDaysRequestDialog.tsx
│       │
│       ├── landing/                     # Landing page sections
│       │   ├── HeroSection.tsx
│       │   ├── FeaturesSection.tsx
│       │   ├── HowItWorksSection.tsx
│       │   ├── PricingSection.tsx
│       │   ├── SweeproAboutUs.tsx
│       │   ├── TestimonialsSection.tsx
│       │   └── FAQSection.tsx
│       │
│       ├── notifications/
│       │   └── NotificationBell.tsx     # Popover notification center
│       │
│       ├── profile/
│       │   ├── ProfileEditDialog.tsx
│       │   ├── ChangePasswordDialog.tsx
│       │   └── ImageUploadDialog.tsx
│       │
│       ├── qr/                          # QR code components
│       │   ├── MaidQrDialog.tsx         # Maid displays QR
│       │   ├── QrCodeRenderer.tsx
│       │   └── QrScannerDialog.tsx      # Customer scans QR
│       │
│       └── ui/                          # 40+ shadcn/ui primitives
│           ├── accordion.tsx
│           ├── alert-dialog.tsx
│           ├── badge.tsx
│           ├── button.tsx
│           ├── calendar.tsx
│           ├── card.tsx
│           ├── chart.tsx
│           ├── dialog.tsx
│           ├── dropdown-menu.tsx
│           ├── file-upload.tsx
│           ├── document-upload.tsx
│           ├── form.tsx
│           ├── input.tsx
│           ├── input-otp.tsx
│           ├── select.tsx
│           ├── separator.tsx
│           ├── sheet.tsx
│           ├── sidebar.tsx
│           ├── skeleton.tsx
│           ├── sonner.tsx
│           ├── table.tsx
│           ├── tabs.tsx
│           ├── toast.tsx
│           ├── tooltip.tsx
│           └── ... (40+ total)
│
├── index.html                          # SPA entry with SEO meta tags
├── vite.config.ts                      # Vite config (SWC, port 8080, API proxy)
├── tailwind.config.ts                  # Tailwind config (custom theme)
├── tsconfig.json                       # TypeScript config (path alias @/*)
├── components.json                     # shadcn/ui configuration
├── vercel.json                         # Vercel deployment config
├── eslint.config.js                    # ESLint flat config
└── package.json
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ (20.x recommended) |
| npm | 9+ |
| Backend API | Running locally or accessible remotely |

### Local Development

```bash
# 1. Install dependencies
cd sweep-pro-frontend
npm install

# 2. Configure environment (optional for local dev)
#    By default, Vite proxies /api to http://localhost:3000
#    No .env changes needed if backend runs on port 3000

# 3. Start development server
npm run dev
# Opens at http://localhost:8080

# 4. (Optional) Type checking
npm run typecheck

# 5. (Optional) Linting
npm run lint
```

### Build for Production

```bash
npm run build           # Production build → dist/
npm run preview         # Preview production build locally
```

---

## Environment Variables

All environment variables must be prefixed with `VITE_` (Vite convention).

### Firebase Configuration (required for Google OAuth)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### API Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` (dev via proxy) | Backend API base URL for production |
| `VITE_BACKEND_ORIGIN` | - | Backend origin for WebSocket connection |
| `VITE_WS_URL` | - | Custom WebSocket URL override |

> **Note:** In development, the Vite dev server proxies `/api` requests to `http://localhost:3000`, so no API URL configuration is needed locally.

---

## Features

### Customer Features
1. **Subscription Plans** — Browse and subscribe to Basic (2x/week), Standard (5x/week), or Premium (daily) cleaning plans
2. **Booking Management** — Create, view, filter, and cancel bookings with time slot selection
3. **Payment Processing** — Razorpay checkout for bookings and subscriptions, invoice download/preview
4. **Monthly Calendar** — Calendar view of scheduled and completed services
5. **Buffer Period** — Pause subscription service with admin approval, track remaining buffer days
6. **Maid Assignment** — View assigned maid details, assignment status
7. **Feedback System** — Rate completed services on quality, punctuality, and behavior
8. **QR Code Completion** — Scan maid's QR code to verify service completion
9. **Dashboard** — Stats overview (total bookings, spend, upcoming), quick actions
10. **Profile Management** — Update profile, upload image, change password
11. **Notifications** — Real-time WebSocket notifications with sound alerts
12. **Support** — Submit support queries

### Maid Features
1. **Dashboard** — Earnings, verification status, booking statistics
2. **Booking Management** — View assigned bookings, accept/reject requests
3. **Assignment Requests** — Accept/reject assignment requests from admin
4. **Document Verification** — Upload Aadhar card, police verification, and photo for verification
5. **QR Code** — Display personal QR code for customer to scan on service completion
6. **Availability** — Set and manage availability status
7. **Profile** — View and update profile information

### Admin Features
1. **User Management** — View all users, edit details, view detailed modals
2. **Maid Management** — Track maids, availability, weekly off days, performance
3. **Booking Management** — View all bookings, assign maids, handle reassignment
4. **Subscription Management** — View and manage all customer subscriptions
5. **Payment Management** — View all payments, update statuses
6. **Maid Verification** — Review submitted documents, approve/reject
7. **Buffer Management** — Approve/reject buffer requests, view statistics
8. **Automatic Bookings** — Create daily bookings, manage eligible customers
9. **Feedback Management** — View all feedback, respond with admin comments
10. **Customer-Maid Assignment** — Permanently assign maids to customers

---

## Routing & Pages

All routes defined in `App.tsx`. Every page uses `React.lazy()` for code splitting.

### Public Routes

| Path | Page | Guard |
|---|---|---|
| `/` | Landing Page | - |
| `/login` | Login | `RequireGuest` |
| `/signup` | Signup | `RequireGuest` |
| `/forgot-password` | Forgot Password | - |
| `/reset-password` | Reset Password | - |
| `/terms` | Terms of Service | - |
| `/privacy` | Privacy Policy | - |
| `/cookies` | Cookie Policy | - |
| `*` | 404 Not Found | - |

### Customer Routes

| Path | Page | Guard |
|---|---|---|
| `/dashboard` | User Dashboard | `RequireRole(CUSTOMER)` |
| `/bookings` | Bookings | `RequireRole(CUSTOMER)` |
| `/subscription` | Subscription Plans | `RequireRole(CUSTOMER)` |
| `/subscription/:planId` | Plan Details | `RequireRole(CUSTOMER)` |
| `/monthly-subscription` | Monthly Dashboard | `RequireRole(CUSTOMER)` |
| `/calendar` | Service Calendar | `RequireRole(CUSTOMER)` |
| `/buffer` | Buffer Management | `RequireRole(CUSTOMER)` |
| `/payment-options` | Payment Options | `RequireRole(CUSTOMER)` |
| `/review-payment` | Review Payment | `RequireRole(CUSTOMER)` |
| `/payments` | Payment History | `RequireRole(CUSTOMER)` |
| `/support` | Support | `RequireRole(CUSTOMER)` |

### Maid Routes

| Path | Page | Guard |
|---|---|---|
| `/maid-dashboard` | Enhanced Dashboard | `RequireRole(MAID)` |
| `/maid-bookings` | Bookings | `RequireRole(MAID)` |
| `/maid-verification` | Document Upload | `RequireRole(MAID)` |
| `/maid-availability` | Availability | `RequireRole(MAID)` |
| `/maid-support` | Support | `RequireRole(MAID)` |

### Admin Routes

| Path | Page | Guard |
|---|---|---|
| `/admin` | Admin Dashboard | `RequireRole(ADMIN)` |
| `/admin/feedback` | Feedback Management | `RequireRole(ADMIN)` |
| `/admin/profile` | Admin Profile | `RequireRole(ADMIN)` |

### Shared Authenticated Routes

| Path | Page | Guard |
|---|---|---|
| `/complete-profile` | Profile Completion | `RequireAuth` |
| `/profile` | Profile | `RequireAuth` |
| `/profile/enhanced` | Enhanced Profile | `RequireAuth` |
| `/notifications` | Notifications | `RequireAuth` |

---

## Authentication

### Two Authentication Strategies

**Email/Password:**
```
User submits form → POST /api/auth/login → Backend sets HttpOnly JWT cookie
→ User stored in localStorage → State updated in UserContext
```

**Google OAuth (Firebase):**
```
User clicks Google → Firebase popup → ID token received
→ POST /api/auth/firebase/login → Backend issues app JWT
→ If new user: redirect to /complete-profile
→ Complete profile → POST /api/auth/firebase/complete-profile
```

### Session Management

- **Primary:** HttpOnly JWT cookie (set by backend, sent automatically via `credentials: 'include'`)
- **Fallback:** `localStorage.authToken` with `Authorization: Bearer` header (cross-origin deployments)
- **Session validation:** On app mount, calls `/auth/me` or `/auth/firebase/me` to verify active session
- **Expiry detection:** Client-side TTL check (1 day default) + JWT `exp` claim parsing
- **Global 401 handler:** `CustomEvent('auth:unauthorized')` triggers automatic logout

### CSRF Protection
- Backend sets non-HttpOnly `csrf-token` cookie on each response
- Frontend reads cookie value and attaches as `X-CSRF-Token` header on POST/PUT/PATCH/DELETE
- Implemented in `src/services/api.ts`

### Route Guards (`src/components/auth/RequireAuth.tsx`)

| Guard | Behavior |
|---|---|
| `RequireAuth` | Redirects to `/login` if not authenticated |
| `RequireGuest` | Redirects to role-appropriate dashboard if authenticated |
| `RequireRole` | Redirects to correct dashboard if wrong role |

> Role-based access is enforced **server-side**. Frontend guards are a UX convenience layer only.

---

## State Management

### Client State: React Context API

**UserContext** — Authentication state
- `user`, `isAuthenticated`, `isLoading`, `authInitialized`, `isOffline`
- `login()`, `logout()`, `updateUser()`, `refreshUser()`
- Global 401 listener for automatic logout
- Online/offline detection with amber banner

**BookingFormContext** — Global booking modal
- `openBookingForm(date?)`, `closeBookingForm()`
- Auth check: shows toast if unauthenticated

**NotificationContext** — WebSocket notifications
- Connects WebSocket on login, disconnects on logout
- Upserts notifications into React Query cache
- Shows Sonner toast + plays notification sound

### Server State: TanStack React Query v5

**Configuration:**
```
staleTime: 30 seconds
gcTime: 5 minutes (garbage collection)
refetchOnWindowFocus: false
retry: max 2 for 5xx, no retry for 4xx
mutations: never retry
```

**Query Hooks:**

| Hook | Data | Stale Time |
|---|---|---|
| `useUserSubscription` | Current subscription | 60s |
| `useSubscriptionPlans` | Available plans | 5 min |
| `useMonthlySubscriptionStatus` | Monthly status + buffer | 30s |
| `useBookingQueries` | Customer/maid bookings | 30s |
| `usePaymentQueries` | Payment history | 30s |
| `useProfileQueries` | User profile | 30s |
| `useMaidAssignmentQuery` | Current assignment | 30s |
| `useBufferQueries` | Buffer info + history | 30s |
| `useNotificationsListQuery` | Notifications (paginated) | 10s |
| `useUnreadCountQuery` | Unread count | 10s |

**Optimistic Updates:** Mark-as-read, mark-all-read, delete, and clear-read mutations all use optimistic updates for instant UI feedback.

---

## API Integration

### Architecture (`src/services/api.ts`)

**HTTP Client:** Native `fetch()` API (not axios)

**Base URL Resolution:**
- **Development:** Vite proxy at `/api` → `http://localhost:3000` (zero CORS issues)
- **Production:** `VITE_API_BASE_URL` environment variable

**Request Pipeline:**
1. Set `Content-Type: application/json` (auto-skipped for FormData)
2. Attach `credentials: 'include'` (sends HttpOnly cookies)
3. Attach `Authorization: Bearer <token>` if auth required and token in localStorage
4. Attach `X-CSRF-Token` header on state-changing requests
5. On 401: dispatch `auth:unauthorized` event (triggers global logout)
6. Normalize response to `{ success, message, data }` format

### 17 Service Modules

| Service | Module | Key Methods |
|---|---|---|
| API Core | `api.ts` | `apiRequest()`, token management |
| Auth | `authService.ts` | `login()`, `register()`, `signInWithGoogle()`, `logout()` |
| Firebase | `firebaseAuth.ts` | `signInWithGoogle()`, `getFirebaseIdToken()` |
| Bookings | `bookingService.ts` | `createBooking()`, `getUserBookings()`, `cancelBooking()` |
| Subscriptions | `subscriptionService.ts` | `getPlans()`, `subscribe()`, `getMonthlyStatus()` |
| Payments | `paymentService.ts` | `createOrder()`, `verify()`, `downloadInvoice()` |
| Notifications | `notificationService.ts` | CRUD operations |
| WebSocket | `websocketService.ts` | `connect()`, `disconnect()`, `onMessage()` |
| Maid | `maidService.ts` | Availability management |
| Assignments | `assignmentService.ts` | Accept/reject workflow |
| Verification | `verificationService.ts` | Document upload and review |
| Buffer | `bufferService.ts` | Buffer requests, history, admin actions |
| Feedback | `feedbackService.ts` | Submit, view, admin response |
| QR | `qrService.ts` | QR-based booking completion |
| Auto Bookings | `automaticBookingService.ts` | Auto-booking management |
| Customer Assign | `customerAssignmentService.ts` | Admin maid-customer mapping |
| Address | `addressService.ts` | localStorage address storage |

---

## Payment Flow (Razorpay)

Razorpay SDK is loaded **dynamically** at runtime (no npm package).

### Flow

```
1. Customer selects plan/booking
2. Frontend calls POST /payments/razorpay/booking/create-order
3. Backend creates Razorpay order, returns order_id
4. Frontend opens Razorpay checkout popup
5. Customer completes payment in Razorpay
6. On success: Frontend calls POST /payments/razorpay/verify
7. Backend verifies HMAC signature → marks payment COMPLETED
8. On failure: Frontend calls POST /payments/razorpay/failure
```

### Invoice Support
- **PDF Download:** Fetches invoice as blob, triggers browser download
- **In-Browser Preview:** Opens invoice PDF in new tab via blob URL

---

## Real-Time Notifications

### WebSocket Service (`src/services/websocketService.ts`)

- **Singleton pattern** — single connection per session
- **Protocol:** `ws://` (dev) or `wss://` (production)
- **Auth:** Token sent as first message (`{ type: 'auth', token }`) — not in URL
- **Heartbeat:** Ping every 30 seconds
- **Reconnection:** Exponential backoff (base 3s), max 5 attempts

### Notification Flow

```
WebSocket message received
    → NotificationContext processes message
    → Upserts into React Query cache (all matching queries)
    → Increments unread count in cache
    → Shows Sonner toast (top-right)
    → Plays notification-sound.mp3 (50% volume)
```

### Notification Bell (`NotificationBell.tsx`)
- Popover panel in dashboard navbar
- Unread count badge (animated)
- WebSocket connection status indicator (green/red dot)
- Actions: mark read, mark all read, delete, clear read

---

## UI & Design System

### Component Library
**shadcn/ui** — 40+ accessible primitives built on Radix UI, styled with Tailwind CSS.

### Design Tokens (`src/index.css`)

| Token | Light Value | Purpose |
|---|---|---|
| `--primary` | `hsl(248, 100%, 34%)` | Deep indigo (#1800ad) |
| `--tertiary` | `hsl(354, 100%, 40%)` | Red (#ca0013) |
| `--secondary` | `hsl(45, 24%, 91%)` | Warm beige (#eeebe3) |
| `--success` | `hsl(142, 71%, 45%)` | Green |
| `--warning` | `hsl(38, 92%, 50%)` | Orange |
| `--background` | `hsl(0, 0%, 100%)` | White |
| `--foreground` | `hsl(210, 20%, 12%)` | Near-black |

### Dark Mode
Full `.dark` class CSS variable overrides. Powered by `next-themes` with `darkMode: ["class"]`.

### Typography
**Font:** Inter (Google Fonts, weights 300-700)

### Gradients
- **Hero:** Deep indigo → red (135deg)
- **Card:** White → near-white (145deg)
- **Feature:** Warm gray → light indigo (135deg)

### Icons
- **Primary:** Lucide React
- **Secondary:** Tabler Icons React, React Icons

### Animation
- Page transitions via Framer Motion
- Custom CSS animations: fade-in, slide-up, slide-in-left/right, float, skeleton shimmer

### Responsive Design
- **Breakpoint:** 768px (mobile/desktop)
- Tailwind responsive classes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Sidebars collapse to Sheet/Drawer on mobile
- Navbar: hamburger menu on mobile
- Container: `max-width: 1400px` centered

---

## Forms & Validation

### Stack
- **React Hook Form** — Form state management
- **Zod** — Schema validation
- **@hookform/resolvers** — Zod ↔ React Hook Form bridge
- **shadcn/ui `<Form>`** — Wrapper around `FormProvider`

### Key Forms

| Form | Fields | Validation |
|---|---|---|
| Login | email, password, remember me | Zod schema |
| Signup | name, email, phone, password, role, address | Zod with custom refinements |
| Quick Booking | date, time slot, address | Date picker + select |
| Feedback | 4 star ratings, comment, improvements, recommend | Multi-dimensional |
| Profile Edit | name, phone, address fields | Zod |
| Change Password | current, new, confirm password | Zod with match refinement |
| Complete Profile | phone, role, apartment, address, pincode | Required fields |
| Buffer Request | days count, start date, reason, notes | Zod |

### Error Handling (`src/utils/errorUtils.ts`)
`parseApiError()` converts API errors to `{ formError, fieldErrors }`:
- Maps backend field names to frontend form fields
- Provides user-friendly error messages
- Handles network errors, 401s, duplicate email/phone

---

## Role-Based Access Control

### Three User Roles

| Role | Dashboard | Key Capabilities |
|---|---|---|
| **CUSTOMER** | `/dashboard` | Book services, subscribe, pay, rate, manage buffer |
| **MAID** | `/maid-dashboard` | Accept bookings, upload docs, manage availability |
| **ADMIN** | `/admin` | Manage all users, bookings, payments, verify maids |

### Frontend Enforcement
- `RequireAuth` — Must be logged in
- `RequireGuest` — Must NOT be logged in (login/signup pages)
- `RequireRole({ roles: ['CUSTOMER'] })` — Must have correct role
- Wrong-role users auto-redirect to their correct dashboard

> Server-side authorization is the source of truth. Frontend guards prevent UX confusion only.

---

## Performance

### Code Splitting
Every page uses `React.lazy()` with named chunk groups:
- `customer` — All customer pages in one chunk
- `maid` — All maid pages in one chunk
- `admin` — All admin pages in one chunk (largest, fully isolated)
- Individual chunks for auth pages, legal pages, 404

### React Query Optimization
- 30-second stale time prevents excessive refetching
- 5-minute garbage collection keeps cache lean
- No retry on 4xx errors (instant failure)
- `refetchOnWindowFocus: false` (no tab-switching refetch storms)

### Bundle Optimization
- SWC compiler (10-20x faster than Babel) via `@vitejs/plugin-react-swc`
- Tree-shaking via Vite/Rollup
- CSS: Tailwind purges unused classes in production

---

## Deployment

### Platform: Vercel

**`vercel.json`:**
```json
{
  "version": 2,
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Deployment Steps

```bash
# 1. Push to main branch (triggers Vercel auto-deploy)
git push origin main

# 2. Or deploy manually
npm run build                  # Build to dist/
vercel --prod                  # Deploy to Vercel
```

### Required Vercel Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://sweepro.in/api` |
| `VITE_BACKEND_ORIGIN` | `https://sweepro.in` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `sweepro-auth.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `sweepro-auth` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `sweepro-auth.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

### Build Output
- Output: `dist/` directory
- SPA routing: All paths rewrite to `index.html`

---

## Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite: SWC plugin, port 8080, API proxy to `:3000` |
| `tailwind.config.ts` | Custom theme, fonts, shadows, gradients, animations |
| `tsconfig.json` | Path alias `@/*` → `./src/*`, ES2020 target |
| `components.json` | shadcn/ui config (style: default, base: slate) |
| `vercel.json` | Vercel deployment (SPA rewrites, output dir) |
| `eslint.config.js` | Flat config, TypeScript-ESLint, React Hooks plugin |
| `postcss.config.js` | Tailwind CSS + Autoprefixer |
| `index.html` | SPA entry with SEO meta (OG, Twitter), PWA manifest |

---

## Service Area Coverage

Currently serving **39 localities in Hyderabad, India:**

Manikonda, Gachibowli, Kondapur, Hitech City, Madhapur, Banjara Hills, Jubilee Hills, Kukatpally, Miyapur, Ameerpet, SR Nagar, Begumpet, Secunderabad, Uppal, LB Nagar, Dilsukhnagar, Mehdipatnam, Tolichowki, Narsingi, Kokapet, Nanakramguda, Financial District, Raidurg, Wipro Circle, Khajaguda, Puppalaguda, Gandipet, Tellapur, Patancheru, Bachupally, Kompally, Medchal, Alwal, Malkajgiri, Nacharam, Nagole, Hayathnagar, Vanasthalipuram, Saroornagar

Defined in `src/constants/addresses.ts`.

---

## Troubleshooting

### API Connection Issues (Development)
- Ensure backend is running on port 3000 (`npm run dev` in backend)
- Vite proxy handles `/api` → `http://localhost:3000`
- Check browser console for CORS or network errors

### Google OAuth Not Working
- Verify all `VITE_FIREBASE_*` environment variables are set
- Check Firebase Console > Authentication > Authorized Domains
- Ensure `sweepro-auth.firebaseapp.com` is the auth domain

### "Unable to reach the server"
- Backend may be down (check Render dashboard)
- Check network connectivity
- CORS: ensure backend `ALLOWED_ORIGINS` includes the frontend URL

### Blank Page After Build
- Check `vercel.json` has the SPA rewrite rule
- Ensure `dist/index.html` exists after build
- Verify environment variables are set in Vercel project settings

### Payment Popup Not Opening
- Razorpay SDK loads dynamically — check for script load errors in console
- Ensure backend Razorpay keys are configured
- Test with Razorpay test keys in development

### Notifications Not Received
- Check WebSocket connection indicator (green dot in NotificationBell)
- Ensure backend WebSocket server is running (same process as HTTP)
- Verify JWT token is valid and not expired
- Check browser console for WebSocket errors

### Build Errors
```bash
npm run typecheck       # Check for TypeScript errors
npm run lint            # Check for linting issues
npm run build           # Full production build
```

---

## NPM Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Dev build with source maps |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run lint` | ESLint across all files |

---

_Built by Visiovate Technologies_
