# WINSIDE Business Dashboard - Copilot Instructions

WINSIDE is a comprehensive Next.js business management platform designed for multi-brand operations with the following structure:

## Project Overview
- **Application**: WINSIDE Business Dashboard
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Purpose**: Complete business solution for inventory, sales, customer management, and analytics

## Key Features
- Dashboard with business metrics and KPIs
- Product management (CRUD operations)
- Stock/inventory management with alerts
- Customer database management
- Invoice tracking and management

## Development Guidelines
- Use TypeScript for all new components
- Follow the existing component structure in `src/components/dashboard/`
- Use shadcn/ui components for consistent styling
- Implement responsive design patterns
- Use the existing type definitions in `src/lib/types/index.ts`

## File Structure
- `/src/app/dashboard/` - Dashboard pages
- `/src/components/dashboard/` - Shared dashboard components
- `/src/components/ui/` - shadcn/ui components
- `/src/lib/types/` - TypeScript type definitions

## Code Style
- Use functional components with hooks
- Implement proper error handling
- Follow the existing naming conventions
- Use the DashboardLayout wrapper for all dashboard pages
- Maintain consistent table and form patterns

This project is ready for development and can be extended with additional features or API integrations.
