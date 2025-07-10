import { NumberFormatDigitInternalSlots, NumberFormatDigitOptions, NumberFormatNotation, RawNumberFormatResult } from './number-types';
export declare function hasOwnProperty(o: unknown, key: string): boolean;
/**
 * https://tc39.es/ecma262/#sec-toobject
 * @param arg
 */
export declare function toObject<T>(arg: T): T extends null ? never : T extends undefined ? never : T;
/**
 * https://tc39.es/ecma262/#sec-tostring
 */
export declare function toString(o: unknown): string;
/**
 * https://tc39.es/ecma402/#sec-getoption
 * @param opts
 * @param prop
 * @param type
 * @param values
 * @param fallback
 */
export declare function getOption<T extends object, K extends keyof T, F>(opts: T, prop: K, type: 'string' | 'boolean', values: T[K][] | undefined, fallback: F): Exclude<T[K], undefined> | F;
/**
 * https://tc39.es/ecma402/#sec-defaultnumberoption
 * @param val
 * @param min
 * @param max
 * @param fallback
 */
export declare function defaultNumberOption(val: any, min: number, max: number, fallback: number): number;
/**
 * https://tc39.es/ecma402/#sec-getnumberoption
 * @param options
 * @param property
 * @param min
 * @param max
 * @param fallback
 */
export declare function getNumberOption<T extends object, K extends keyof T>(options: T, property: K, minimum: number, maximum: number, fallback: number): number;
export declare function setInternalSlot<Instance extends object, Internal extends object, Field extends keyof Internal>(map: WeakMap<Instance, Internal>, pl: Instance, field: Field, value: NonNullable<Internal>[Field]): void;
export declare function setMultiInternalSlots<Instance extends object, Internal extends object, K extends keyof Internal>(map: WeakMap<Instance, Internal>, pl: Instance, props: Pick<NonNullable<Internal>, K>): void;
export declare function getInternalSlot<Instance extends object, Internal extends object, Field extends keyof Internal>(map: WeakMap<Instance, Internal>, pl: Instance, field: Field): Internal[Field];
export declare function getMultiInternalSlots<Instance extends object, Internal extends object, Field extends keyof Internal>(map: WeakMap<Instance, Internal>, pl: Instance, ...fields: Field[]): Pick<Internal, Field>;
export interface LiteralPart {
    type: 'literal';
    value: string;
}
export declare function isLiteralPart(patternPart: LiteralPart | {
    type: string;
    value?: string;
}): patternPart is LiteralPart;
export declare function partitionPattern(pattern: string): ({
    type: string;
    value: string;
} | {
    type: string;
    value: undefined;
})[];
/**
 * https://tc39.es/ecma402/#sec-setnfdigitoptions
 */
export declare function setNumberFormatDigitOptions(internalSlots: NumberFormatDigitInternalSlots, opts: NumberFormatDigitOptions, mnfdDefault: number, mxfdDefault: number, notation: NumberFormatNotation): void;
export declare function objectIs(x: any, y: any): boolean;
/**
 * https://tc39.es/ecma402/#sec-iswellformedcurrencycode
 */
export declare function isWellFormedCurrencyCode(currency: string): boolean;
/**
 * https://tc39.es/ecma402/#sec-formatnumberstring
 * TODO: dedup with intl-pluralrules
 */
export declare function formatNumericToString(internalSlots: Pick<NumberFormatDigitInternalSlots, 'roundingType' | 'minimumSignificantDigits' | 'maximumSignificantDigits' | 'minimumIntegerDigits' | 'minimumFractionDigits' | 'maximumFractionDigits'>, x: number): {
    roundedNumber: number;
    formattedString: string;
};
/**
 * TODO: dedup with intl-pluralrules and support BigInt
 * https://tc39.es/ecma402/#sec-torawfixed
 * @param x a finite non-negative Number or BigInt
 * @param minFraction and integer between 0 and 20
 * @param maxFraction and integer between 0 and 20
 */
export declare function toRawFixed(x: number, minFraction: number, maxFraction: number): RawNumberFormatResult;
export declare function toRawPrecision(x: number, minPrecision: number, maxPrecision: number): RawNumberFormatResult;
export declare function repeat(s: string, times: number): string;
/**
 * Cannot do Math.log(x) / Math.log(10) bc if IEEE floating point issue
 * @param x number
 */
export declare function getMagnitude(x: number): number;
/**
 * https://tc39.es/ecma402/#sec-iswellformedunitidentifier
 * @param unit
 */
export declare function isWellFormedUnitIdentifier(unit: string): boolean;
export declare function defineProperty<T extends object>(target: T, name: string | symbol, { value }: {
    value: any;
} & ThisType<any>): void;
//# sourceMappingURL=polyfill-utils.d.ts.map