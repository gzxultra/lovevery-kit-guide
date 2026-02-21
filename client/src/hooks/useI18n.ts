/**
 * useI18n — drop-in replacement for `import { i18n } from "@/data/i18n"`.
 *
 * Returns a deep Proxy of the i18n object.  When the user's browser is set to
 * a Traditional Chinese locale (zh-TW / zh-HK), any `[lang]` access on a leaf
 * node `{ cn: "…", en: "…" }` transparently converts the simplified Chinese
 * string to Traditional Chinese via opencc-js (loaded lazily in LanguageContext).
 *
 * Usage — replace the static import with the hook:
 *
 *   // Before
 *   import { i18n } from "@/data/i18n";
 *   const { lang } = useLanguage();
 *   …{i18n.hero.badge[lang]}…
 *
 *   // After
 *   const i18n = useI18n();
 *   const { lang } = useLanguage();
 *   …{i18n.hero.badge[lang]}…   ← identical call-site, Traditional auto-applied
 */

import { useMemo } from "react";
import { i18n as rawI18n } from "@/data/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

// ---------------------------------------------------------------------------
// Deep-proxy factory
// ---------------------------------------------------------------------------

type AnyObject = Record<string | symbol, unknown>;

/**
 * Recursively wrap `obj` in a Proxy so that any access to a "cn" key on a
 * leaf node `{ cn: string; en: string }` passes the value through `convert`.
 */
function createI18nProxy<T extends AnyObject>(
  obj: T,
  convert: (text: string) => string
): T {
  return new Proxy(obj, {
    get(target, key) {
      const val = (target as AnyObject)[key as string];

      // Leaf node: an object that has both "cn" and "en" string keys.
      if (
        val !== null &&
        typeof val === "object" &&
        "cn" in (val as AnyObject) &&
        "en" in (val as AnyObject)
      ) {
        return new Proxy(val as AnyObject, {
          get(t, k) {
            const v = (t as AnyObject)[k as string];
            // Only convert the "cn" string; leave "en" (and anything else) alone.
            if (k === "cn" && typeof v === "string") {
              return convert(v);
            }
            return v;
          },
        });
      }

      // Intermediate node: recurse.
      if (val !== null && typeof val === "object") {
        return createI18nProxy(val as AnyObject, convert);
      }

      // Primitive (shouldn't normally happen at the top level).
      return val;
    },
  }) as T;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns a Proxy-wrapped version of the i18n object.
 * All `[lang]` accesses on `{ cn, en }` leaf nodes automatically apply
 * Traditional Chinese conversion when the user's locale is zh-TW / zh-HK.
 */
export function useI18n(): typeof rawI18n {
  const { convert } = useLanguage();

  // Re-create the proxy only when `convert` changes (i.e. when the opencc-js
  // converter finishes loading or the language toggles).
  const proxied = useMemo(
    () => createI18nProxy(rawI18n as unknown as AnyObject, convert),
    [convert]
  );

  return proxied as unknown as typeof rawI18n;
}
