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



    const meanA = calculateMean(sampleA);

    const varianceA = calculateVariance(sampleA);

    const deviationA = calculateStandardDeviation(sampleA);



    const meanB = calculateMean(sampleB);

    const varianceB = calculateVariance(sampleB);

    const deviationB = calculateStandardDeviation(sampleB);



    const standardError = Math.sqrt(

        (varianceA.result / sampleA.length) +

        (varianceB.result / sampleB.length)

    );



    const tValue =

        (meanA.result - meanB.result)

        /

        standardError;



    const degreesOfFreedom =

        sampleA.length + sampleB.length - 2;



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

                substitution: `${varianceA.result}/${sampleA.length}`,

                steps: [

                    `SE = ${standardError.toFixed(4)}`

                ],

                result: Number(standardError.toFixed(4))

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

                substitution: `${varianceB.result}/${sampleB.length}`,

                steps: [

                    `SE = ${standardError.toFixed(4)}`

                ],

                result: Number(standardError.toFixed(4))

            }

        },


        pooledStandardError: {

            name: 'Error estándar combinado',

            formula: 'SE = √(s1²/n1 + s2²/n2)',

            substitution:

                `√(${varianceA.result}/${sampleA.length} + ${varianceB.result}/${sampleB.length})`,

            steps: [

                `SE = ${standardError.toFixed(4)}`

            ],

            result: Number(standardError.toFixed(4))

        },


        tStatistic: {

            name: 'Estadístico t',

            formula:

                't = (x̄1 - x̄2) / SE',

            substitution:

                `(${meanA.result} - ${meanB.result}) / ${standardError}`,

            steps: [

                `t = ${tValue.toFixed(4)}`

            ],

            result: Number(tValue.toFixed(4))

        },


        pValue,

        alpha,


        decision:

            pValue < alpha

                ? 'Se rechaza H0'

                : 'No se rechaza H0'


    };


}
