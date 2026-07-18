import {
    calculateMean,
    calculateVariance,
    calculateStandardDeviation,
    calculateStandardError
} from './formulas';


import {
    calculatePValue
} from './distribution';


import {
    OneSampleResult
} from './statistics.types';



export function runOneSampleTest(
    data: number[],
    hypothesizedMean: number,
    alpha: number
): OneSampleResult {


    const mean = calculateMean(data);

    const variance = calculateVariance(data);

    const standardDeviation = calculateStandardDeviation(data);

    const standardError = calculateStandardError(data);



    const tValue =
        (mean.result - hypothesizedMean)
        /
        standardError.result;



    const degreesOfFreedom = data.length - 1;



    const pValue = calculatePValue(
        tValue,
        degreesOfFreedom
    );



    return {


        statistics: {

            sampleSize: data.length,

            mean,

            variance,

            standardDeviation,

            standardError

        },



        tStatistic: {

            name: 'Estadístico t',

            formula: 't = (x̄ - μ₀) / SE',

            substitution:
                `(${mean.result} - ${hypothesizedMean}) / ${standardError.result}`,

            steps: [

                `${mean.result - hypothesizedMean} / ${standardError.result}`,

                `t = ${tValue.toFixed(4)}`

            ],

            result: Number(tValue.toFixed(4))

        },



        pValue,

        alpha,


        decision:

            pValue < alpha

                ? 'Existen suficientes evidencias para Rechazar H0' //Sí se rechaza

                : 'No existen suficientes evidencias para Rechazar H0' //No se rechaza


    };

}