# Nuxt UI Theming Guide

## Color System

### Primary Colors
Set in `app.config.ts`:
```typescript
ui: {
  primary: 'emerald',  // Main brand color
  gray: 'slate'        // Neutral colors
}
```

Available colors: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

### Semantic Colors
Use these for components via the `color` prop:
- `primary` - Brand color (emerald in our app)
- `secondary` - Secondary actions
- `success` - Positive actions/states (green)
- `error` - Errors/negative states (red)
- `warning` - Warnings (yellow)
- `info` - Informational (blue)
- `neutral` - Neutral/gray

### Using Colors in Components

```vue
<!-- Buttons -->
<UButton color="primary">Primary Action</UButton>
<UButton color="success">Save</UButton>
<UButton color="error">Delete</UButton>

<!-- Badges -->
<UBadge color="success">Active</UBadge>
<UBadge color="warning">Pending</UBadge>

<!-- Cards -->
<UCard>Content</UCard>
```

## Dark Mode

Nuxt UI includes automatic dark mode support using Tailwind's `dark:` prefix.

### Manual Dark Mode Classes
```vue
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">Text</p>
</div>
```

### Color Utilities for Dark Mode
```vue
<!-- Income/Success -->
<span class="text-green-600 dark:text-green-500">+$100</span>

<!-- Expense/Error -->
<span class="text-red-600 dark:text-red-500">-$50</span>

<!-- Neutral text -->
<p class="text-gray-500 dark:text-gray-400">Description</p>
```

## Component Customization

### Global Defaults (app.config.ts)
```typescript
export default defineAppConfig({
  ui: {
    card: {
      rounded: 'rounded-xl',    // Border radius
      shadow: 'shadow-md',      // Shadow
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800'
    },
    button: {
      rounded: 'rounded-lg'
    }
  }
})
```

### Per-Component Override
```vue
<UCard
  :ui="{
    base: 'p-6',
    rounded: 'rounded-2xl',
    shadow: 'shadow-xl'
  }"
>
  Custom styling
</UCard>
```

## Responsive Design

### Breakpoints
Tailwind breakpoints (mobile-first):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Responsive Classes
```vue
<!-- Grid: 1 col mobile, 2 cols tablet, 3 cols desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">Mobile only</div>

<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8">Content</div>

<!-- Responsive text size -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">Title</h1>
```

## Best Practices for Financial App

### Income (Positive)
```vue
<span class="text-green-600 dark:text-green-500">
  +{{ formatCurrency(amount) }}
</span>
<div class="bg-green-100 dark:bg-green-900/30">
  <UIcon class="text-green-600 dark:text-green-500" />
</div>
```

### Expenses (Negative)
```vue
<span class="text-red-600 dark:text-red-500">
  -{{ formatCurrency(amount) }}
</span>
<div class="bg-red-100 dark:bg-red-900/30">
  <UIcon class="text-red-600 dark:text-red-500" />
</div>
```

### Neutral/Balance
```vue
<span class="text-blue-600 dark:text-blue-500">
  {{ formatCurrency(balance) }}
</span>
```

## Common Patterns

### Card with Hover Effect
```vue
<UCard class="hover:shadow-lg transition-shadow duration-200">
  Content
</UCard>
```

### Responsive Flex Layout
```vue
<div class="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

### Category Colors
Use badge components for consistency:
```vue
<UBadge
  :color="getBadgeColor(category.color)"
  variant="subtle"
>
  {{ category.name }}
</UBadge>
```

## Resources
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
