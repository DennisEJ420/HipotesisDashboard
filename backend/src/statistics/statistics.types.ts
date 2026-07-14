export interface FormulaStep {

    name: string;

    formula: string;

    substitution: string;

    steps: string[];

    result: number;

}

export interface DescriptiveStatistics {

    sampleSize: number;

    mean: FormulaStep;

    variance: FormulaStep;

    standardDeviation: FormulaStep;

    standardError: FormulaStep;

}

export interface OneSampleResult {

    statistics: DescriptiveStatistics;

    tStatistic: FormulaStep;

    pValue: number;

    alpha: number;

    decision: string;

}

export interface TwoSampleResult {

    sampleA: DescriptiveStatistics;

    sampleB: DescriptiveStatistics;

    pooledStandardError: FormulaStep;

    tStatistic: FormulaStep;

    pValue: number;

    alpha: number;

    decision: string;

}