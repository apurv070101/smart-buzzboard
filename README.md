# 📢 Smart Buzzboard (Digital Notice Hub)

A modern, real-time digital notice board application built with **TanStack Start**, **React 19**, and **Supabase**. Designed for educational institutions and organizations to broadcast announcements efficiently.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

## ✨ Features

- **🏠 Real-time Notice Board**: Instant updates when new notices are posted using Supabase Postgres Changes.
- **🏷️ Categorized Announcements**: Filter notices by Exam, Event, Urgent, or General categories.
- **🛡️ Admin Dashboard**: Dedicated secure area for administrators to create, edit, and delete notices.
- **🔐 Secure Authentication**: Integrated Supabase Auth for user sign-in and registration.
- **👤 Profile Management**: Users can view and manage their profile information.
- **🌙 Dark Mode**: Premium glassmorphic UI with full light/dark mode support.
- **📎 Attachments**: Support for uploading and viewing PDF or image attachments with notices.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start-overview) (Full-stack React)
- **Language**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: Radix UI / Shadcn UI
- **Icons**: Lucide React
- **Package Manager**: Bun

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A Supabase project created.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/smart-buzzboard.git
   cd smart-buzzboard
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Database Setup**:
   Apply the migrations located in `./supabase/migrations` to your Supabase project.

5. **Run the development server**:
   ```bash
   bun dev
   ```

### 📦 Building for Production

```bash
bun run build
```

## 📂 Project Structure

- `src/routes/`: TanStack Router file-based routing.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks for business logic (Auth, Notices).
- `src/integrations/`: Third-party service clients (Supabase).
- `supabase/migrations/`: SQL migration files for database schema.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the Smart Buzzboard Team.
