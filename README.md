# Joinin

A location-based coworking platform that helps builders find and connect with others working nearby. Check in at your current spot, share your location, and collaborate with fellow developers in real-time.

## Features

### Core Functionality
- **Location Check-ins**: Share your current working location with a custom status message
- **Interactive Map**: Visualize nearby builders and coworking spaces using MapLibre
- **Real-time Updates**: See live check-ins from other developers in your area
- **Share Links**: Generate shareable links to invite others to join your location
- **User Profiles**: Create profiles with bio, social links, and ratings

### Spaces Directory
- **City-based Search**: Find coworking spaces by city
- **Space Details**: View information about available coworking locations
- **Map Integration**: Explore spaces visually on an interactive map

### Technical Features
- **Authentication**: Secure user authentication via Clerk
- **Real-time Backend**: Powered by Convex for live data synchronization
- **Responsive Design**: Mobile-friendly interface built with Next.js and Tailwind CSS
- **Dark Mode**: Theme switching support with next-themes

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Maps**: MapLibre GL JS
- **Backend**: Convex (serverless functions and database)
- **Authentication**: Clerk
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account (for backend)
- Clerk account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd joinin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
# Clerk environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex environment variables
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_convex_deployment_name
```

4. Set up Convex:
```bash
npx convex dev
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── profile/          # User profile pages
│   ├── spaces/           # Coworking spaces pages
│   └── c/[shareId]/      # Shared check-in pages
├── components/
│   ├── app/              # Application components
│   │   ├── shell.tsx     # Main app shell
│   │   ├── map-view.tsx  # Map component
│   │   └── checkin-panel.tsx # Check-in interface
│   └── ui/               # Reusable UI components
├── convex/               # Backend functions
│   ├── schema.ts         # Database schema
│   ├── checkins.ts       # Check-in functions
│   └── users.ts          # User management
└── lib/                  # Utility functions
```

## Database Schema

The application uses Convex with the following main tables:

- **users**: User profiles with Clerk integration
- **checkins**: Location check-ins with coordinates and status messages

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project follows TypeScript and ESLint conventions. UI components are built using shadcn/ui with Tailwind CSS for styling.

### Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new code
3. Test your changes thoroughly
4. Update documentation as needed

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Convex Deployment

```bash
npx convex deploy
```

## License

This project is private and proprietary.