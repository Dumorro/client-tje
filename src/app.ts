// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import routes from './routes';

class App {
  public app: Express;
  
  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.setupRoutes();
    this.setupSwagger();
  }

  private configureMiddlewares(): void {
    // Segurança
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors());
    
    // Parsing do corpo das requisições
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    this.app.use(morgan('dev'));
  }

  private setupRoutes(): void {
    this.app.use(routes);
    
    // Rota básica para verificar se a API está funcionando
    this.app.get('/', (req, res) => {
      res.json({ message: 'API do Sistema de Consulta de Processos TRT3 está rodando' });
    });
    
    // Tratamento para rotas não encontradas
    this.app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Rota não encontrada' });
    });
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API de Consulta de Processos TRT3',
          version: '1.0.0',
          description: 'API para consulta de processos judiciais do TRT3 com foco em citações de peritos',
          contact: {
            name: 'Suporte',
            email: 'suporte@exemplo.com'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Servidor de desenvolvimento'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          },
          schemas: {
            Processo: {
              type: 'object',
              properties: {
                numero: { type: 'string' },
                vara: { type: 'string' },
                dataDistribuicao: { type: 'string', format: 'date' },
                situacao: { type: 'string' },
                assunto: { type: 'string' }
              }
            },
            DetalheProcesso: {
              type: 'object',
              properties: {
                numero: { type: 'string' },
                valorCausa: { type: 'number' },
                dataDistribuicao: { type: 'string', format: 'date' },
                vara: { type: 'string' },
                comarca: { type: 'string' },
                juiz: { type: 'string' },
                situacao: { type: 'string' },
                classe: { type: 'string' },
                assunto: { type: 'string' },
                partes: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Parte' }
                },
                movimentacoes: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Movimentacao' }
                }
              }
            },
            Parte: {
              type: 'object',
              properties: {
                nome: { type: 'string' },
                tipo: { type: 'string' },
                advogados: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            Movimentacao: {
              type: 'object',
              properties: {
                data: { type: 'string', format: 'date' },
                descricao: { type: 'string' },
                documento: { type: 'string' }
              }
            },
            Citacao: {
              type: 'object',
              properties: {
                data: { type: 'string', format: 'date' },
                tipo: { type: 'string' },
                documento: { type: 'string' },
                conteudo: { type: 'string' }
              }
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/controllers/*.ts', './src/routes/*.ts']
    };

    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }
}

export default new App().app;