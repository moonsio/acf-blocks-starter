# Moonsio ACF Blocks Starter for WordPress websites
A starter plugin for ACF blocks using the Moonsio theme block registration system.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!CAUTION]
> **This plugin requires:** 
> - MoonsioForWP theme to function properly. It will not work with other themes as it relies on the Moonsio theme block registration system.
> - Advanced Custom Fields PRO plugin

> [!IMPORTANT]
> Check [Contributing & Git Workflow](#contributing--git-workflow) before working on this plugin.



## Table of Contents
- [Development](#development)
  - [Setup](#setup)
  - [Build](#build)
- [Block Development](#block-development)
  - [Directory Structure](#directory-structure)
  - [Creating a New Block](#creating-a-new-block)
    - [Block Generator Options](#block-generator-options)
  - [Block Files](#block-files)
- [Working with Block Fields](#working-with-block-fields)
  - [Using FieldTypes](#using-fieldtypes)
    - [Common Field Types](#common-field-types)
    - [Adding Custom Args](#adding-custom-args)
  - [Working with Images](#working-with-images)
    - [Using Image::render()](#using-imagerender)
  - [Working with Icons](#working-with-icons)
    - [Using the Icons Class](#using-the-icons-class)
- [GitHub Workflow](#github-workflow)
- [Contributing & Git Workflow](#contributing--git-workflow)
  - [Branch Strategy](#branch-strategy)
  - [Contribution Process](#contribution-process)
  - [Commit Guidelines](#commit-guidelines)
  - [CI/CD Pipeline](#cicd-pipeline)

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

## Block Development

### Directory Structure

The plugin uses a source/build approach:

- `/blocks/` - Source directory where you develop your blocks
- `/dist/blocks/` - Compiled directory that contains the production-ready blocks

When you run `pnpm dev` or `pnpm prod`, the build process:

1. Compiles all block SCSS files to CSS
2. Minifies CSS files in production mode
3. Copies PHP files and block.json to the dist directory
4. Registers blocks from the dist directory

### Creating a New Block

Use the built-in block generator to create a new block:

```bash
pnpm block
```

This will create a new block in the `/blocks/` directory. After creating the block, run `pnpm dev` or `pnpm prod` to compile it to the `/dist/blocks/` directory.

#### Block Generator Options

When running `pnpm block`, you'll be prompted for the following information:

1. **Block Namespace** - Typically "moonsio" (default)
2. **Block Name** - The name of your block (e.g., "Hero Banner")
3. **Fields** - Select ACF fields to include in your block (use space to select)
   - Text accordion
   - Title
   - Text
   - Image
   - Colors accordion
   - Text color
   - Background color
   - And more
4. **Block description** - A short description of your block
5. **Keywords** - Search keywords for the block in the editor
6. **Dashicon** - The WordPress icon to use for your block

After answering these questions, the generator will create all necessary files for your block.

### Block Files

Each block should include:

- `block.json` - Block registration metadata
- `config.php` - Block configuration
- `view.php` - Block template
- `block.scss` - Block styles (will be compiled to CSS)
- `editor.scss` - Editor-specific styles (will be compiled to CSS)

## Working with Block Fields

The Moonsio theme provides several helper classes to streamline block development.

### Using FieldTypes

The `FieldTypes` class provides methods for creating ACF fields with consistent structure and styling. All methods follow the same pattern:

```php
FieldTypes::field_type($key_prefix, $name, $label, $args);
```

#### Common Field Types

```php
// In your block's config.php file:
$block_prefix = 'my_block';

return [
  // Other config than fields is handled via block.json
  // Make sure the labels, the 3rd $arg in the field_types, is in Dutch since that is the main language.
  'fields' => [
    // Text field
    FieldTypes::text($block_prefix, 'title', 'Title'),
    
    // Text area
    FieldTypes::textarea($block_prefix, 'description', 'Description'),
    
    // WYSIWYG editor
    FieldTypes::wysiwyg_basic($block_prefix, 'content', 'Content'),
    
    // Image field
    FieldTypes::image($block_prefix, 'image', 'Image'),
    
    // Select field
    FieldTypes::select($block_prefix, 'size', 'Size', [
        'small' => 'Small',
        'medium' => 'Medium',
        'large' => 'Large'
    ]),
    
    // Group field
    FieldTypes::group($block_prefix, 'header', 'Header', [
        FieldTypes::text($block_prefix, 'heading', 'Heading'),
        FieldTypes::text($block_prefix, 'subheading', 'Subheading')
    ]),
    
    // Repeater field
    FieldTypes::repeater($block_prefix, 'items', 'Items', [
      'button_label' => 'Add Item',
        FieldTypes::text($block_prefix, 'title', 'Title'),
        FieldTypes::textarea($block_prefix, 'description', 'Description')
    ])
  ]
];
```

#### Adding Custom Args

All FieldTypes methods accept an optional `$args` parameter to customize the field:

```php
FieldTypes::text($block_prefix, 'title', 'Title', [
  'placeholder' => 'Enter a title',
  'required' => true,
  'wrapper' => [
    'width' => '50'
  ]
]);
```

### Working with Images

The `Image` class provides utilities for optimized image rendering.

#### Using Image::render()

The `Image::render()` method generates optimized image markup with proper srcset and sizes attributes:

```php
// In your block's view.php file:
use Moonsio\Images\Image;

$image_id = get_field('image');

// Basic usage
Image::render($image_id);

// With size parameter
Image::render($image_id, 'medium');

// With attributes
Image::render($image_id, 'large', [
  'class' => 'my-image',
  'alt' => 'Custom alt text',
  'loading' => 'eager', // For above-the-fold images
]);

// For grid layouts
Image::render($image_id, 'medium', [
  'columns' => 3 // Indicates this image is in a 3-column layout
]);

// With responsive columns
Image::render($image_id, 'medium', [
  'columns' => [
    'xs' => 1, // 1 column on mobile
    'sm' => 2, // 2 columns on tablet
    'md' => 3, // 3 columns on desktop
    'lg' => 4  // 4 columns on large screens
  ]
]);
```

The `Image::render()` method automatically:

1. Generates appropriate srcset and sizes attributes based on the size parameter
2. Adapts sizes attribute based on the number of columns
3. Falls back to a placeholder if the image doesn't exist
4. Sets appropriate loading attribute (lazy by default)

### Working with Icons

The `Icons` class provides utilities for SVG icons.

#### Using the Icons Class

```php
// In your block's view.php file:
use Moonsio\Helpers\Icons;

// Using media library SVGs - the default
$svg_id = get_field('icon'); // ID of SVG attachment in media library
echo Icons::get_icon($icon, [
  'class' => sprintf('%s__icon', esc_attr($block_name))
]);

// Basic usage with icons in the plugin folder
echo Icons::get_icon('arrow-right');

// With attributes
echo Icons::get_icon('arrow-right', [
  'class' => 'my-icon',
  'width' => 32,
  'height' => 32,
  'color' => '#0073aa',
  'title' => 'Go to next page', // For accessibility
]);

// Using different icon methods
echo Icons::get_icon('arrow-right', [
  'method' => 'inline', // Inline SVG (default)
]);

echo Icons::get_icon('arrow-right', [
  'method' => 'sprite', // SVG sprite
]);

echo Icons::get_icon('arrow-right', [
  'method' => 'font', // Icon font
]);

```

The helper function `moonsio_get_icon()` is also available:

```php
echo moonsio_get_icon('arrow-right', [
  'width' => 24,
  'height' => 24
]);
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

## Contributing & Git Workflow

We follow a structured workflow to maintain code quality and ensure smooth collaboration:

### Branch Strategy
- **Main branch**: Protected - no direct pushes allowed
- **Feature branches**: Create a new branch for each feature or improvement
- **Bugfix branches**: Use dedicated branches for bug fixes

### Contribution Process
1. **Create an issue** for new ideas or feature requests
2. **Fork or branch** from main for your work
3. **Develop** your changes following our coding standards
4. **Submit a pull request** for review
5. **Address feedback** if requested by reviewers

### Commit Guidelines
- Use [Conventional Commits](https://www.conventionalcommits.org/) format
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

### CI/CD Pipeline
Pull requests trigger our GitHub Actions workflow that builds assets automatically when merged to main.