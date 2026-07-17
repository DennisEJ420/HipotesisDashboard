import {
    calculateMean,
    calculateVariance,
    calculateStandardDeviation
} from './formulas';

import {
    calculatePValue
} from './distribution';

import {
    TwoSampleResult
} from './statistics.types';

export function runTwoSampleTest(
    sampleA: number[],
    sampleB: number[],
    alpha: number
): TwoSampleResult {

    // 1. Control de seguridad por si entran arrays vacíos
    if (sampleA.length < 2 || sampleB.length < 2) {
        throw new Error("Ambas muestras deben tener al menos 2 elementos para calcular la varianza.");
    }

    const meanA = calculateMean(sampleA);
    const varianceA = calculateVariance(sampleA);
    const deviationA = calculateStandardDeviation(sampleA);

    const meanB = calculateMean(sampleB);
    const varianceB = calculateVariance(sampleB);
    const deviationB = calculateStandardDeviation(sampleB);

    // Error estándar individual de cada muestra para el reporte
    const individualSeA = Math.sqrt(varianceA.result / sampleA.length);
    const individualSeB = Math.sqrt(varianceB.result / sampleB.length);

    // Error estándar combinado (denominador de la prueba t)
    const standardErrorCombined = Math.sqrt(
        (varianceA.result / sampleA.length) +
        (varianceB.result / sampleB.length)
    );

    // Si la variabilidad combinada es 0 para evitar Infinity
    const safeSeCombined = standardErrorCombined === 0 ? 0.0001 : standardErrorCombined;

    const tValue = (meanA.result - meanB.result) / safeSeCombined;

    const degreesOfFreedom = sampleA.length + sampleB.length - 2;

    const pValue = calculatePValue(
        tValue,
        degreesOfFreedom
    );

    return {
        sampleA: {
            sampleSize: sampleA.length,
            mean: meanA,
            variance: varianceA,
            standardDeviation: deviationA,
            standardError: {
                name: 'Error estándar',
                formula: 'SE = √(s²/n)',
                substitution: `√(${varianceA.result}/${sampleA.length})`,
                steps: [
                    `SE = ${individualSeA.toFixed(4)}`
                ],
                result: Number(individualSeA.toFixed(4))
            }
        },
        sampleB: {
            sampleSize: sampleB.length,
            mean: meanB,
            variance: varianceB,
            standardDeviation: deviationB,
            standardError: {
                name: 'Error estándar',
                formula: 'SE = √(s²/n)',
                substitution: `√(${varianceB.result}/${sampleB.length})`,
                steps: [
                    `SE = ${individualSeB.toFixed(4)}`
                ],
                result: Number(individualSeB.toFixed(4))
            }
        },
        pooledStandardError: {
            name: 'Error estándar combinado',
            formula: 'SE = √(s1²/n1 + s2²/n2)',
            substitution:
                `√(${varianceA.result}/${sampleA.length} + ${varianceB.result}/${sampleB.length})`,
            steps: [
                `SE = ${standardErrorCombined.toFixed(4)}`
            ],
            result: Number(standardErrorCombined.toFixed(4))
        },
        tStatistic: {
            name: 'Estadístico t',
            formula: 't = (x̄1 - x̄2) / SE',
            substitution:
                `(${meanA.result} - ${meanB.result}) / ${standardErrorCombined.toFixed(4)}`,
            steps: [
                `t = ${tValue.toFixed(4)}`
            ],
            result: Number(tValue.toFixed(4))
        },
        pValue,
        alpha,
        decision: pValue < alpha ? 'Se rechaza H0' : 'No se rechaza H0'
    };
}