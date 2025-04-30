// TJR TRT3 API Client - Consulta de Processos por Perito
// Este código permite consultar processos em que um perito específico foi citado

class TRT3ApiClient {
    constructor(apiUrl = "https://api.trt3.jus.br/tjr/v1") {
      this.apiUrl = apiUrl;
      this.token = null;
    }
  
    /**
     * Realiza autenticação na API do TRT3
     * @param {string} username - Usuário para autenticação
     * @param {string} password - Senha do usuário
     * @returns {Promise<boolean>} - True se autenticado com sucesso
     */
    async autenticar(username, password) {
      try {
        const response = await fetch(`${this.apiUrl}/autenticacao`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });
  
        if (!response.ok) {
          throw new Error(`Erro na autenticação: ${response.status}`);
        }
  
        const data = await response.json();
        this.token = data.token;
        console.log("Autenticação realizada com sucesso");
        return true;
      } catch (error) {
        console.error("Falha na autenticação:", error.message);
        return false;
      }
    }
  
    /**
     * Consulta processos em que um perito específico foi citado
     * @param {string} nomePeritoOuCPF - Nome completo ou CPF do perito
     * @param {Object} filtros - Filtros adicionais para a consulta
     * @returns {Promise<Array>} - Lista de processos encontrados
     */
    async consultarProcessosPorPerito(nomePeritoOuCPF, filtros = {}) {
      if (!this.token) {
        throw new Error("É necessário autenticar antes de consultar");
      }
  
      try {
        // Prepara os parâmetros de consulta
        const params = new URLSearchParams({
          perito: nomePeritoOuCPF,
          ...filtros
        });
  
        const response = await fetch(`${this.apiUrl}/processos/perito?${params}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!response.ok) {
          throw new Error(`Erro na consulta: ${response.status}`);
        }
  
        const processos = await response.json();
        return processos;
      } catch (error) {
        console.error("Erro ao consultar processos:", error.message);
        throw error;
      }
    }
  
    /**
     * Obtém detalhes específicos de um processo
     * @param {string} numeroProcesso - Número do processo no formato CNJ
     * @returns {Promise<Object>} - Detalhes do processo
     */
    async obterDetalhesProcesso(numeroProcesso) {
      if (!this.token) {
        throw new Error("É necessário autenticar antes de consultar");
      }
  
      try {
        const response = await fetch(`${this.apiUrl}/processos/${numeroProcesso}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!response.ok) {
          throw new Error(`Erro ao obter detalhes: ${response.status}`);
        }
  
        const detalhes = await response.json();
        return detalhes;
      } catch (error) {
        console.error("Erro ao obter detalhes do processo:", error.message);
        throw error;
      }
    }
  
    /**
     * Busca citações específicas do perito em um processo
     * @param {string} numeroProcesso - Número do processo
     * @param {string} nomePeritoOuCPF - Nome ou CPF do perito
     * @returns {Promise<Array>} - Lista de citações encontradas
     */
    async buscarCitacoesPeritoEmProcesso(numeroProcesso, nomePeritoOuCPF) {
      if (!this.token) {
        throw new Error("É necessário autenticar antes de consultar");
      }
  
      try {
        const params = new URLSearchParams({
          perito: nomePeritoOuCPF
        });
  
        const response = await fetch(`${this.apiUrl}/processos/${numeroProcesso}/citacoes?${params}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!response.ok) {
          throw new Error(`Erro ao buscar citações: ${response.status}`);
        }
  
        const citacoes = await response.json();
        return citacoes;
      } catch (error) {
        console.error("Erro ao buscar citações do perito:", error.message);
        throw error;
      }
    }
  
    /**
     * Exporta relatório dos processos em que o perito foi citado
     * @param {string} nomePeritoOuCPF - Nome ou CPF do perito
     * @param {string} formato - Formato do relatório (pdf, excel, csv)
     * @returns {Promise<Blob>} - Arquivo do relatório
     */
    async exportarRelatorioProcessos(nomePeritoOuCPF, formato = "pdf") {
      if (!this.token) {
        throw new Error("É necessário autenticar antes de exportar");
      }
  
      try {
        const params = new URLSearchParams({
          perito: nomePeritoOuCPF,
          formato: formato
        });
  
        const response = await fetch(`${this.apiUrl}/relatorios/processos-perito?${params}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`Erro ao exportar relatório: ${response.status}`);
        }
  
        return await response.blob();
      } catch (error) {
        console.error("Erro ao exportar relatório:", error.message);
        throw error;
      }
    }
  }
  
  // Exemplo de uso
  async function exemploConsultaPerito() {
    const api = new TRT3ApiClient();
    
    try {
      // Autenticação
      const autenticado = await api.autenticar("usuario_exemplo", "senha_exemplo");
      
      if (!autenticado) {
        console.error("Não foi possível autenticar");
        return;
      }
      
      // Consulta de processos por perito
      const filtros = {
        dataInicio: "2023-01-01",
        dataFim: "2023-12-31",
        comarca: "Belo Horizonte",
        situacao: "Em andamento"
      };
      
      const processos = await api.consultarProcessosPorPerito("João Silva", filtros);
      console.log(`Encontrados ${processos.length} processos para o perito`);
      
      // Processa os resultados
      for (const processo of processos) {
        console.log(`Processo: ${processo.numero}`);
        console.log(`Vara: ${processo.vara}`);
        console.log(`Data de distribuição: ${processo.dataDistribuicao}`);
        
        // Obtém detalhes específicos do processo
        const detalhes = await api.obterDetalhesProcesso(processo.numero);
        console.log(`Valor da causa: ${detalhes.valorCausa}`);
        console.log(`Partes: ${detalhes.partes.map(p => p.nome).join(', ')}`);
        
        // Busca citações específicas do perito neste processo
        const citacoes = await api.buscarCitacoesPeritoEmProcesso(processo.numero, "João Silva");
        console.log(`O perito foi citado ${citacoes.length} vezes neste processo`);
        
        for (const citacao of citacoes) {
          console.log(`Data da citação: ${citacao.data}`);
          console.log(`Tipo: ${citacao.tipo}`);
          console.log(`Documento: ${citacao.documento}`);
        }
        
        console.log("------------------------");
      }
      
      // Exporta relatório
      const relatorio = await api.exportarRelatorioProcessos("João Silva", "pdf");
      console.log(`Relatório gerado com ${relatorio.size} bytes`);
      
    } catch (error) {
      console.error("Erro na execução:", error.message);
    }
  }
  
  // Executa o exemplo
  // exemploConsultaPerito();
  
  // Exportação do cliente para uso em outros módulos
  export default TRT3ApiClient;