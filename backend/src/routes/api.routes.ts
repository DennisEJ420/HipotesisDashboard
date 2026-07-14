import { Router } from 'express';

import {
  getApiA,
  getApiB
} from '../controllers/api.controller';


const router = Router();


router.get('/api/a', getApiA);

router.get('/api/b', getApiB);


export default router;