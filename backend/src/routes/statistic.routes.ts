import { Router } from 'express';


import {
    runStatisticalAudit
} from '../controllers/estadistic.controller';



const router = Router();



router.get(
    '/api/statistics',
    runStatisticalAudit
);



export default router;