import { Router } from 'express';
import { runAudit } from '../controllers/audit.controller';

console.log('✅ audit.routes cargado');

const router = Router();


router.get('/api/audit', runAudit);


export default router;