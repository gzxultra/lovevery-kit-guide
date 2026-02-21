/**
 * SEO Helper utilities for dynamically managing meta tags,
 * canonical URLs, hreflang tags, and JSON-LD structured data.
 */

const SITE_URL = "https://loveveryfans.com";

/**
 * Set or update a meta tag by name or property
 */
function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Set or update a link tag by rel (and optionally hreflang)
 */
function setLinkTag(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Set or update JSON-LD structured data script tag
 */
function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-seo-id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Remove JSON-LD structured data script tag
 */
function removeJsonLd(id: string) {
  const el = document.querySelector(`script[data-seo-id="${id}"]`);
  if (el) el.remove();
}

export interface KitSeoParams {
  kitId: string;
  kitName: string;
  ageRange: string;
  ageRangeEn: string;
  description: string;
  descriptionEn: string;
  metaTitle: string;
  metaDescription: string;
  toyCount: number;
  stage: string;
  color: string;
  toys: Array<{
    name: string;
    englishName: string;
    category: string;
  }>;
  alternatives?: Array<{
    toyName: string;
    alternatives: Array<{
      name: string;
      price: string | null;
      rating: number | null;
      reviewCount: number | null;
      amazonUrl: string;
      imageUrl?: string;
    }>;
  }>;
}

/**
 * Build a priceValidUntil date string (1 year from today) for schema.org Product offers.
 * This satisfies the Google Search Console "priceValidUntil" recommendation.
 */
function getPriceValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0]; // e.g. "2026-02-21"
}

/**
 * Apply all SEO tags for a Kit detail page
 */
export function applyKitPageSeo(params: KitSeoParams) {
  const pageUrl = `${SITE_URL}/kit/${params.kitId}`;

  // 1. Set document title
  document.title = params.metaTitle;

  // 2. Meta description
  setMetaTag("name", "description", params.metaDescription);

  // 3. Open Graph tags
  setMetaTag("property", "og:title", params.metaTitle);
  setMetaTag("property", "og:description", params.metaDescription);
  setMetaTag("property", "og:url", pageUrl);
  setMetaTag("property", "og:type", "website");

  // 4. Twitter Card tags
  setMetaTag("name", "twitter:title", params.metaTitle);
  setMetaTag("name", "twitter:description", params.metaDescription);

  // 5. Canonical URL
  setLinkTag("canonical", pageUrl);

  // 6. Hreflang tags
  setLinkTag("alternate", pageUrl, "zh");
  setLinkTag("alternate", pageUrl, "en");
  setLinkTag("alternate", pageUrl, "x-default");

  // 7. JSON-LD Structured Data - Product/ItemList for the kit
  const itemListData: any = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${params.kitName} Play Kit - Affordable Alternatives`,
    "description": `Best affordable Amazon alternatives and dupes for the Lovevery ${params.kitName} Play Kit (${params.ageRangeEn}). Compare prices, ratings, and reviews.`,
    "url": pageUrl,
    "numberOfItems": params.toyCount,
    "itemListElement": params.toys.map((toy, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": toy.englishName,
      "description": `${toy.englishName} - ${toy.category}`,
    })),
  };
  setJsonLd("kit-itemlist", itemListData);

  // 8. JSON-LD for alternatives as Product offers (if available)
  if (params.alternatives && params.alternatives.length > 0) {
    const priceValidUntil = getPriceValidUntil();
    const allAlts: any[] = [];

    params.alternatives.forEach((toyAlt) => {
      toyAlt.alternatives.forEach((alt) => {
        const priceStr = alt.price ? alt.price.replace(/[^0-9.]/g, "") || "0" : null;

        const product: any = {
          "@type": "Product",
          "name": alt.name,
          "description": `Affordable alternative to Lovevery ${toyAlt.toyName}`,
          "url": alt.amazonUrl,
        };

        // image — critical for Merchant listings; use imageUrl when available
        if (alt.imageUrl) {
          product["image"] = alt.imageUrl;
        }

        // aggregateRating
        if (alt.rating != null) {
          product["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": alt.rating.toString(),
            "bestRating": "5",
            "reviewCount": (alt.reviewCount || 0).toString(),
          };
        }

        // offers — only add when price is available
        if (priceStr) {
          product["offers"] = {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": priceStr,
            // priceValidUntil — recommended by Google Search Console
            "priceValidUntil": priceValidUntil,
            "availability": "https://schema.org/InStock",
            "url": alt.amazonUrl,
            // shippingDetails — recommended by Google Merchant listings
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "USD",
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "US",
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY",
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 7,
                  "unitCode": "DAY",
                },
              },
            },
            // hasMerchantReturnPolicy — recommended by Google Merchant listings
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "US",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 30,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn",
            },
          };
        }

        allAlts.push(product);
      });
    });

    if (allAlts.length > 0) {
      setJsonLd("kit-products", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Amazon Alternatives for ${params.kitName} Play Kit`,
        "description": `Curated list of affordable Amazon alternatives for the Lovevery ${params.kitName} Play Kit (${params.ageRangeEn})`,
        "url": pageUrl,
        "numberOfItems": allAlts.length,
        "itemListElement": allAlts.slice(0, 20).map((alt, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "item": alt,
        })),
      });
    }
  }

  // 9. BreadcrumbList structured data
  setJsonLd("kit-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": params.kitName,
        "item": pageUrl,
      },
    ],
  });
}

/**
 * Clean up kit page SEO tags (call on unmount)
 */
export function cleanupKitPageSeo() {
  removeJsonLd("kit-itemlist");
  removeJsonLd("kit-products");
  removeJsonLd("kit-breadcrumb");

  // Reset to default
  document.title = "Lovevery Fans";
  setMetaTag("name", "description", "Lovevery Fans — A comprehensive bilingual guide to all Lovevery Play Kits with parent reviews, cleaning guides, and affordable Amazon alternatives.");
  setLinkTag("canonical", `${SITE_URL}/`);
  setLinkTag("alternate", `${SITE_URL}/`, "zh");
  setLinkTag("alternate", `${SITE_URL}/`, "en");
  setLinkTag("alternate", `${SITE_URL}/`, "x-default");
}

/**
 * Apply SEO for the Home page
 */
export function applyHomePageSeo() {
  document.title = "Lovevery Fans — Complete Play Kit Guide & Affordable Alternatives";
  setMetaTag("name", "description", "Lovevery Fans — Complete bilingual guide to all 22 Lovevery Play Kits (0-60 months). Real parent reviews, toy cleaning guides, and curated affordable Amazon alternatives with prices and ratings.");
  setMetaTag("property", "og:title", "Lovevery Fans — Complete Play Kit Guide & Affordable Alternatives");
  setMetaTag("property", "og:url", `${SITE_URL}/`);
  setLinkTag("canonical", `${SITE_URL}/`);
  setLinkTag("alternate", `${SITE_URL}/`, "zh");
  setLinkTag("alternate", `${SITE_URL}/`, "en");
  setLinkTag("alternate", `${SITE_URL}/`, "x-default");
}

/**
 * Apply all SEO tags for a standalone Product detail page
 */
export function applyProductPageSeo(params: KitSeoParams) {
  const pageUrl = `${SITE_URL}/product/${params.kitId}`;

  // 1. Set document title
  document.title = params.metaTitle;

  // 2. Meta description
  setMetaTag("name", "description", params.metaDescription);

  // 3. Open Graph tags
  setMetaTag("property", "og:title", params.metaTitle);
  setMetaTag("property", "og:description", params.metaDescription);
  setMetaTag("property", "og:url", pageUrl);
  setMetaTag("property", "og:type", "website");

  // 4. Twitter Card tags
  setMetaTag("name", "twitter:title", params.metaTitle);
  setMetaTag("name", "twitter:description", params.metaDescription);

  // 5. Canonical URL
  setLinkTag("canonical", pageUrl);

  // 6. Hreflang tags
  setLinkTag("alternate", pageUrl, "zh");
  setLinkTag("alternate", pageUrl, "en");
  setLinkTag("alternate", pageUrl, "x-default");

  // 7. JSON-LD Structured Data - ItemList for the product
  const itemListData: any = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${params.kitName} - Affordable Alternatives`,
    "description": `Best affordable Amazon alternatives and dupes for the Lovevery ${params.kitName} (${params.ageRangeEn}). Compare prices, ratings, and reviews.`,
    "url": pageUrl,
    "numberOfItems": params.toyCount,
    "itemListElement": params.toys.map((toy, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": toy.englishName,
      "description": `${toy.englishName} - ${toy.category}`,
    })),
  };
  setJsonLd("product-itemlist", itemListData);

  // 8. JSON-LD for alternatives as Product offers
  if (params.alternatives && params.alternatives.length > 0) {
    const priceValidUntil = getPriceValidUntil();
    const allAlts: any[] = [];

    params.alternatives.forEach((toyAlt) => {
      toyAlt.alternatives.forEach((alt) => {
        const priceStr = alt.price ? alt.price.replace(/[^0-9.]/g, "") || "0" : null;

        const product: any = {
          "@type": "Product",
          "name": alt.name,
          "description": `Affordable alternative to Lovevery ${toyAlt.toyName}`,
          "url": alt.amazonUrl,
        };

        if (alt.imageUrl) {
          product["image"] = alt.imageUrl;
        }

        if (alt.rating != null) {
          product["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": alt.rating.toString(),
            "bestRating": "5",
            "reviewCount": (alt.reviewCount || 0).toString(),
          };
        }

        if (priceStr) {
          product["offers"] = {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": priceStr,
            "priceValidUntil": priceValidUntil,
            "availability": "https://schema.org/InStock",
            "url": alt.amazonUrl,
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "USD",
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "US",
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY",
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 7,
                  "unitCode": "DAY",
                },
              },
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "US",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 30,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn",
            },
          };
        }

        allAlts.push(product);
      });
    });

    if (allAlts.length > 0) {
      setJsonLd("product-products", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Amazon Alternatives for ${params.kitName}`,
        "description": `Curated list of affordable Amazon alternatives for the Lovevery ${params.kitName} (${params.ageRangeEn})`,
        "url": pageUrl,
        "numberOfItems": allAlts.length,
        "itemListElement": allAlts.slice(0, 20).map((alt, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "item": alt,
        })),
      });
    }
  }

  // 9. BreadcrumbList structured data
  setJsonLd("product-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": params.kitName,
        "item": pageUrl,
      },
    ],
  });
}

/**
 * Clean up product page SEO tags (call on unmount)
 */
export function cleanupProductPageSeo() {
  removeJsonLd("product-itemlist");
  removeJsonLd("product-products");
  removeJsonLd("product-breadcrumb");

  document.title = "Lovevery Fans";
  setMetaTag("name", "description", "Lovevery Fans — A comprehensive bilingual guide to all Lovevery Play Kits with parent reviews, cleaning guides, and affordable Amazon alternatives.");
  setLinkTag("canonical", `${SITE_URL}/`);
  setLinkTag("alternate", `${SITE_URL}/`, "zh");
  setLinkTag("alternate", `${SITE_URL}/`, "en");
  setLinkTag("alternate", `${SITE_URL}/`, "x-default");
}

/**
 * Apply SEO for the About page
 */
export function applyAboutPageSeo(lang: "cn" | "en") {
  const pageUrl = `${SITE_URL}/about`;
  const title = lang === "cn"
    ? "关于我们 | Lovevery Fans"
    : "About Us | Lovevery Fans";
  const desc = lang === "cn"
    ? "了解 Lovevery Fans 背后的故事——一个由家长为家长打造的独立、无广告社区指南。"
    : "Learn about the story behind Lovevery Fans — an independent, ad-free community guide built by parents for parents.";

  document.title = title;
  setMetaTag("name", "description", desc);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", desc);
  setMetaTag("property", "og:url", pageUrl);
  setLinkTag("canonical", pageUrl);
  setLinkTag("alternate", pageUrl, "zh");
  setLinkTag("alternate", pageUrl, "en");
  setLinkTag("alternate", pageUrl, "x-default");
}
