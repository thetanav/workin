# Joinin

**The location-based social workspace for builders.**

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-Private-blue.svg)

Joinin helps remote workers, indie hackers, and developers find each other. Check in at your current workspace (coffee shop, library, coworking space), see who else is grinding nearby, and connect IRL.

## ✨ Features

- **📍 Live Check-ins**: Share your location and status ("Deep Work", "Open to Chat") in real-time.
- **🗺️ Interactive Map**: A beautiful, performance-first map experience powered by MapLibre.
- **⚡ Real-time Sync**: Instant updates when others check in or move, powered by Convex.
- **👤 User Profiles**: customizable profiles with GitHub integration and social links.
- **🔒 Privacy First**: Precise control over when and how your location is shared.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Backend**: [Convex](https://convex.dev/) (Real-time database & functions)
- **Auth**: [Clerk](https://clerk.com/)
- **Maps**: [MapLibre GL JS](https://maplibre.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- Node.js 18+
- npm, pnpm, or bun
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd joinin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Convex
   CONVEX_DEPLOYMENT=...
   NEXT_PUBLIC_CONVEX_URL=...
   ```

4. **Start the Backend**
   Run the Convex development server in a separate terminal:
   ```bash
   npx convex dev
   ```

5. **Start the Frontend**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🗺️ Roadmap

We are actively working on:
- **"Wave" feature**: Send a quick hello to nearby builders.
- **Venue Ratings**: Rate wifi and coffee quality.
- **PWA**: Install on your phone for native-like experience.

See [todo.md](./todo.md) for the full feature list.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is currently private.
