// REF: https://github.com/home-assistant/frontend/blob/dev/src/common/datetime/use_am_pm.ts

import { FrontendLocaleData, TimeFormat } from "../types"

/**
 * Checking if AM/PM time format is used within the browser.
 * @param locale Homeassistant frontend locale data
 * @returns 
 */
export const useAmPm = (locale: FrontendLocaleData): boolean => {
  if (
    locale.time_format === TimeFormat.language ||
    locale.time_format === TimeFormat.system
  ) {
    const testLanguage =
      locale.time_format === TimeFormat.language ? locale.language : undefined;
    const test = new Date().toLocaleString(testLanguage);
    return test.includes("AM") || test.includes("PM");
  }

  return locale.time_format === TimeFormat.am_pm;
};
