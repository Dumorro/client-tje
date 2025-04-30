import { Request, Response } from 'express';
import TRT3ApiClient from '../services/trt3ApiClient';
import { FiltrosProcesso, FormatoRelatorio } from '../types';

export default class ProcessosController {
  private apiClient: TRT3ApiClient;

  constructor(apiClient: TRT3ApiClient) {
    this.apiClient = apiClient;
  }

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
      
      if (!['pdf', 'excel', 'csv'].includes(formato)) {
        res.status(400).json({ 
          success: false, 
          message: 'Formato inválido. Utilize pdf, excel ou csv' 
        });
        return;
      }
      
      const relatorio = await this.apiClient.exportarRelatorioProcessos(perito, formato);
      
      const contentType = formato === 'pdf' 
        ? 'application/pdf' 
        : formato === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv';
      
      const buffer = Buffer.from(await relatorio.arrayBuffer());
      
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
