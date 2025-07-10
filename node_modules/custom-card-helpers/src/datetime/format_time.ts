//REF: https://github.com/home-assistant/frontend/blob/dev/src/common/datetime/format_time.ts

import { FrontendLocaleData } from "../types";
import { useAmPm } from "./use_am_pm";

/**
 * 9:15 PM or 21:15
 * @param dateObj The time to convert
 * @param locale  The users's locale settings
 * @returns Reformated time in hh:mm
 */
 export const formatTime = (dateObj: Date, locale: FrontendLocaleData) =>
 formatTimeMem(locale).format(dateObj);

 const formatTimeMem =
 (locale: FrontendLocaleData) =>
   new Intl.DateTimeFormat(locale.language, {
     hour: "numeric",
     minute: "2-digit",
     hour12: useAmPm(locale),
   });

/**
* 9:15:24 PM or 21:15:24
* @param dateObj The time to convert
* @param locale The users's locale settings
* @returns Reformated time in hh:mm:ss
*/
export const formatTimeWithSeconds = (
 dateObj: Date,
 locale: FrontendLocaleData
) => formatTimeWithSecondsMem(locale).format(dateObj);

const formatTimeWithSecondsMem =
 (locale: FrontendLocaleData) =>
   new Intl.DateTimeFormat(locale.language, {
     hour: useAmPm(locale) ? "numeric" : "2-digit",
     minute: "2-digit",
     second: "2-digit",
     hour12: useAmPm(locale),
   });

/**
* Tuesday 7:00 PM or Tuesday 19:00
* @param dateObj The datetime to convert
* @param locale The users's locale settings
* @returns Reformated weekday/time in dddd hh:mm
*/
export const formatTimeWeekday = (dateObj: Date, locale: FrontendLocaleData) =>
 formatTimeWeekdayMem(locale).format(dateObj);

const formatTimeWeekdayMem =
 (locale: FrontendLocaleData) =>
   new Intl.DateTimeFormat(locale.language, {
     hour: useAmPm(locale) ? "numeric" : "2-digit",
     minute: "2-digit",
     second: "2-digit",
     hour12: useAmPm(locale),
   }); 
