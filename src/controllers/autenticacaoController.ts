// src/controllers/autenticacaoController.ts
import { Request, Response } from 'express';
import TRT3ApiClient from '../services/trt3ApiClient';
import { AutenticacaoRequest } from '../types';

export default class AutenticacaoController {
  private apiClient: TRT3ApiClient;

  constructor(apiClient: TRT3ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * @swagger
   * /api/autenticacao:
   *   post:
   *     summary: Autenticação na API do TRT3
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: Usuário para autenticação
   *               password:
   *                 type: string
   *                 description: Senha do usuário
   *             required:
   *               - username
   *               - password
   *     responses:
   *       200:
   *         description: Autenticação realizada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Autenticação realizada com sucesso
   *       401:
   *         description: Credenciais inválidas
   *       500:
   *         description: Erro interno do servidor
   */
  async autenticar(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as AutenticacaoRequest;
      
      if (!username || !password) {
        res.status(400).json({ 
          success: false, 
          message: 'Username e password são obrigatórios' 
        });
        return;
      }
      
      const autenticado = await this.apiClient.autenticar(username, password);
      
      if (autenticado) {
        res.status(200).json({ 
          success: true, 
          message: 'Autenticação realizada com sucesso' 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Credenciais inválidas' 
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: `Erro ao autenticar: ${error.message}` 
      });
    }
  }
}

// src/controllers/processosController.ts
import { Request, Response } from 'express';
import TRT3ApiClient from '../services/trt3ApiClient';
import { FiltrosProcesso, FormatoRelatorio } from '../types';

export default class ProcessosController {
  private apiClient: TRT3ApiClient;

  constructor(apiClient: TRT3ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * @swagger
   * /api/processos/perito:
   *   get:
   *     summary: Consulta processos em que um perito foi citado
   *     tags: [Processos]
   *     parameters:
   *       - in: query
   *         name: perito
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome completo ou CPF do perito
   *       - in: query
   *         name: dataInicio
   *         schema:
   *           type: string
   *           format: date
   *         description: Data inicial para filtro (YYYY-MM-DD)
   *       - in: query
   *         name: dataFim
   *         schema:
   *           type: string
   *           format: date
   *         description: Data final para filtro (YYYY-MM-DD)
   *       - in: query
   *         name: comarca
   *         schema:
   *           type: string
   *         description: Comarca para filtro
   *       - in: query
   *         name: situacao
   *         schema:
   *           type: string
   *         description: Situação do processo
   *     responses:
   *       200:
   *         description: Lista de processos encontrados
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Processo'
   *       401:
   *         description: Não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  async consultarProcessosPorPerito(req: Request, res: Response): Promise<void> {
    try {
      const { perito, ...filtros } = req.query as unknown as { 
        perito: string; 
      } & FiltrosProcesso;
      
      if (!perito) {
        res.status(400).json({ 
          success: false, 
          message: 'Nome ou CPF do perito é obrigatório' 
        });
        return;
      }
      
      const processos = await this.apiClient.consultarProcessosPorPerito(perito, filtros);
      
      res.status(200).json({
        success: true,
        data: processos
      });
    } catch (error: any) {
      if (error.message.includes('autenticar')) {
        res.status(401).json({ 
          success: false, 
          message: 'É necessário autenticar antes de consultar' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Erro ao consultar processos: ${error.message}` 
        });
      }
    }
  }

  /**
   * @swagger
   * /api/processos/{numeroProcesso}:
   *   get:
   *     summary: Obtém detalhes de um processo específico
   *     tags: [Processos]
   *     parameters:
   *       - in: path
   *         name: numeroProcesso
   *         schema:
   *           type: string
   *         required: true
   *         description: Número do processo no formato CNJ
   *     responses:
   *       200:
   *         description: Detalhes do processo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DetalheProcesso'
   *       401:
   *         description: Não autenticado
   *       404:
   *         description: Processo não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async obterDetalhesProcesso(req: Request, res: Response): Promise<void> {
    try {
      const { numeroProcesso } = req.params;
      
      if (!numeroProcesso) {
        res.status(400).json({ 
          success: false, 
          message: 'Número do processo é obrigatório' 
        });
        return;
      }
      
      const detalhes = await this.apiClient.obterDetalhesProcesso(numeroProcesso);
      
      res.status(200).json({
        success: true,
        data: detalhes
      });
    } catch (error: any) {
      if (error.message.includes('autenticar')) {
        res.status(401).json({ 
          success: false, 
          message: 'É necessário autenticar antes de consultar' 
        });
      } else if (error.message.includes('404')) {
        res.status(404).json({ 
          success: false, 
          message: 'Processo não encontrado' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Erro ao obter detalhes do processo: ${error.message}` 
        });
      }
    }
  }

  /**
   * @swagger
   * /api/processos/{numeroProcesso}/citacoes:
   *   get:
   *     summary: Busca citações do perito em um processo específico
   *     tags: [Processos]
   *     parameters:
   *       - in: path
   *         name: numeroProcesso
   *         schema:
   *           type: string
   *         required: true
   *         description: Número do processo
   *       - in: query
   *         name: perito
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome ou CPF do perito
   *     responses:
   *       200:
   *         description: Lista de citações encontradas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Citacao'
   *       401:
   *         description: Não autenticado
   *       404:
   *         description: Processo não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async buscarCitacoesPeritoEmProcesso(req: Request, res: Response): Promise<void> {
    try {
      const { numeroProcesso } = req.params;
      const { perito } = req.query as { perito: string };
      
      if (!numeroProcesso || !perito) {
        res.status(400).json({ 
          success: false, 
          message: 'Número do processo e nome/CPF do perito são obrigatórios' 
        });
        return;
      }
      
      const citacoes = await this.apiClient.buscarCitacoesPeritoEmProcesso(numeroProcesso, perito);
      
      res.status(200).json({
        success: true,
        data: citacoes
      });
    } catch (error: any) {
      if (error.message.includes('autenticar')) {
        res.status(401).json({ 
          success: false, 
          message: 'É necessário autenticar antes de consultar' 
        });
      } else if (error.message.includes('404')) {
        res.status(404).json({ 
          success: false, 
          message: 'Processo não encontrado' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Erro ao buscar citações: ${error.message}` 
        });
      }
    }
  }

  /**
   * @swagger
   * /api/relatorios/processos-perito:
   *   get:
   *     summary: Exporta relatório dos processos em que o perito foi citado
   *     tags: [Relatórios]
   *     parameters:
   *       - in: query
   *         name: perito
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome ou CPF do perito
   *       - in: query
   *         name: formato
   *         schema:
   *           type: string
   *           enum: [pdf, excel, csv]
   *         default: pdf
   *         description: Formato do relatório
   *     responses:
   *       200:
   *         description: Relatório gerado com sucesso
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   *           text/csv:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: Não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  async exportarRelatorioProcessos(req: Request, res: Response): Promise<void> {
    try {
      const { perito, formato = 'pdf' } = req.query as { 
        perito: string; 
        formato: FormatoRelatorio 
      };
      
      if (!perito) {
        res.status(400).json({ 
          success: false, 
          message: 'Nome ou CPF do perito é obrigatório' 
        });
        return;
      }
      
      // Verifica formato válido
      if (!['pdf', 'excel', 'csv'].includes(formato)) {
        res.status(400).json({ 
          success: false, 
          message: 'Formato inválido. Utilize pdf, excel ou csv' 
        });
        return;
      }
      
      const relatorio = await this.apiClient.exportarRelatorioProcessos(perito, formato);
      
      // Define o tipo de conteúdo baseado no formato
      const contentType = formato === 'pdf' 
        ? 'application/pdf' 
        : formato === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv';
      
      // Converte o Blob para Buffer para envio
      const buffer = Buffer.from(await relatorio.arrayBuffer());
      
      // Define cabeçalhos para download do arquivo
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-processos-${perito}.${formato}`);
      
      res.status(200).send(buffer);
    } catch (error: any) {
      if (error.message.includes('autenticar')) {
        res.status(401).json({ 
          success: false, 
          message: 'É necessário autenticar antes de exportar' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Erro ao exportar relatório: ${error.message}` 
        });
      }
    }
  }
}