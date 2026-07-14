import { Request, Response } from 'express';

import {
    generateApiAResponse,
    generateApiBResponse
} from '../services/simulation.service';


export function getApiA(req: Request, res: Response) {

    const responseTime = generateApiAResponse();

    res.json({
        api: 'A',
        responseTime,
        unit: 'ms'
    });

}


export function getApiB(req: Request, res: Response) {

    const responseTime = generateApiBResponse();

    res.json({
        api: 'B',
        responseTime,
        unit: 'ms'
    });

}