export declare type Unit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export declare function selectUnit(from: Date | number, to?: Date | number, thresholds?: Partial<Thresholds>): {
    value: number;
    unit: Unit;
};
declare type Thresholds = Record<'second' | 'minute' | 'hour' | 'day', number>;
export declare const DEFAULT_THRESHOLDS: Thresholds;
export {};
//# sourceMappingURL=diff.d.ts.map