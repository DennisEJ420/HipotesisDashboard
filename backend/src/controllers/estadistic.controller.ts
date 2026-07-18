import { Request, Response } from 'express';


import {
    collectApiASamples,
    collectApiBSamples
} from '../services/sample.service';


import {
    runOneSampleTest
} from '../statistics/one-sample';


import {
    runTwoSampleTest
} from '../statistics/two-sample';



export function runStatisticalAudit(
    req: Request,
    res: Response
){
    const sampleSize = 40; //

    const apiA = collectApiASamples(sampleSize, 198, 10);
    const apiB = collectApiBSamples(sampleSize, 200, 10);

    const oneSampleA = runOneSampleTest(apiA, 200, 0.05);
    const twoSample = runTwoSampleTest(apiA, apiB, 0.05);



    res.json({

        samples:{
            size: sampleSize
        },


        apiA:{
            data: apiA,
            analysis: oneSampleA
        },


        apiB:{
            data: apiB
        },


        comparison:{
            analysis: twoSample
        },


        formulas:{
            description:[
                "Media: x̄ = Σx / n",
                "Varianza: s² = Σ(x-x̄)²/(n-1)",
                "Desviación estándar: s = √s²",
                "t-test: t=(x̄1-x̄2)/SE"
            ]
        }

    });


}