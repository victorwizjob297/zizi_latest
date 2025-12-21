# Overview

This is a marketplace platform similar to OLX/Craigslist, built specifically for Zimbabwe. The application allows users to buy and sell items across various categories including vehicles, real estate, electronics, jobs, and more. It features a dynamic category-based attribute system where each category can have custom form fields, real-time messaging, payment integration with Paystack, and user reviews.

The platform is built with a React/TypeScript frontend using Vite, and a Node.js/Express backend with PostgreSQL database. It includes both user-facing features (ad posting, search, chat, favorites) and admin capabilities (category management, user management, analytics).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as the build tool and dev server
- Redux Toolkit for state management with RTK Query for API calls
- React Router for navigation
- Tailwind CSS for styling
- Radix UI components for accessible UI primitives

**Key Design Decisions:**
- **Component Structure**: Follows a page-based architecture with reusable components in `src/components/`
- **State Management**: Redux with separate slices for auth, ads, and UI state. API calls handled via RTK Query with automatic caching
- **Routing**: Client-side routing with protected routes for authenticated users and admin-only routes
- **Real-time Communication**: Socket.IO client for chat and notifications

## Backend Architecture

**Technology Stack:**
- Node.js with Express 5
- ES6 modules (type: "module" in package.json)
- PostgreSQL with raw SQL queries using the `pg` library
- JWT for authentication with cookie and bearer token support
- Socket.IO for real-time features

**Key Design Decisions:**
- **Database Access Pattern**: Uses a custom query helper with connection pooling instead of an ORM. Transaction support available via `transaction()` helper
- **Model Pattern**: Models are class-based with static methods (e.g., `User.create()`, `Ad.findById()`) - not traditional OOP instances but static utility classes
- **Authentication**: Dual authentication support - standard JWT email/password and Google OAuth integration
- **File Uploads**: Multer for handling multipart form data, Cloudinary for image storage and optimization
- **Security**: Helmet for HTTP headers, CORS configuration, rate limiting via express-rate-limit, input validation with express-validator

**Dynamic Attributes System:**
- Problem: Need category-specific form fields (e.g., cars need "make/model/year", while real estate needs "bedrooms/bathrooms")
- Solution: Two-table design:
  - `category_attributes`: Defines field schemas per category (11 field types supported)
  - `ad_attributes`: Stores JSONB values for each ad's custom fields
- Supports conditional field display, validation rules, and searchable flags
- Allows dynamic form generation without schema changes

## Data Storage

**Database: PostgreSQL**
- Connection pooling configured for performance (max 20 connections)
- SSL enabled in production
- No ORM - uses raw SQL queries for flexibility and performance
- Transactions supported for multi-step operations

**Key Tables:**
- `users`: User accounts with role-based access (user/admin)
- `categories`: Hierarchical category structure with parent-child relationships
- `ads`: Main listings table with status workflow (pending → active)
- `category_attributes`: Dynamic field definitions per category
- `ad_attributes`: JSONB storage for category-specific attribute values
- `conversations` & `messages`: Chat system
- `favorites`, `follows`, `reviews`: User interaction features
- `subscription_plans` & `user_subscriptions`: Premium features
- `business_profiles`: Seller shop pages

**File Storage:**
- Cloudinary for all images (ads, avatars)
- Automatic image optimization and transformation
- Multiple image upload support for ads

## Authentication & Authorization

**Authentication Mechanisms:**
- JWT tokens stored in cookies (httpOnly, secure in production)
- Alternative bearer token in Authorization header
- Token expiry: 7 days default
- Google OAuth 2.0 integration

**Authorization Levels:**
- Regular users: Can create ads, chat, review
- Admin users: Full access to admin dashboard, user management, category management
- Middleware: `protect` for authenticated routes, `admin` for admin-only routes

**Password Security:**
- bcryptjs hashing with salt rounds
- Password reset via email tokens with expiration

## External Dependencies

**Third-Party Services:**
- **Cloudinary**: Image hosting, transformation, and CDN
- **Paystack**: Payment processing for premium features (bump, feature, urgent ads)
- **Google OAuth**: Social login integration
- **Nodemailer**: Email sending (password reset, notifications)

**Key npm Packages:**
- **Backend**: express, pg, socket.io, jsonwebtoken, bcryptjs, multer, helmet, cors
- **Frontend**: react, react-router-dom, @reduxjs/toolkit, @tanstack/react-query, socket.io-client
- **UI**: @radix-ui components, lucide-react icons, tailwindcss

**API Integration Patterns:**
- RTK Query for REST API calls with automatic caching and refetching
- Socket.IO for bidirectional real-time communication
- Paystack API for payment initialization and verification

**Environment Configuration:**
- All sensitive credentials in `.env` file
- Separate development and production configurations
- Required variables: DB credentials, JWT secret, Cloudinary keys, Paystack keys, Google OAuth credentials, email SMTP settings