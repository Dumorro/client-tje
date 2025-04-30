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
