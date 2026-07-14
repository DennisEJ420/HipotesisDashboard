import { Router } from 'express';

import {
    runHypothesis
} from '../controllers/hypothesis.controller';


const router = Router();


router.post(
    '/api/hypothesis',
    runHypothesis
);


export default router;