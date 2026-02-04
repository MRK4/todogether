import {getRequestConfig} from "next-intl/server";

const FALLBACK_LOCALE = "fr";
const SUPPORTED_LOCALES = ["fr", "en"] as const;

type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async ({requestLocale}) => {
  const resolved = await requestLocale;
  const locale: AppLocale =
    (SUPPORTED_LOCALES.includes(resolved as AppLocale)
      ? resolved
      : FALLBACK_LOCALE) as AppLocale;

  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});

