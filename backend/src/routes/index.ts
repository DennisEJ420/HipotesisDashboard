import { Router } from 'express';

import apiRoutes from './api.routes';
import auditRoutes from './audit.routes';
import hypothesisRouter from './hypothesis.routes';
import statisticRoutes from './statistic.routes';
import dashboardRoutes from './dashboard.routes';


console.log('✅ index.routes cargado');


const router = Router();


router.use(apiRoutes);

router.use(auditRoutes);

router.use(hypothesisRouter);

router.use(statisticRoutes);

router.use(dashboardRoutes);



router.get('/', (req, res) => {

  res.json({
    message: 'Hypothesis Testing Backend',
    status: 'OK'
  });

});


export default router;