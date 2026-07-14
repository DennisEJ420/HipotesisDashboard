import { Request, Response } from 'express';

import {
    collectApiASamples,
    collectApiBSamples
} from '../services/sample.service';


export function runAudit(req: Request, res: Response) {

    const sampleSize = 50;

    const apiA = collectApiASamples(sampleSize);

    const apiB = collectApiBSamples(sampleSize);


    res.json({

        audit: {
            samples: sampleSize,
            timestamp: new Date()
        },

        apiA: {
            name: 'API A',
            data: apiA
        },

        apiB: {
            name: 'API B',
            data: apiB
        }

    });

}