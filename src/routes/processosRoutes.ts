// src/routes/processosRoutes.ts
import { Router } from 'express';
import ProcessosController from '../controllers/processosController';
import TRT3ApiClient from '../services/trt3ApiClient';

const router = Router();
const apiClient = new TRT3ApiClient();
const processosController = new ProcessosController(apiClient);

router.get('/processos/perito', processosController.consultarProcessosPorPerito.bind(processosController));
router.get('/processos/:numeroProcesso', processosController.obterDetalhesProcesso.bind(processosController));
router.get('/processos/:numeroProcesso/citacoes', processosController.buscarCitacoesPeritoEmProcesso.bind(processosController));
router.get('/relatorios/processos-perito', processosController.exportarRelatorioProcessos.bind(processosController));

export default router;

