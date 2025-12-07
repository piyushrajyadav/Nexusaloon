# Salon Management System

A complete single salon management system built with Next.js 14, Supabase, Prisma, and ShadCN UI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **State Management:** Zustand
- **Analytics:** Recharts

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   \\\ash
   npm install
   \\\
3. **Environment Variables:**
   Copy \.env.example\ to \.env\ and fill in your Supabase credentials.
   \\\ash
   cp .env.example .env
   \\\
4. **Database Setup:**
   Run Prisma migration to push schema to Supabase.
   \\\ash
   npx prisma migrate dev --name init
   \\\
5. **Run the development server:**
   \\\ash
   npm run dev
   \\\

## Features

- **Public Website:** Landing page with services.
- **Authentication:** Login for Admin, Staff, and Customers.
- **Booking System:** Select service, date, and time.
- **Admin Dashboard:** Analytics and management.
- **Staff Portal:** View upcoming appointments.

# Nexusaloon
