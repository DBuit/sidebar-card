//REF: https://github.com/home-assistant/frontend/blob/dev/src/common/datetime/format_date_time.ts

import { FrontendLocaleData } from "../types";
import { useAmPm } from "./use_am_pm";

// August 9, 2021, 8:23 AM
/**
 * Formatting a dateObject to date with time e.g. August 9, 2021, 8:23 AM
 * @param dateObj The date to convert
 * @param locale The users's locale settings
 * @returns month and day like "August 9, 2021, 8:23 AM"
 */
export const formatDateTime = (dateObj: Date, locale: FrontendLocaleData) =>
  formatDateTimeMem(locale).format(dateObj);

const formatDateTimeMem = (locale: FrontendLocaleData) =>
  new Intl.DateTimeFormat(locale.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: useAmPm(locale) ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: useAmPm(locale),
  });


/**
 * Formatting a dateObject to date with time e.g. August 9, 2021, 8:23:15 AM
 * @param dateObj The date to convert
 * @param locale The users's locale settings
 * @returns month and day like "August 9, 2021, 8:23:15 AM"
 */
export const formatDateTimeWithSeconds = (
  dateObj: Date,
  locale: FrontendLocaleData
) => formatDateTimeWithSecondsMem(locale).format(dateObj);

const formatDateTimeWithSecondsMem =
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: useAmPm(locale),
    });

/**
 * Formatting a Date to just date with AM/PM time e.g. 9/8/2021, 8:23 AM
 * @param dateObj The date to convert
 * @param locale The users's locale settings
 * @returns month and day like "9/8/2021, 8:23 AM"
 */
export const formatDateTimeNumeric = (
  dateObj: Date,
  locale: FrontendLocaleData
) => formatDateTimeNumericMem(locale).format(dateObj);

const formatDateTimeNumericMem =
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale),
    });