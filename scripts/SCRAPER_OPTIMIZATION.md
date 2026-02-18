# Amazon Scraper Optimization Report

## Overview

This document details the optimizations made to the `scrape_alternatives.py` script to significantly improve its reliability, success rate, and data quality when scraping Amazon product pages.

## Problem Analysis

The original scraper had several issues that led to low success rates:

1. **Low image extraction rate**: Only 47% of products had images
2. **Frequent 404/500 errors**: Many Amazon pages returned errors
3. **Bot detection**: Amazon's anti-bot measures were blocking requests
4. **Insufficient retry logic**: Simple retry without exponential backoff
5. **Limited data extraction**: Single selector paths for each data field
6. **No session management**: Each request was independent
7. **Poor visibility**: Limited statistics and error tracking

## Optimizations Implemented

### 1. Realistic Browser Simulation

**Problem**: Amazon detects and blocks requests that don't look like real browsers.

**Solution**:
- **User-Agent rotation**: Pool of 5 realistic User-Agent strings from different browsers (Chrome, Safari, Firefox)
- **Complete headers**: Added all modern browser headers including `sec-ch-ua`, `Sec-Fetch-*` headers
- **Header randomization**: Each request gets a random User-Agent from the pool

```python
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    # ... 5 different realistic User-Agents
]
```

### 2. Session Management with Cookie Persistence

**Problem**: Independent requests without cookies look suspicious.

**Solution**:
- **Persistent session**: Using `requests.Session()` to maintain cookies across requests
- **Session cookies**: Pre-populate with realistic Amazon session cookies
- **Connection pooling**: Reuse TCP connections for better performance

```python
class AmazonSession:
    def __init__(self):
        self.session = requests.Session()
        self.session.cookies.set('session-id', f'000-0000000-{random.randint(1000000, 9999999)}')
```

### 3. Exponential Backoff Retry Mechanism

**Problem**: Fixed delays don't adapt to server load or rate limiting.

**Solution**:
- **Exponential backoff**: Delay doubles with each retry (2s → 4s → 8s → 16s → 32s)
- **Jitter**: Add 0-30% random jitter to prevent thundering herd
- **Max delay cap**: Prevent excessively long waits (60s max)
- **Increased retries**: From 3 to 5 attempts

```python
def exponential_backoff_delay(attempt: int) -> float:
    delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
    jitter = random.uniform(0, delay * 0.3)
    return delay + jitter
```

### 4. Improved Rate Limiting Strategy

**Problem**: Fixed delays are either too slow or trigger rate limits.

**Solution**:
- **Base delay + jitter**: 3s base + 0-2s random jitter for first request
- **Adaptive delays**: Longer delays after failures or rate limits
- **Bot detection handling**: 30s cooldown if CAPTCHA/bot check detected

### 5. Enhanced Data Extraction with Multiple Fallbacks

**Problem**: Single selector paths fail when Amazon changes page structure.

**Solution**: Multiple fallback selectors for each data field.

#### Price Extraction (9 fallback methods)
```python
price_selectors = [
    ('span', {'class': 'a-price-whole'}),
    ('span', {'class': 'a-offscreen'}),
    ('span', {'id': 'priceblock_ourprice'}),
    ('span', {'id': 'priceblock_dealprice'}),
    ('span', {'id': 'priceblock_saleprice'}),
    ('span', {'class': 'a-color-price'}),
    ('span', {'class': 'apexPriceToPay'}),
    ('div', {'id': 'corePrice_feature_div'}),
    ('div', {'id': 'corePriceDisplay_desktop_feature_div'}),
]
```

#### Rating Extraction (3 fallback methods)
- `a-icon-alt` span (primary)
- `acrPopover` span
- `a-icon-star` i tag

#### Review Count Extraction (4 fallback patterns)
- Global ratings text
- Customer review text
- Review links
- Rating count spans

#### Image URL Extraction (5 fallback methods)
1. **landingImage** (most reliable)
2. **imgTagWrapperId** div
3. **a-dynamic-image** class
4. **JSON-LD structured data** (new!)
5. **og:image meta tag** (new!)

### 6. Image URL Quality Enhancement

**Problem**: Extracted images were low resolution thumbnails.

**Solution**:
- **Remove size parameters**: Strip `._SL500_`, `._AC_UL320_` from URLs
- **Force HTTPS**: Ensure all image URLs use secure protocol
- **Prefer high-res sources**: Prioritize `data-old-hires` attribute

```python
def clean_image_url(url: str) -> str:
    url = re.sub(r'\._[A-Z]{2}\d+_\.', '.', url)  # Remove size params
    url = re.sub(r'\._.*?_\.', '.', url)
    if url.startswith('//'):
        url = 'https:' + url
    return url
```

### 7. Comprehensive Error Handling

**Problem**: Generic error handling provided no insight into failures.

**Solution**:
- **Status code tracking**: Record all HTTP status codes encountered
- **Error categorization**: Classify failures (404, 503, timeout, bot detection, etc.)
- **Graceful degradation**: Single product failure doesn't stop entire scrape
- **Detailed logging**: Verbose mode shows exactly what went wrong

```python
# Handle different status codes appropriately
if response.status_code == 503:
    # Rate limited - back off
elif response.status_code == 404:
    # Product not found - don't retry
elif response.status_code >= 500:
    # Server error - retry
```

### 8. Bot Detection Handling

**Problem**: Amazon shows CAPTCHA pages that weren't detected.

**Solution**:
- **Content inspection**: Check for bot detection keywords in HTML
- **Long cooldown**: 30s wait if bot detection triggered
- **Early detection**: Avoid wasting retries on blocked requests

```python
if 'api-services-support@amazon.com' in response.text or 'Robot Check' in response.text:
    if attempt < MAX_RETRIES - 1:
        time.sleep(30)  # Long cooldown
```

### 9. Detailed Statistics Tracking

**Problem**: No visibility into scraper performance and issues.

**Solution**: Comprehensive `ScraperStats` class tracking:

- **Success metrics**:
  - Total attempts
  - Successful scrapes
  - Success rate percentage
  - Products with price/rating/reviews/images

- **Failure analysis**:
  - HTTP status code distribution
  - Failure reason categorization
  - Total retries performed

- **Performance metrics**:
  - Elapsed time
  - Average time per product

```python
@dataclass
class ScraperStats:
    total_attempts: int = 0
    successful_scrapes: int = 0
    failed_scrapes: int = 0
    status_codes: Dict[int, int] = field(default_factory=dict)
    failure_reasons: Dict[str, int] = field(default_factory=dict)
    # ... more fields
```

### 10. Data Validation

**Problem**: Invalid data (like years mistaken for prices) was accepted.

**Solution**:
- **Price validation**: Ensure price is between $0.01 and $9999
- **Rating validation**: Ensure rating is between 0 and 5
- **Review count validation**: Ensure count is positive
- **Image URL validation**: Check for sprite images and invalid URLs

## Usage

### Basic Usage (same as original)
```bash
python3 scrape_alternatives_optimized.py --update --verbose
```

### With Statistics Report
```bash
python3 scrape_alternatives_optimized.py --update --verbose --stats
```

### Refresh Prices Only (no AI, faster)
```bash
python3 scrape_alternatives_optimized.py --refresh-prices --verbose --stats
```

### Single Kit Testing
```bash
python3 scrape_alternatives_optimized.py --kit looker --verbose --stats
```

## Expected Improvements

Based on the optimizations, expected improvements:

| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Overall success rate | ~50% | ~85-90% |
| Image extraction rate | 47% | 80-90% |
| Price extraction rate | ~60% | 90-95% |
| Rating extraction rate | ~70% | 90-95% |
| Bot detection rate | High | Low |
| 404 error rate | High | Same (product-dependent) |
| 503 rate limit errors | Frequent | Rare |

## Statistics Report Example

When run with `--stats` flag, you'll see:

```
======================================================================
SCRAPER STATISTICS REPORT
======================================================================
Total scraping attempts:     150
Successful scrapes:          128 (85.3%)
Failed scrapes:              22
Total retries performed:     45
Elapsed time:                892.3s

Data Quality:
  Products with price:       122/128 (95%)
  Products with rating:      125/128 (97%)
  Products with reviews:     120/128 (93%)
  Products with image:       115/128 (89%)

HTTP Status Codes:
  200: 128
  404: 15
  503: 7

Failure Reasons:
  404_not_found: 15
  503_rate_limited: 5
  timeout: 2
======================================================================
```

## Best Practices for Running

1. **Use `--update` mode**: Preserves existing good data while adding new products
2. **Run during off-peak hours**: Less likely to trigger rate limits (e.g., 2-5 AM PST)
3. **Use `--verbose --stats`**: Get full visibility into what's happening
4. **Start with one kit**: Test with `--kit looker` before running full scrape
5. **Monitor logs**: Watch for patterns in failures
6. **Periodic refresh**: Use `--refresh-prices` weekly to update prices without AI costs

## Future Enhancements (Optional)

If success rate is still not satisfactory, consider:

1. **Residential proxy rotation**: Use services like BrightData, Oxylabs
2. **Browser automation**: Use Playwright/Selenium for JavaScript rendering
3. **Amazon Product Advertising API**: Official API (requires approval, has rate limits)
4. **Distributed scraping**: Run from multiple IPs/locations
5. **Machine learning**: Train model to detect and adapt to page structure changes

## Conclusion

The optimized scraper is significantly more robust and reliable than the original version. The combination of realistic browser simulation, session management, exponential backoff, multiple extraction fallbacks, and comprehensive error handling should dramatically improve success rates and data quality.

The detailed statistics tracking also provides full visibility into scraper performance, making it easy to identify and address any remaining issues.
