import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, type Lang } from "./i18n";

/* The visitor's chosen language, from the cookie the FIL/EN switch sets. Filipino by default. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "fil";
}
