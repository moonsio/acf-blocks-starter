# Moonsio ACF Blocks Starter

A starter plugin for ACF blocks using the Moonsio theme block registration system.

## Development

This plugin uses:

- pnpm for frontend dependencies
- composer for PHP dependencies
- webpack for asset compilation

### Setup

```bash
# Install PHP dependencies
composer install

# Install frontend dependencies
pnpm install
```

### Build

```bash
# Development build with watch
pnpm dev

# Production build
pnpm prod
```

## GitHub Workflow

This repository includes a GitHub Actions workflow that automatically:

1. Installs PHP dependencies with Composer
2. Installs frontend dependencies with pnpm
3. Builds production assets with webpack
4. Cleans up by removing node_modules
5. Optimizes the vendor directory by removing development dependencies
6. Commits the built assets to the repository

The workflow runs on:

- Pushes to the main branch
- Pull request merges into the main branch

This ensures that the repository always contains the latest compiled assets without requiring contributors to build them locally.
