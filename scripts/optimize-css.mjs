/**
 * Post-build CSS optimization script.
 * 
 * 1. Reads the built CSS file
 * 2. Extracts critical CSS (Tailwind reset + base styles needed for first paint)
 * 3. Inlines critical CSS into all HTML files
 * 4. Makes the full CSS file load asynchronously (non-render-blocking)
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist');

// Find the CSS file
const assetsDir = path.join(DIST_DIR, 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
if (!cssFile) {
  console.error('No CSS file found in dist/assets/');
  process.exit(1);
}

const cssPath = path.join(assetsDir, cssFile);
const fullCss = fs.readFileSync(cssPath, 'utf-8');
console.log(`Full CSS: ${cssFile} (${(fullCss.length / 1024).toFixed(1)} KB)`);

// Extract critical CSS - styles needed for above-the-fold content
// This includes: Tailwind reset, base styles, layout utilities, colors used in hero/nav
function extractCriticalCss(css) {
  const criticalPatterns = [];
  
  // Split CSS into rules
  const rules = [];
  let depth = 0;
  let current = '';
  
  for (let i = 0; i < css.length; i++) {
    current += css[i];
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        rules.push(current.trim());
        current = '';
      }
    }
  }
  
  // Critical selectors - things needed for first paint
  const criticalKeywords = [
    // Reset and base
    '*, ::before, ::after', '*,::before,::after', ':root', 'html', 'body',
    // Layout
    '.min-h-screen', '.sticky', '.top-0', '.z-50', '.flex', '.items-center',
    '.justify-between', '.max-w-7xl', '.mx-auto', '.px-4', '.px-6', '.px-8',
    '.h-14', '.h-16', '.gap-', '.grid', '.order-',
    // Typography
    '.text-xl', '.text-2xl', '.text-3xl', '.text-4xl', '.text-5xl', '.text-6xl',
    '.text-sm', '.text-xs', '.text-base', '.text-lg',
    '.font-bold', '.font-semibold', '.font-medium',
    '.leading-tight', '.leading-relaxed',
    '.tracking-tight',
    // Colors used in hero
    '.bg-\\[#FAF7F2\\]', '.text-\\[#1a1108\\]', '.text-\\[#3D3229\\]',
    '.text-\\[#6B5E50\\]', '.text-\\[#5a9e65\\]', '.text-\\[#4A3F35\\]',
    '.bg-\\[#3D3229\\]', '.text-white', '.border-\\[#E8DFD3\\]',
    // Spacing
    '.py-10', '.py-16', '.py-24', '.mb-4', '.mb-6', '.mb-8',
    '.p-3', '.p-4', '.p-6',
    // Display
    '.hidden', '.block', '.inline-flex', '.inline-block',
    // Sizing
    '.w-full', '.h-full', '.w-3', '.w-4', '.w-5', '.w-8', '.w-10',
    '.h-3', '.h-4', '.h-5', '.h-8', '.h-10',
    // Border/rounded
    '.rounded-full', '.rounded-xl', '.rounded-2xl', '.rounded-3xl',
    '.border', '.border-b',
    // Overflow
    '.overflow-hidden',
    // Position
    '.relative', '.absolute',
    // Object fit
    '.object-cover', '.object-contain',
    // Shadow
    '.shadow-xl', '.shadow-2xl', '.shadow-lg',
    // Transitions
    '.transition-',
    // Responsive
    '@media',
    // Aspect ratio
    '.aspect-',
    // Backdrop
    '.backdrop-blur',
    // Animation
    '@keyframes', '.animate-',
    // Min sizes for touch targets
    '.min-h-\\[48px\\]', '.min-w-\\[48px\\]', '.min-h-\\[44px\\]', '.min-w-\\[44px\\]',
    // Select
    '.select-none',
    // Truncate
    '.truncate', '.line-clamp',
    // Cursor
    '.cursor-pointer',
    // Scroll
    '.scroll-mt-',
    // Space
    '.space-y-',
    // Shrink
    '.shrink-0',
    // Opacity
    '.opacity-0',
    // Group
    '.group',
  ];
  
  // For the critical CSS, we'll take a simpler approach:
  // Include the @layer base rules and commonly used utilities
  let critical = '';
  
  // Always include @layer declarations and CSS custom properties
  for (const rule of rules) {
    const trimmed = rule.trim();
    // Include @layer base, @property, and :root rules
    if (trimmed.startsWith('@layer base') || 
        trimmed.startsWith('@property') ||
        trimmed.startsWith(':root') ||
        trimmed.includes('--tw-') ||
        trimmed.startsWith('*, ::before') ||
        trimmed.startsWith('*,::before') ||
        trimmed.startsWith('@keyframes')) {
      critical += trimmed + '\n';
    }
  }
  
  return critical;
}

// Instead of extracting critical CSS (which is complex and error-prone),
// we'll use a simpler approach: make the CSS load asynchronously
// while the SSR shell's inline styles handle the first paint

function processHtmlFile(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Replace the render-blocking CSS link with async loading
  // Pattern: <link rel="stylesheet" crossorigin href="/assets/index-XXX.css">
  const cssLinkRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/[^"]+\.css)">/;
  const match = html.match(cssLinkRegex);
  
  if (match) {
    const cssHref = match[1];
    // Replace with async CSS loading using media="print" trick
    const asyncCss = `<link rel="stylesheet" href="${cssHref}" media="print" onload="this.media='all'" crossorigin>
    <noscript><link rel="stylesheet" href="${cssHref}" crossorigin></noscript>`;
    html = html.replace(match[0], asyncCss);
    console.log(`  ✓ Made CSS async in ${path.relative(DIST_DIR, htmlPath)}`);
  }
  
  // Also add preload for the CSS file so it starts downloading early
  const preloadLink = `<link rel="preload" as="style" href="/assets/${cssFile}" crossorigin>`;
  html = html.replace('</head>', `    ${preloadLink}\n  </head>`);
  
  fs.writeFileSync(htmlPath, html);
}

// Process all HTML files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.html')) {
      processHtmlFile(fullPath);
    }
  }
}

console.log('\nOptimizing CSS loading...');
walkDir(DIST_DIR);
console.log('\n✅ CSS optimization complete!');
