import { LocaleData } from './types';
interface ResolveLocaleResult {
    locale: string;
    dataLocale: string;
    [k: string]: any;
}
export declare function createResolveLocale<K extends string, D extends {
    [k in K]: any;
}>(getDefaultLocale: () => string): (availableLocales: string[], requestedLocales: string[], options: {
    [k: string]: string;
    localeMatcher: string;
}, relevantExtensionKeys: K[], localeData: Record<string, D>) => ResolveLocaleResult;
export declare function getLocaleHierarchy(locale: string): string[];
export declare function supportedLocales(availableLocales: string[], requestedLocales: string[], options?: {
    localeMatcher?: 'best fit' | 'lookup';
}): string[];
declare class MissingLocaleDataError extends Error {
    type: string;
}
export declare function isMissingLocaleDataError(e: Error): e is MissingLocaleDataError;
export declare function unpackData<T extends Record<string, any>>(locale: string, localeData: LocaleData<T>, 
/** By default shallow merge the dictionaries. */
reducer?: (all: T, d: T) => T): T;
export {};
//# sourceMappingURL=resolve-locale.d.ts.map