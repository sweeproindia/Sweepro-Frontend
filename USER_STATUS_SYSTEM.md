# User Status System Documentation

## Overview

This implementation provides a comprehensive user status system for the CleanEase application with three distinct user states: **Active**, **Inactive**, and **Pending**. Each status has different dashboard behaviors and subscription flows.

## User Status Types

### 1. Active Users
- **Definition**: Users who have purchased and have an active subscription
- **Dashboard Behavior**: Full access to all features including booking, subscription management, and service history
- **No Changes**: Dashboard remains unchanged for active users

### 2. Inactive Users
- **Definition**: Users who have logged in but haven't purchased a subscription
- **Dashboard Behavior**: 
  - Shows a "Choose Your Plan" card instead of the full dashboard
  - Automatically opens subscription modal on dashboard visit
  - Cannot access booking features until subscription is purchased

### 3. Pending Users
- **Definition**: Users whose subscription has expired
- **Dashboard Behavior**:
  - Shows a "Subscription Expired" card instead of the full dashboard
  - Automatically opens subscription modal on dashboard visit
  - Cannot access booking features until subscription is renewed

## Sample Login Credentials

For testing purposes, the following sample users are available:

| Email | Password | Status | Description |
|-------|----------|--------|-------------|
| `active@example.com` | any password | Active | User with active Standard subscription |
| `inactive@example.com` | any password | Inactive | User without subscription |
| `pending@example.com` | any password | Pending | User with expired Premium subscription |

## Subscription Flow

### For Inactive Users:
1. **Dashboard Entry**: User sees "Choose Your Plan" card
2. **Plan Selection**: Modal opens with available plans (Basic, Standard, Premium)
3. **Profile Completion**: User enters name, location, pincode, and selects services
4. **Payment**: User completes payment with card details
5. **Activation**: User status changes to "active" and full dashboard is unlocked

### For Pending Users:
1. **Dashboard Entry**: User sees "Subscription Expired" card
2. **Plan Selection**: Modal opens with available plans for renewal
3. **Profile Update**: User can update profile information
4. **Payment**: User completes payment for new subscription
5. **Renewal**: User status changes to "active" and full dashboard is restored

## Technical Implementation

### Key Components

1. **UserContext** (`src/contexts/UserContext.tsx`)
   - Manages user state and authentication
   - Provides login/logout functionality
   - Stores user data in localStorage

2. **SubscriptionModal** (`src/components/SubscriptionModal.tsx`)
   - Multi-step modal for plan selection, profile, and payment
   - Handles different flows for inactive vs pending users

3. **UserProfileForm** (`src/components/UserProfileForm.tsx`)
   - Collects user details: name, location, pincode, services
   - Validates required fields

4. **PaymentForm** (`src/components/PaymentForm.tsx`)
   - Handles payment processing
   - Simulates payment gateway integration

5. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Conditionally renders content based on user status
   - Integrates subscription modal for inactive/pending users

### Data Flow

1. **Login**: User authenticates via LoginPage
2. **Status Check**: Dashboard checks user status on mount
3. **Modal Trigger**: Subscription modal opens automatically for inactive/pending users
4. **Subscription Process**: Multi-step flow (plans → profile → payment)
5. **Status Update**: User status changes to "active" upon successful payment
6. **Dashboard Update**: Full dashboard becomes available

### File Structure

```
src/
├── contexts/
│   └── UserContext.tsx          # User state management
├── components/
│   ├── SubscriptionModal.tsx    # Main subscription flow
│   ├── UserProfileForm.tsx      # Profile collection
│   └── PaymentForm.tsx          # Payment processing
├── types/
│   └── user.ts                  # TypeScript interfaces
├── data/
│   └── plans.ts                 # Available subscription plans
└── pages/
    └── Dashboard.tsx            # Conditional dashboard rendering
```

## Features

### Subscription Plans
- **Basic**: ₹1,999/month - 2 visits per week
- **Standard**: ₹3,499/month - 5 visits per week (Most Popular)
- **Premium**: ₹5,999/month - Daily visits

### User Profile Fields
- Full Name (required)
- Phone Number (optional)
- Location (required)
- Pincode (required)
- Services (optional checkboxes)

### Payment Features
- Credit card processing simulation
- Multiple payment method support (Visa, Mastercard, Rupay, UPI)
- Secure payment form with validation
- Order summary display

### Dashboard Features
- Status-based conditional rendering
- User information display in sidebar
- Logout functionality
- Toast notifications for user feedback

## Usage Instructions

1. **Start the application** and navigate to `/login`
2. **Choose "User"** as the login type
3. **Use sample credentials** from the table above
4. **Experience different flows**:
   - Active user: Full dashboard access
   - Inactive user: Subscription flow to activate
   - Pending user: Subscription renewal flow

## Future Enhancements

- Real payment gateway integration
- Email verification for new subscriptions
- Subscription management features
- Payment history tracking
- Service customization options
- Referral system integration 