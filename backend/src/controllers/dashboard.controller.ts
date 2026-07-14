import { Request, Response } from 'express';


import {
    collectApiASamples,
    collectApiBSamples
} from '../services/sample.service';


import {
    runTwoSampleTest
} from '../statistics/two-sample';



export function getDashboardData(
    req: Request,
    res: Response
){

    const sampleSize = 50;


    const apiA =
        collectApiASamples(sampleSize);


    const apiB =
        collectApiBSamples(sampleSize);



    const analysis =
        runTwoSampleTest(
            apiA,
            apiB,
            0.05
        );



    res.json({

        chart: {

            apiA,

            apiB

        },


        cards: {

            meanA:
                analysis.sampleA.mean.result,


            meanB:
                analysis.sampleB.mean.result,


            difference:

                Number(
                    Math.abs(
                        analysis.sampleA.mean.result -
                        analysis.sampleB.mean.result
                    )
                    .toFixed(4)
                ),


            tStatistic:
                analysis.tStatistic.result,


            pValue:
                analysis.pValue,


            decision:
                analysis.decision

        },


        statistics: {

            apiA:
                analysis.sampleA,


            apiB:
                analysis.sampleB

        },


        formulas:[

            {
                name:'Media',
                formula:'x̄ = Σx / n'
            },

            {
                name:'Varianza',
                formula:'s² = Σ(x-x̄)²/(n-1)'
            },

            {
                name:'Desviación estándar',
                formula:'s = √s²'
            },

            {
                name:'Prueba t',
                formula:'t=(x̄1-x̄2)/SE'
            }

        ]


    });


}