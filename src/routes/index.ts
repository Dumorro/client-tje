// src/routes/index.ts
import { Router } from 'express';
import autenticacaoRoutes from './autenticacaoRoutes';
import processosRoutes from './processosRoutes';

const router = Router();

router.use('/api', autenticacaoRoutes);
router.use('/api', processosRoutes);

export default router;