import { LocaleData } from './types';
export declare type LDMLPluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
export interface PluralRulesData {
    categories: {
        cardinal: string[];
        ordinal: string[];
    };
    fn: (val: number | string, ord?: boolean) => LDMLPluralRule;
}
export declare type PluralRulesLocaleData = LocaleData<PluralRulesData>;
//# sourceMappingURL=plural-rules-types.d.ts.map