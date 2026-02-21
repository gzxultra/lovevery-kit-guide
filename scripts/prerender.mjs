/**
 * Post-build prerendering script for GitHub Pages SEO.
 * 
 * For each route (/kit/looker, /kit/charmer, ..., /about),
 * this script creates a directory with an index.html that contains:
 * 1. Proper SEO meta tags (title, description, OG tags, canonical, hreflang)
 * 2. A noscript section with meaningful content for crawlers
 * 3. The same JS/CSS assets as the main index.html so the SPA boots up
 * 
 * This ensures Google can crawl each page with unique meta tags even before
 * JavaScript executes, while the SPA takes over for interactive users.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist');
const SITE_URL = 'https://loveveryfans.com';

// All kit IDs
const KIT_IDS = [
  'looker', 'charmer', 'senser', 'inspector', 'explorer', 'thinker',
  'babbler', 'adventurer', 'realist', 'companion', 'helper', 'enthusiast',
  'investigator', 'freeSpirit', 'observer', 'storyteller', 'problemSolver',
  'analyst', 'connector', 'examiner', 'persister', 'planner'
];

// SEO data for each kit (extracted from seoData.ts)
const kitSeoData = {
  looker: { title: "The Looker Play Kit (0-12 Weeks) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover the best affordable alternatives to the Lovevery Looker Play Kit for newborns 0-12 weeks. Compare real Amazon prices, ratings, and find high-contrast toy dupes for your baby.", age: "0-12 weeks" },
  charmer: { title: "The Charmer Play Kit (3-4 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Find the best Lovevery Charmer Play Kit alternatives for 3-4 month old babies. Compare Amazon dupes with real prices, ratings, and parent reviews for social smile stage toys.", age: "3-4 months" },
  senser: { title: "The Senser Play Kit (5-6 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Explore affordable alternatives to the Lovevery Senser Play Kit for 5-6 month old babies. Sensory toys, teethers, and activity mats with real Amazon prices and ratings.", age: "5-6 months" },
  inspector: { title: "The Inspector Play Kit (7-8 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Inspector Play Kit alternatives for 7-8 month old babies. Object permanence toys, stacking cups, and more with Amazon prices and parent reviews.", age: "7-8 months" },
  explorer: { title: "The Explorer Play Kit (9-10 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover affordable Lovevery Explorer Play Kit alternatives for 9-10 month old babies. Crawling toys, shape sorters, and more with real Amazon prices and ratings.", age: "9-10 months" },
  thinker: { title: "The Thinker Play Kit (11-12 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Thinker Play Kit alternatives for 11-12 month old babies. Problem-solving toys, first puzzles, and more with Amazon prices and parent reviews.", age: "11-12 months" },
  babbler: { title: "The Babbler Play Kit (13-15 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Find affordable Lovevery Babbler Play Kit alternatives for 13-15 month old toddlers. Language development toys, stacking toys, and more with real Amazon prices.", age: "13-15 months" },
  adventurer: { title: "The Adventurer Play Kit (16-18 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Adventurer Play Kit alternatives for 16-18 month old toddlers. Walking toys, pretend play, and more with Amazon prices and parent reviews.", age: "16-18 months" },
  realist: { title: "The Realist Play Kit (19-21 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover affordable Lovevery Realist Play Kit alternatives for 19-21 month old toddlers. Pretend play, puzzles, and more with real Amazon prices and ratings.", age: "19-21 months" },
  companion: { title: "The Companion Play Kit (22-24 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Companion Play Kit alternatives for 22-24 month old toddlers. Social play toys, building blocks, and more with Amazon prices and reviews.", age: "22-24 months" },
  helper: { title: "The Helper Play Kit (25-27 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Find affordable Lovevery Helper Play Kit alternatives for 25-27 month old toddlers. Practical life toys, Montessori tools, and more with real Amazon prices.", age: "25-27 months" },
  enthusiast: { title: "The Enthusiast Play Kit (28-30 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Enthusiast Play Kit alternatives for 28-30 month old toddlers. Creative play toys, art supplies, and more with Amazon prices and parent reviews.", age: "28-30 months" },
  investigator: { title: "The Investigator Play Kit (31-33 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover affordable Lovevery Investigator Play Kit alternatives for 31-33 month old toddlers. STEM toys, science kits, and more with real Amazon prices and ratings.", age: "31-33 months" },
  freeSpirit: { title: "The Free Spirit Play Kit (34-36 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Free Spirit Play Kit alternatives for 34-36 month old toddlers. Imaginative play, art tools, and more with Amazon prices and parent reviews.", age: "34-36 months" },
  observer: { title: "The Observer Play Kit (37-39 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Find affordable Lovevery Observer Play Kit alternatives for 37-39 month old preschoolers. Observation toys, nature kits, and more with real Amazon prices.", age: "37-39 months" },
  storyteller: { title: "The Storyteller Play Kit (40-42 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Storyteller Play Kit alternatives for 40-42 month old preschoolers. Storytelling toys, language games, and more with Amazon prices and reviews.", age: "40-42 months" },
  problemSolver: { title: "The Problem Solver Play Kit (43-45 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover affordable Lovevery Problem Solver Play Kit alternatives for 43-45 month old preschoolers. Logic puzzles, STEM toys, and more with real Amazon prices.", age: "43-45 months" },
  analyst: { title: "The Analyst Play Kit (46-48 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Analyst Play Kit alternatives for 46-48 month old preschoolers. Math toys, pattern games, and more with Amazon prices and parent reviews.", age: "46-48 months" },
  connector: { title: "The Connector Play Kit (49-51 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Find affordable Lovevery Connector Play Kit alternatives for 49-51 month old preschoolers. Social games, building toys, and more with real Amazon prices.", age: "49-51 months" },
  examiner: { title: "The Examiner Play Kit (52-54 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Examiner Play Kit alternatives for 52-54 month old preschoolers. Detail-oriented toys, science experiments, and more with Amazon prices.", age: "52-54 months" },
  persister: { title: "The Persister Play Kit (55-57 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Discover affordable Lovevery Persister Play Kit alternatives for 55-57 month old preschoolers. Persistence toys, literacy games, and more with real Amazon prices.", age: "55-57 months" },
  planner: { title: "The Planner Play Kit (58-60 Months) | Lovevery Alternatives & Dupes | Lovevery Fans", desc: "Best Lovevery Planner Play Kit alternatives for 58-60 month old preschoolers. Time management toys, planning tools, and more with Amazon prices and reviews.", age: "58-60 months" },
};

// Read the main index.html to extract JS/CSS asset references
const mainHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

// Extract script and link tags from the <head>
const scriptTags = mainHtml.match(/<script[^>]*src="[^"]*"[^>]*><\/script>/g) || [];
const cssTags = mainHtml.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
const faviconTags = mainHtml.match(/<link[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/g) || [];
const fontTags = mainHtml.match(/<link[^>]*(?:preconnect|fonts\.googleapis)[^>]*>/g) || [];

// Extract the module script tag (the main entry point)
const moduleScript = mainHtml.match(/<script type="module"[^>]*>[\s\S]*?<\/script>/g) || [];

const assetTags = [...fontTags, ...faviconTags, ...cssTags].join('\n    ');
const scriptTagsStr = [...scriptTags, ...moduleScript].join('\n    ');

function generateKitHtml(kitId) {
  const seo = kitSeoData[kitId];
  const pageUrl = `${SITE_URL}/kit/${kitId}/`;
  const kitName = kitId.charAt(0).toUpperCase() + kitId.slice(1);
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5" />
    <title>${seo.title}</title>
    <meta name="description" content="${seo.desc}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" hreflang="zh" href="${pageUrl}" />
    <link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.desc}" />
    <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Lovevery Fans" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.desc}" />
    <meta name="twitter:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg" />
    <meta name="theme-color" content="#FAF7F2" />
    ${assetTags}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "The ${kitName} Play Kit", "item": "${pageUrl}"}
      ]
    }
    </script>
    ${scriptTagsStr}
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <div style="max-width:800px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;">
        <h1>The ${kitName} Play Kit (${seo.age})</h1>
        <p>${seo.desc}</p>
        <p><a href="/">← Back to Lovevery Fans Homepage</a></p>
        <p><a href="/about">About Us</a></p>
      </div>
    </noscript>
  </body>
</html>`;
}

function generateAboutHtml() {
  const pageUrl = `${SITE_URL}/about/`;
  const title = "About Us | Lovevery Fans";
  const desc = "Learn about the story behind Lovevery Fans — an independent, ad-free community guide built by parents for parents. Not affiliated with Lovevery Inc.";
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" hreflang="zh" href="${pageUrl}" />
    <link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg" />
    <meta property="og:site_name" content="Lovevery Fans" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="theme-color" content="#FAF7F2" />
    ${assetTags}
    ${scriptTagsStr}
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <div style="max-width:800px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;">
        <h1>About Lovevery Fans</h1>
        <p>${desc}</p>
        <p><a href="/">← Back to Lovevery Fans Homepage</a></p>
      </div>
    </noscript>
  </body>
</html>`;
}

// Standalone product IDs and SEO data
const PRODUCT_IDS = ['music-set', 'bath-set', 'block-set', 'play-gym'];

const productSeoData = {
  'music-set': { title: 'The Music Set | Lovevery Alternatives & Dupes | Lovevery Fans', desc: 'Discover the best affordable alternatives to the Lovevery Music Set. Compare real Amazon prices, ratings, and find musical toy dupes for your baby.', subtitle: 'Music Set' },
  'bath-set': { title: 'The Bath Set | Lovevery Alternatives & Dupes | Lovevery Fans', desc: 'Find the best Lovevery Bath Set alternatives. Compare Amazon dupes with real prices, ratings, and parent reviews for bath time learning toys.', subtitle: 'Bath Set' },
  'block-set': { title: 'The Block Set | Lovevery Alternatives & Dupes | Lovevery Fans', desc: 'Explore affordable alternatives to the Lovevery Block Set. Solid wood blocks with real Amazon prices, ratings, and parent reviews.', subtitle: 'Block Set' },
  'play-gym': { title: 'The Play Gym | Lovevery Alternatives & Dupes | Lovevery Fans', desc: 'Best Lovevery Play Gym alternatives. Compare activity gym dupes with real Amazon prices, ratings, and parent reviews for newborn development.', subtitle: 'Play Gym' },
};

function generateProductHtml(productId) {
  const seo = productSeoData[productId];
  const pageUrl = `${SITE_URL}/product/${productId}/`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5" />
    <title>${seo.title}</title>
    <meta name="description" content="${seo.desc}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" hreflang="zh" href="${pageUrl}" />
    <link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.desc}" />
    <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Lovevery Fans" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.desc}" />
    <meta name="twitter:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663324967219/MNPxTRzCbxWVkhFf.jpg" />
    <meta name="theme-color" content="#FAF7F2" />
    ${assetTags}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "The ${seo.subtitle}", "item": "${pageUrl}"}
      ]
    }
    </script>
    ${scriptTagsStr}
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <div style="max-width:800px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;">
        <h1>The ${seo.subtitle}</h1>
        <p>${seo.desc}</p>
        <p><a href="/">\u2190 Back to Lovevery Fans Homepage</a></p>
        <p><a href="/about">About Us</a></p>
      </div>
    </noscript>
  </body>
</html>`;
}

// Generate kit pages
let count = 0;
for (const kitId of KIT_IDS) {
  const dir = path.join(DIST_DIR, 'kit', kitId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), generateKitHtml(kitId));
  count++;
  console.log(`  ✓ /kit/${kitId}/index.html`);
}

// Generate about page
const aboutDir = path.join(DIST_DIR, 'about');
fs.mkdirSync(aboutDir, { recursive: true });
fs.writeFileSync(path.join(aboutDir, 'index.html'), generateAboutHtml());
count++;
console.log(`  ✓ /about/index.html`);

// Generate standalone product pages
for (const productId of PRODUCT_IDS) {
  const dir = path.join(DIST_DIR, 'product', productId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), generateProductHtml(productId));
  count++;
  console.log(`  ✓ /product/${productId}/index.html`);
}

console.log(`\n✅ Prerendered ${count} pages successfully!`);
