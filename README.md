# WINSIDE Business Dashboard

**WINSIDE** - Your complete business management solution. A modern, comprehensive dashboard built with Next.js, React, TypeScript, and shadcn/ui components. WINSIDE provides powerful tools for managing products, inventory, customers, and sales all from one unified platform.

## 🚀 About WINSIDE

WINSIDE empowers businesses to manage their operations efficiently with real-time insights, automated workflows, and intuitive interfaces. Whether you're handling wholesale operations, retail sales, or multi-brand inventory, WINSIDE has you covered.

## Features

### 📊 Dashboard Overview
- Real-time business metrics and KPIs
- Recent invoices summary
- Low stock alerts
- Revenue tracking

### 📦 Product Management
- Add, edit, and delete products
- Product categorization
- SKU management
- Price tracking
- Search and filter capabilities

### 📋 Stock Management
- Inventory level monitoring
- Low stock alerts
- Stock adjustments
- Multiple warehouse locations
- Min/max quantity settings

### 👥 Customer Management
- Customer database
- Contact information management
- Order history tracking
- Customer statistics
- Search functionality

### 🧾 Invoice Management
- Invoice creation and tracking
- Multiple status management (draft, sent, pending, paid, overdue)
- Payment tracking
- Invoice details view
- Revenue analytics

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Development**: ESLint for code quality

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically redirect to the dashboard at `/dashboard`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── dashboard/           # Dashboard pages
│   │   ├── products/        # Product management
│   │   ├── stock/          # Stock management  
│   │   ├── customers/      # Customer management
│   │   ├── invoices/       # Invoice management
│   │   └── page.tsx        # Main dashboard
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Home page (redirects to dashboard)
├── components/
│   ├── dashboard/
│   │   └── layout.tsx      # Dashboard layout with navigation
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── utils.ts           # Utility functions
```

## License

This project is licensed under the MIT License.
