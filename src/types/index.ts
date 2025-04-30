// src/types/index.ts

export interface AutenticacaoRequest {
    username: string;
    password: string;
  }
  
  export interface AutenticacaoResponse {
    token: string;
    expiresIn: number;
  }
  
  export interface FiltrosProcesso {
    dataInicio?: string;
    dataFim?: string;
    comarca?: string;
    situacao?: string;
    [key: string]: string | undefined;
  }
  
  export interface Processo {
    numero: string;
    vara: string;
    dataDistribuicao: string;
    situacao: string;
    assunto: string;
    [key: string]: any;
  }
  
  export interface DetalheProcesso {
    numero: string;
    valorCausa: number;
    dataDistribuicao: string;
    vara: string;
    comarca: string;
    juiz: string;
    situacao: string;
    classe: string;
    assunto: string;
    partes: Parte[];
    movimentacoes: Movimentacao[];
    [key: string]: any;
  }
  
  export interface Parte {
    nome: string;
    tipo: string; // 'AUTOR', 'REU', etc.
    advogados?: string[];
    [key: string]: any;
  }
  
  export interface Movimentacao {
    data: string;
    descricao: string;
    documento?: string;
    [key: string]: any;
  }
  
  export interface Citacao {
    data: string;
    tipo: string;
    documento: string;
    conteudo?: string;
    [key: string]: any;
  }
  
  export interface ExportarRelatorioRequest {
    perito: string;
    formato: 'pdf' | 'excel' | 'csv';
  }
  
  export type FormatoRelatorio = 'pdf' | 'excel' | 'csv';