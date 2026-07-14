import { Router } from 'express';


import {
    getDashboardData
} from '../controllers/dashboard.controller';



const router = Router();



router.get(
    '/api/dashboard',
    getDashboardData
);



export default router;