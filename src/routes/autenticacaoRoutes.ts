// src/routes/autenticacaoRoutes.ts
import { Router } from 'express';
import AutenticacaoController from '../controllers/autenticacaoController';
import TRT3ApiClient from '../services/trt3ApiClient';

const router = Router();
const apiClient = new TRT3ApiClient();
const autenticacaoController = new AutenticacaoController(apiClient);

router.post('/autenticacao', autenticacaoController.autenticar.bind(autenticacaoController));

export default router;