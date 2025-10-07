# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SlideShow is a web application for creating and managing slideshow presentations.

## Getting Started

This project has not been initialized yet. When setting up:

1. **Initialize Next.js 15 Project**:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
   ```

2. **Install ShadCN UI** (mandatory for all web projects):
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button input form card
   ```

3. **Install Additional Dependencies**:
   ```bash
   npm install zod next-themes react-hook-form @hookform/resolvers
   ```

## Development Commands

Once initialized, use these commands:

```bash
# Development (use Turbopack for faster builds)
npm run dev --turbopack

# Type checking (run before commits)
npx tsc --noEmit

# Linting (MANDATORY after any changes)
npm run lint

# Build (must pass without errors)
npm run build

# Production
npm run start
```

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router only)
- **React**: Version 19
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS 4.x + ShadCN UI
- **Form Management**: React Hook Form + Zod validation
- **Deployment**: Vercel (requires explicit permission before deploying)

### Directory Structure

Follow this mandatory structure:

```
SlideShow/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── loading.tsx      # Loading states
│   │   ├── error.tsx        # Error boundaries
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # ShadCN components (auto-generated)
│   │   ├── features/        # Feature-specific components
│   │   └── layouts/         # Layout components
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   └── validations.ts   # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles
├── public/                  # Static assets
├── CONTEXT.md              # Project memory (MANDATORY)
├── .env.local              # Environment variables
└── next.config.ts          # Next.js configuration
```

## Code Standards

### Component Guidelines

1. **Server Components by Default**: Use server components unless client interactivity is needed
2. **Client Components**: Only add `'use client'` when necessary (useState, useEffect, event handlers)
3. **ShadCN First**: Always use ShadCN components instead of custom HTML/CSS
4. **Type Safety**: All components must have proper TypeScript interfaces

### Development Rules

1. **ESLint**: MANDATORY to run after every change. Fix all errors before proceeding.
2. **No Workarounds**: Never use temporary fixes or hacks. Always implement proper solutions.
3. **Research First**: Research web best practices before implementing any new feature.
4. **Ask Don't Assume**: When uncertain, ask for clarification instead of guessing.
5. **Zero Tolerance Errors**: Every error must be fixed immediately before proceeding.

### CONTEXT.md Requirements

- **MANDATORY**: Create and maintain CONTEXT.md in project root
- **Always Reference**: Check CONTEXT.md before starting any task
- **Always Update**: Add decisions, progress, and learnings after every significant change
- **Includes**: Current state, active goals, recent decisions, known issues, next steps

## Deployment

### Vercel Rules (CRITICAL)
- **NEVER** create new Vercel projects without explicit user permission
- **NEVER** deploy or redeploy without being asked
- **ALWAYS** ask before any deployment-related changes
- **NO TURBOPACK** in production builds (compatibility issues)

### Build Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix all TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix all ESLint errors
  },
  typedRoutes: true, // Type-safe routing
}

export default nextConfig
```

## Workflow for New Features

1. **Check CONTEXT.md**: Review current project state
2. **Research**: Find current best practices for the feature
3. **Document Decision**: Add research findings to CONTEXT.md
4. **Implement**: Build using researched best practices
5. **Lint**: Run ESLint and fix all errors
6. **Update CONTEXT.md**: Document what was built and current state

## Tool Awareness

This project has access to:
- **Desktop Commander**: For file operations, searching, directory management
- **Playwright**: For browser automation and testing
- Use these tools instead of asking user to perform manual tasks

## Error Prevention

- Run ESLint after every code change
- Fix TypeScript errors immediately
- Test components before marking tasks complete
- Document error fixes in CONTEXT.md for future reference

## Notes

- This project follows strict Next.js 15 + React 19 standards
- All web development uses ShadCN UI components
- SuperDesign principles guide styling and layouts
- No shortcuts or workarounds allowed
- Research and documentation are mandatory before implementation
