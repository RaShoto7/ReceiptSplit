# ReceiptSplit

A fast, mobile-first web app to split bills among friends. No login required - just create a room and share the link!

## Features

- **Create Rooms**: Generate shareable URLs for each bill
- **Add Participants**: Easily add/remove people from the split
- **Line Items**: Add items with amounts, quantities, and optional categories
- **Smart Assignments**: Assign items to specific people with "select all" and "clear" shortcuts
- **Tip & Tax**: Add tip and tax as percentage or fixed amount
- **Settlement Calculation**: See who owes who with minimized transfers
- **Copy Summary**: One-click copy of the bill breakdown to clipboard
- **Mobile-First**: iOS-clean design with large tap targets

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Vercel account (for database)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd receiptsplit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Vercel Postgres**

   Option A: Using Vercel CLI (recommended)
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   ```

   Option B: Manual setup
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new Postgres database in the Storage tab
   - Copy the environment variables to `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Vercel Postgres credentials:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Database Schema

The app automatically creates these tables on first use:

- **rooms**: Bill metadata (title, currency, tip/tax settings)
- **participants**: People in each room
- **items**: Line items with amounts and quantities
- **item_assignments**: Many-to-many relationship for item splits

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/receiptsplit)

### Manual Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Postgres Database**
   - In your Vercel project, go to Storage tab
   - Create a new Postgres database
   - Link it to your project (env vars are set automatically)

4. **Deploy**
   - Vercel will automatically deploy on push to main

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (create room)
│   ├── not-found.tsx     # 404 page
│   └── r/
│       └── [roomId]/
│           └── page.tsx  # Room page
├── components/
│   ├── RoomHeader.tsx    # Room title and share button
│   ├── ParticipantsList.tsx
│   ├── ItemsList.tsx     # Items with assignment UI
│   ├── TipTaxSettings.tsx
│   └── ResultsSummary.tsx
├── lib/
│   ├── actions.ts        # Server Actions
│   ├── calculations.ts   # Split calculations
│   └── db.ts             # Database operations
└── types/
    └── index.ts          # TypeScript types
```

## Usage

1. **Create a Bill**: Enter an optional title and select currency
2. **Add People**: Add everyone who's splitting the bill
3. **Add Items**: Enter each item with its price and quantity
4. **Assign Items**: Click each item to assign it to specific people
5. **Set Tip/Tax**: Add tip and tax as percentage or fixed amount
6. **View Results**: See per-person totals and who pays who
7. **Share**: Copy the URL or use the share button

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
