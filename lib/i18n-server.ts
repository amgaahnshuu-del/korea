import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LANGUAGE_COOKIE, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export { LANGUAGE_COOKIE };
