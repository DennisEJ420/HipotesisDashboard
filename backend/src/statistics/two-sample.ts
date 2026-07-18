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

    const n1 = sampleA.length;
    const n2 = sampleB.length;
    const v1 = varianceA.result;
    const v2 = varianceB.result;

    // Error estándar individual de cada muestra para el reporte
    const individualSeA = Math.sqrt(v1 / n1);
    const individualSeB = Math.sqrt(v2 / n2);

    // Error estándar combinado (denominador de la prueba t para varianzas distintas)
    const standardErrorCombined = Math.sqrt((v1 / n1) + (v2 / n2));

    // Si la variabilidad combinada es 0 para evitar Infinity
    const safeSeCombined = standardErrorCombined === 0 ? 0.0001 : standardErrorCombined;

    const tValue = (meanA.result - meanB.result) / safeSeCombined;

    /* 
       CORRECCIÓN ESTADÍSTICA: Grados de libertad mediante la ecuación de Welch-Satterthwaite.
       Es obligatoria al calcular el SE unificado sin asumir varianzas iguales.
    */
    const numeratorDf = Math.pow((v1 / n1) + (v2 / n2), 2);
    const denominatorDf = (Math.pow(v1 / n1, 2) / (n1 - 1)) + (Math.pow(v2 / n2, 2) / (n2 - 1));
    const degreesOfFreedom = denominatorDf === 0 ? (n1 + n2 - 2) : Math.floor(numeratorDf / denominatorDf);

    const pValue = calculatePValue(
        tValue,
        degreesOfFreedom
    );

    return {
        sampleA: {
            sampleSize: n1,
            mean: meanA,
            variance: varianceA,
            standardDeviation: deviationA,
            standardError: {
                name: 'Error estándar',
                formula: 'SE = √(s²/n)',
                substitution: `√(${v1.toFixed(4)}/${n1})`,
                steps: [
                    `SE = ${individualSeA.toFixed(4)}`
                ],
                result: Number(individualSeA.toFixed(4))
            }
        },
        sampleB: {
            sampleSize: n2,
            mean: meanB,
            variance: varianceB,
            standardDeviation: deviationB,
            standardError: {
                name: 'Error estándar',
                formula: 'SE = √(s²/n)',
                substitution: `√(${v2.toFixed(4)}/${n2})`,
                steps: [
                    `SE = ${individualSeB.toFixed(4)}`
                ],
                result: Number(individualSeB.toFixed(4))
            }
        },
        pooledStandardError: {
            name: 'Error estándar combinado',
            formula: 'SE = √(s1²/n1 + s2²/n2)',
            substitution: `√(${v1.toFixed(4)}/${n1} + ${v2.toFixed(4)}/${n2})`,
            steps: [
                `SE = ${standardErrorCombined.toFixed(4)}`
            ],
            result: Number(standardErrorCombined.toFixed(4))
        },
        tStatistic: {
            name: 'Estadístico t',
            formula: 't = (x̄1 - x̄2) / SE',
            substitution: `(${meanA.result.toFixed(4)} - ${meanB.result.toFixed(4)}) / ${standardErrorCombined.toFixed(4)}`,
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