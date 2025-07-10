import { LDMLPluralRule } from './plural-rules-types';
import { LocaleData } from './types';
export declare type NumberFormatNotation = 'standard' | 'scientific' | 'engineering' | 'compact';
export declare type NumberFormatRoundingType = 'significantDigits' | 'fractionDigits' | 'compactRounding';
export interface NumberFormatDigitOptions {
    minimumIntegerDigits?: number;
    minimumSignificantDigits?: number;
    maximumSignificantDigits?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}
export interface NumberFormatDigitInternalSlots {
    minimumIntegerDigits: number;
    minimumSignificantDigits?: number;
    maximumSignificantDigits?: number;
    roundingType: NumberFormatRoundingType;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: NumberFormatNotation;
}
export declare type RawNumberLocaleData = LocaleData<NumberFormatLocaleInternalData>;
export interface NumberFormatLocaleInternalData {
    units: UnitDataTable;
    currencies: Record<string, CurrencyData>;
    numbers: RawNumberData;
    nu: string[];
}
export interface UnitDataTable {
    simple: Record<string, UnitData>;
    compound: Record<string, CompoundUnitData>;
}
export interface UnitData {
    long: LDMLPluralRuleMap<string>;
    short: LDMLPluralRuleMap<string>;
    narrow: LDMLPluralRuleMap<string>;
    perUnit: Record<'narrow' | 'short' | 'long', string | undefined>;
}
export interface CompoundUnitData {
    long: string;
    short: string;
    narrow: string;
}
export interface CurrencyData {
    displayName: LDMLPluralRuleMap<string>;
    symbol: string;
    narrow: string;
}
export declare type DecimalFormatNum = '1000' | '10000' | '100000' | '1000000' | '10000000' | '100000000' | '1000000000' | '10000000000' | '100000000000' | '1000000000000' | '10000000000000' | '100000000000000';
export declare type NumberingSystem = string;
/**
 * We only care about insertBetween bc we assume
 * `currencyMatch` & `surroundingMatch` are all the same
 *
 * @export
 * @interface CurrencySpacingData
 */
export interface CurrencySpacingData {
    beforeInsertBetween: string;
    afterInsertBetween: string;
}
export interface RawCurrencyData {
    currencySpacing: CurrencySpacingData;
    standard: string;
    accounting: string;
    short?: Record<DecimalFormatNum, LDMLPluralRuleMap<string>>;
    unitPattern: string;
}
export interface SymbolsData {
    decimal: string;
    group: string;
    list: string;
    percentSign: string;
    plusSign: string;
    minusSign: string;
    exponential: string;
    superscriptingExponent: string;
    perMille: string;
    infinity: string;
    nan: string;
    timeSeparator: string;
}
export interface RawNumberData {
    nu: string[];
    symbols: Record<NumberingSystem, SymbolsData>;
    decimal: Record<NumberingSystem, {
        standard: string;
        long: Record<DecimalFormatNum, LDMLPluralRuleMap<string>>;
        short: Record<DecimalFormatNum, LDMLPluralRuleMap<string>>;
    }>;
    percent: Record<NumberingSystem, string>;
    currency: Record<NumberingSystem, RawCurrencyData>;
}
export declare type LDMLPluralRuleMap<T> = Omit<Partial<Record<LDMLPluralRule, T>>, 'other'> & {
    other: T;
};
export interface RawNumberFormatResult {
    formattedString: string;
    roundedNumber: number;
    integerDigitsCount: number;
}
//# sourceMappingURL=number-types.d.ts.map