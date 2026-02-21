# GA4 Event Tracking Documentation

This document describes all Google Analytics 4 (GA4) events tracked on loveveryfans.com.

## Setup

- **GA4 Measurement ID**: `G-ZCV2N7Q89L`
- **Implementation**: Lazy-loaded gtag.js (loads on first user interaction or after 8s)
- **Location**: `client/index.html`

## Tracked Events

### 1. Lovevery Referral Link Clicks

**Event Name**: `lovevery_referral_click`

**Trigger**: When user clicks any Lovevery official website link

**Parameters**:
- `kit_name` (string): Name of the Kit (e.g., "The Inspector")
- `kit_id` (string): Kit ID (e.g., "inspector")
- `page_url` (string): Current page URL
- `link_type` (string): Type of link clicked
  - `"kit_header"`: Main "View on Lovevery" button at top of Kit page
  - `"buy_kit_button"`: "Buy this Kit" button in referral card
  - `"learn_referral_button"`: "Learn about referral program" button

**UTM Parameters**: All Lovevery links include:
- `utm_source=loveveryfans`
- `utm_medium=referral`
- `utm_campaign=kit_{kitId}` (e.g., `kit_inspector`)

**Implementation**: `client/src/pages/KitDetail.tsx`

---

### 2. Amazon Affiliate Link Clicks

**Event Name**: `click_amazon_link`

**Trigger**: When user clicks "Buy on Amazon" button for alternative products

**Parameters**:
- `product_name` (string): Amazon product name
- `asin` (string): Amazon Standard Identification Number
- `price` (string): Product price (e.g., "$37.99")
- `kit_name` (string): Kit name where the alternative is shown
- `toy_name` (string): Original Lovevery toy name
- `page_url` (string): Current page URL

**Implementation**: `client/src/components/AlternativesSection.tsx`

---

### 3. Other Tracked Events

#### Language Switch
- **Event**: `switch_language`
- **Parameters**: `from_lang`, `to_lang`
- **Location**: `client/src/contexts/LanguageContext.tsx`

#### Scroll Depth
- **Event**: `scroll_depth`
- **Parameters**: `percent` (25%, 50%, 75%, 100%)
- **Location**: `client/src/App.tsx`

#### View Kit
- **Event**: `view_kit`
- **Parameters**: `kit_name`, `kit_id`
- **Location**: `client/src/pages/KitDetail.tsx`

#### View Alternatives
- **Event**: `view_alternatives`
- **Parameters**: `kit_name`, `toy_name`
- **Location**: `client/src/pages/KitDetail.tsx`

#### Module Expand/Collapse
- **Event**: `module_expand` / `module_collapse`
- **Parameters**: `module_type`, `kit_name`, `toy_name`
- **Location**: `client/src/pages/KitDetail.tsx`

#### Recommended Article Click
- **Event**: `click_recommended_article`
- **Parameters**: `article_title`, `article_url`
- **Location**: `client/src/components/RecommendedReading.tsx`

#### Easter Eggs
- **Event**: `unlock_konami`, `copy_konami_code`, `night_owl_heart`, `unlock_trivia`, `shake_discovery`
- **Location**: `client/src/components/easter-eggs/`

---

## Viewing Events in GA4

1. Go to **Google Analytics 4** dashboard
2. Navigate to **Reports** → **Engagement** → **Events**
3. Look for these event names:
   - `lovevery_referral_click` (NEW)
   - `click_amazon_link` (ENHANCED)
   - `switch_language`
   - `scroll_depth`
   - `view_kit`
   - `view_alternatives`

4. Click on any event to see detailed parameters and metrics

---

## UTM Campaign Tracking

To see which Kit pages drive the most Lovevery referrals:

1. Go to **Reports** → **Acquisition** → **Traffic acquisition**
2. Filter by **Source/Medium**: `loveveryfans / referral`
3. Add secondary dimension: **Campaign**
4. You'll see campaigns like:
   - `kit_inspector`
   - `kit_explorer`
   - `kit_thinker`
   - etc.

This shows which Kit pages generate the most clicks to Lovevery.com.

---

## Testing Events

To test if events are firing correctly:

1. Open the website in Chrome
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "collect" or "gtag"
5. Click a Lovevery link or Amazon button
6. You should see a request to `https://www.google-analytics.com/g/collect`
7. Check the request payload for event parameters

Alternatively, use **GA4 DebugView**:
1. Install "Google Analytics Debugger" Chrome extension
2. Enable it
3. Go to GA4 → **Admin** → **DebugView**
4. Interact with the site
5. See events appear in real-time

---

## Referral Code

All Lovevery links include the referral code: `REF-6AA44A5A`

This is appended as `?discount_code=REF-6AA44A5A` to all Lovevery URLs.
