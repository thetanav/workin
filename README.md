# Joinin

**The location-based social workspace for builders.**

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-Private-blue.svg)

Joinin helps remote workers, indie hackers, and developers find each other. Check in at your current workspace (coffee shop, library, coworking space), see who else is grinding nearby, and connect IRL.

## 📚 Key Terminologies

- **Builders**: Users of Joinin, typically remote workers, indie hackers, and developers who use the app to connect.
- **Check-in**: The action of sharing your current location and work status at a workspace, making you visible to nearby builders.
- **Status**: Your current work mode or availability (e.g., "Deep Work" for focused sessions, "Open to Chat" for social interactions).
- **Wave**: A quick, non-intrusive way to greet nearby builders and start conversations.
- **Venue/Space**: Physical locations where builders work, such as coffee shops, libraries, coworking spaces, or offices.
- **Workspace**: Any environment where productive work happens, often referring to shared or public spaces in the context of Joinin.

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
