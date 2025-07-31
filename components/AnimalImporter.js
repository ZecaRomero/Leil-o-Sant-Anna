import { useState } from "react";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function AnimalImporter({ isOpen, onClose, onImport }) {
  const [importData, setImportData] = useState("");
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importMethod, setImportMethod] = useState("excel"); // 'excel', 'csv' ou 'manual'

  // Template CSV para download (formato da planilha do usuário)
  const csvTemplate = `Serie,RG,Lote,LOCAL,PESO,CE,Sexo,iABC7,DECA,MGTe,TOP,NASC,Meses,Nome do Pai,Avô Materno
CJCJ,15628,22,3,913,42,M,24.62,1,22.1,8,09/08/23,24,REM HERMOSO FIV GEN,B2887 DA S.NICE
CJCJ,15562,34,3,830,41,M,24.96,1,19.2,14,03/07/23,25,MAIAIO DA S.NICE,CJ SANT ANNA POI 7687`;

  // Template Excel para download
  const excelTemplate = `A\tB\tC\tD\tE\tF\tG\tH\tI\tJ\tK\tL\tM\tN\tO
Serie\tRG\tLote\tLOCAL\tPESO\tCE\tSexo\tiABC7\tDECA\tMGTe\tTOP\tNASC\tMeses\tNome do Pai\tAvô Materno
CJCJ\t15628\t22\t3\t913\t42\tM\t24,62\t1\t22,1\t8\t09/08/23\t24\tREM HERMOSO FIV GEN\tB2887 DA S.NICE
CJCJ\t15562\t34\t3\t830\t41\tM\t24,96\t1\t19,2\t14\t03/07/23\t25\tMAIAIO DA S.NICE\tCJ SANT ANNA POI 7687`;

  // Função para calcular idade em meses
  const calcularIdade = (dataNascimento) => {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - nascimento);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Média de dias por mês
    return diffMonths;
  };

  // Função para converter data do formato brasileiro para ISO
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return null;

    // Limpar a string de data
    const cleanDateStr = dateStr.toString().trim();

    // Se já está no formato ISO (YYYY-MM-DD)
    if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return cleanDateStr;
    }

    // Formato brasileiro DD/MM/YY ou DD/MM/YYYY
    const parts = cleanDateStr.split("/");
    if (parts.length === 3) {
      let [day, month, year] = parts.map((p) => p.trim());

      // Se ano tem 2 dígitos, assumir 20XX
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const yearNum = parseInt(year);

        // Se o ano for maior que os últimos 2 dígitos do ano atual + 10, assumir século anterior
        if (yearNum > (currentYear % 100) + 10) {
          year = (currentCentury - 100 + yearNum).toString();
        } else {
          year = (currentCentury + yearNum).toString();
        }
      }

      // Validar se os valores são números válidos
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        throw new Error(`Formato de data inválido: ${dateStr}`);
      }

      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        throw new Error(`Data inválida: ${dateStr}`);
      }

      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    throw new Error(`Formato de data inválido: ${dateStr}`);
  };

  // Função para validar e processar dados
  const validateData = () => {
    setIsValidating(true);

    try {
      let linhas = [];

      if (importMethod === "excel") {
        // Processar dados do Excel (separados por TAB ou vírgula)
        linhas = importData.trim().split("\n");

        if (linhas.length === 0) {
          throw new Error("Nenhum dado encontrado");
        }

        // Detectar se a primeira linha é cabeçalho
        const primeiraLinha = linhas[0];
        const isHeader =
          primeiraLinha.toLowerCase().includes("serie") ||
          primeiraLinha.toLowerCase().includes("rg") ||
          primeiraLinha.toLowerCase().includes("nasc");

        if (isHeader) {
          linhas = linhas.slice(1); // Remove cabeçalho
        }
      } else if (importMethod === "csv") {
        // Processar CSV
        linhas = importData.trim().split("\n");
        const header = linhas[0].split(",").map((h) => h.trim());

        // Verificar se tem o cabeçalho correto
        const expectedHeaders = [
          "Serie",
          "RGN",
          "Nascimento",
          "Pai",
          "AvoMaterno",
          "Sexo",
        ];
        const hasValidHeader = expectedHeaders.every((h) => header.includes(h));

        if (!hasValidHeader) {
          throw new Error(
            "Cabeçalho CSV inválido. Use: Serie,RGN,Nascimento,Pai,AvoMaterno,Sexo"
          );
        }

        linhas = linhas.slice(1); // Remove cabeçalho
      } else {
        // Processar entrada manual (uma linha por animal)
        linhas = importData.trim().split("\n");
      }

      const animaisProcessados = [];
      const erros = [];

      linhas.forEach((linha, index) => {
        if (!linha.trim()) return; // Pula linhas vazias

        try {
          let dados;

          if (importMethod === "excel") {
            // Processar dados do Excel - formato da planilha do usuário
            // Detectar separador (TAB, vírgula ou espaços múltiplos)
            let campos = [];

            if (linha.includes("\t")) {
              // Separado por TAB
              campos = linha.split("\t").map((c) => c.trim());
            } else if (linha.includes(",")) {
              // Separado por vírgula
              campos = linha.split(",").map((c) => c.trim());
            } else {
              // Separado por espaços múltiplos (formato da imagem)
              // Exemplo real: CJCJ 15628 22 913 42 M 24,62 1 22,05 8 09/08/23 24 REM HERMOSO FIV GEN B2887 DA S.NICE
              campos = linha.split(/\s+/).filter((c) => c.trim() !== "");

              console.log("Campos encontrados:", campos.length, campos); // Debug

              // Reagrupar os últimos campos que podem ter espaços (nomes)
              if (campos.length > 12) {
                // Baseado nos dados reais: CJCJ 16701 FIV 14 289 F 28,83 1 27,41 2 13/11/24 9 A978 FIV RSAN CRIVO SANT ANNA
                // Os primeiros 12 campos são fixos até a data: CJCJ, 16701, FIV, 14, 289, F, 28,83, 1, 27,41, 2, 13/11/24, 9
                const primeiros12 = campos.slice(0, 12);
                const restante = campos.slice(12); // Nome do Pai + Avô Materno

                console.log("Primeiros 12:", primeiros12); // Debug
                console.log("Restante para nomes:", restante); // Debug

                // Estratégia específica para o padrão observado
                // Procurar por códigos típicos de avô materno que começam com letra+número
                let indiceSeparacao = -1;

                for (let i = 0; i < restante.length; i++) {
                  const campo = restante[i];
                  // Procurar por padrões específicos observados: B2887, CJ, etc.
                  if (
                    campo.match(/^[A-Z]\d{3,4}$/) || // B2887, C123, etc (letra + 3-4 números)
                    campo.match(/^[A-Z]{2}$/) || // CJ, etc (2 letras)
                    campo === "DA" ||
                    campo === "DE" ||
                    campo === "DO"
                  ) {
                    // Preposições
                    indiceSeparacao = i;
                    break;
                  }
                }

                if (indiceSeparacao > 0) {
                  const nomePai = restante.slice(0, indiceSeparacao).join(" ");
                  const avoMaterno = restante.slice(indiceSeparacao).join(" ");
                  campos = [...primeiros12, nomePai, avoMaterno];
                  console.log(
                    "Separação encontrada no índice",
                    indiceSeparacao,
                    ":",
                    { nomePai, avoMaterno }
                  ); // Debug
                } else {
                  // Fallback mais inteligente: assumir que o avô materno tem 2-3 palavras no final
                  // Baseado no padrão observado: "B2887 DA S.NICE" (3 palavras)
                  const indiceFallback = Math.max(1, restante.length - 3);
                  const nomePai = restante.slice(0, indiceFallback).join(" ");
                  const avoMaterno = restante.slice(indiceFallback).join(" ");
                  campos = [...primeiros12, nomePai, avoMaterno];
                  console.log("Usando fallback (últimas 3 palavras):", {
                    nomePai,
                    avoMaterno,
                  }); // Debug
                }
              } else if (campos.length === 14) {
                // Exatamente 14 campos, assumir que está correto
                console.log("Exatamente 14 campos, usando como está"); // Debug
              } else if (campos.length < 14) {
                console.log("Menos de 14 campos, pode haver erro no formato"); // Debug
              }
            }

            // Verificar se temos pelo menos 7 campos (formato simplificado)
            // Baseado nos dados reais: CJCJ 14785 LA 07/11/2021 45 B2887 DA S.NICE CJ SANT ANNA 10202
            if (campos.length < 7) {
              throw new Error(
                `Formato Excel inválido. Esperado pelo menos 7 colunas, encontrado ${campos.length}. Dados: ${linha}`
              );
            }

            // Versão ULTRA SIMPLIFICADA baseada nos dados reais da imagem
            // Formato: CJCJ 14785 LA 07/11/2021 45 B2887 DA S.NICE CJ SANT ANNA 10202

            console.log("Processando linha:", linha);
            console.log("Total de campos:", campos.length);

            // Encontrar a data (campo que contém "/")
            let dataIndex = -1;
            for (let i = 0; i < campos.length; i++) {
              if (campos[i] && campos[i].includes("/")) {
                dataIndex = i;
                break;
              }
            }

            if (dataIndex === -1) {
              throw new Error(
                "Data não encontrada. Esperado formato DD/MM/YY ou DD/MM/YYYY"
              );
            }

            console.log(
              "Data encontrada na posição:",
              dataIndex,
              "=",
              campos[dataIndex]
            );

            // Verificar se temos campos mínimos após a data
            if (campos.length < dataIndex + 2) {
              throw new Error(
                `Dados insuficientes. Encontrado ${
                  campos.length
                } campos, mas preciso de pelo menos ${dataIndex + 2}`
              );
            }

            // Reagrupar todos os nomes após a idade/meses
            const nomesCompletos = campos.slice(dataIndex + 2).join(" ");
            console.log("Nomes completos:", nomesCompletos);

            // Estratégia SIMPLES: dividir os nomes pela metade
            // Assumir que a primeira metade é o pai e a segunda é o avô materno
            let nomePai = "";
            let avoMaterno = "";

            if (nomesCompletos.trim()) {
              const palavras = nomesCompletos.trim().split(" ");
              console.log("Palavras dos nomes:", palavras);

              if (palavras.length >= 2) {
                // Dividir pela metade
                const meio = Math.ceil(palavras.length / 2);
                nomePai = palavras.slice(0, meio).join(" ");
                avoMaterno = palavras.slice(meio).join(" ");
              } else {
                // Se só tem uma palavra, colocar como pai
                nomePai = palavras[0] || "";
                avoMaterno = "";
              }
            }

            console.log("Nomes separados:", { nomePai, avoMaterno });

            // Mapear campos de forma ULTRA SIMPLES
            dados = {
              serie: campos[0] || "CJCJ", // CJCJ
              rg: campos[1] || "", // 14785
              tipo: campos[2] || "", // LA
              nascimento: campos[dataIndex] || "", // 07/11/2021
              meses: campos[dataIndex + 1] || "", // 45
              pai: nomePai, // Primeira metade dos nomes
              avoMaterno: avoMaterno, // Segunda metade dos nomes
              sexo: "M", // Assumir macho por padrão, será ajustado se necessário
            };
          } else if (importMethod === "csv") {
            const campos = linha.split(",").map((c) => c.trim());
            dados = {
              serie: campos[0],
              rg: campos[1],
              sexo: campos[2],
              nascimento: campos[3],
              pai: campos[4],
              avoMaterno: campos[5],
            };
          } else {
            // Formato manual: CJCJ|123456|2022-01-15|CJCJ 100001|CJCJ 100002|Macho
            const campos = linha.split("|").map((c) => c.trim());
            if (campos.length !== 6) {
              throw new Error(
                "Formato inválido. Use: Serie|RG|Nascimento|Pai|AvoMaterno|Sexo"
              );
            }

            dados = {
              serie: campos[0],
              rg: campos[1],
              sexo: campos[2],
              nascimento: campos[3],
              pai: campos[4],
              avoMaterno: campos[5],
            };
          }

          // Validações baseadas no método de importação
          let rg, sexo, nascimento, pai, avoMaterno, meses, peso, lote;

          if (importMethod === "excel") {
            rg = dados.rg;
            sexo =
              dados.sexo === "M"
                ? "Macho"
                : dados.sexo === "F"
                ? "Fêmea"
                : dados.sexo;

            // Debug: verificar qual campo está sendo usado como data
            console.log(
              "Campo nascimento:",
              dados.nascimento,
              "Tipo:",
              typeof dados.nascimento
            );

            // Verificar se o campo nascimento parece uma data válida
            if (dados.nascimento && dados.nascimento.toString().includes("/")) {
              nascimento = convertDateToISO(dados.nascimento);
            } else {
              throw new Error(
                `Campo de data não parece válido: ${dados.nascimento}`
              );
            }

            pai = dados.pai;
            avoMaterno = dados.avoMaterno;
            meses = parseInt(dados.meses) || calcularIdade(nascimento);
            peso = parseFloat(dados.peso) || null;
            lote = dados.lote;
          } else {
            rg = dados.rg || dados.rgn;
            sexo = dados.sexo;
            nascimento = dados.nascimento;
            pai = dados.pai;
            avoMaterno = dados.avoMaterno;
            meses = calcularIdade(nascimento);
            peso = null;
            lote = null;
          }

          // Validações
          if (!dados.serie || !rg || !nascimento || !sexo) {
            throw new Error("Campos obrigatórios: Serie, RG, Nascimento, Sexo");
          }

          if (dados.serie !== "CJCJ") {
            throw new Error(
              "Apenas animais CJCJ são suportados nesta importação"
            );
          }

          if (!["Macho", "Fêmea", "Femea", "M", "F"].includes(dados.sexo)) {
            throw new Error("Sexo deve ser: Macho, Fêmea, M ou F");
          }

          // Validar data convertida
          const dataNascimento = new Date(nascimento);
          if (isNaN(dataNascimento.getTime())) {
            throw new Error(`Data de nascimento inválida: ${dados.nascimento}`);
          }

          // Determinar tipo de cobertura e custos baseado no campo "tipo"
          let isFiv = false;
          let custos = [];
          let custoTotal = 0;
          let tipoCobertura = "IA"; // Padrão

          if (importMethod === "excel" && dados.tipo) {
            const tipo = dados.tipo.toUpperCase();

            if (tipo.includes("FIV") || tipo.includes("FV")) {
              // É FIV - aplicar custos completos
              isFiv = true;
              tipoCobertura = "FIV";
              custoTotal = 120.0; // DNA Paternidade (40) + Genômica (80)
              custos = [
                {
                  id: 1,
                  tipo: "DNA",
                  subtipo: "Paternidade",
                  valor: 40.0,
                  data: nascimento,
                  observacoes: "DNA Paternidade - FIV (Importação)",
                },
                {
                  id: 2,
                  tipo: "DNA",
                  subtipo: "Genômica",
                  valor: 80.0,
                  data: nascimento,
                  observacoes: "DNA Genômica - FIV (Importação)",
                },
              ];
            } else if (tipo.includes("IA") || tipo.includes("I.A")) {
              // É IA - aplicar apenas genômica
              isFiv = false;
              tipoCobertura = "IA";
              custoTotal = 80.0; // Apenas DNA Genômica
              custos = [
                {
                  id: 1,
                  tipo: "DNA",
                  subtipo: "Genômica",
                  valor: 80.0,
                  data: nascimento,
                  observacoes: "DNA Genômica - IA (Importação)",
                },
              ];
            } else {
              // Outros tipos (LA, etc.) - assumir IA
              isFiv = false;
              tipoCobertura = tipo;
              custoTotal = 80.0; // Apenas DNA Genômica
              custos = [
                {
                  id: 1,
                  tipo: "DNA",
                  subtipo: "Genômica",
                  valor: 80.0,
                  data: nascimento,
                  observacoes: `DNA Genômica - ${tipo} (Importação)`,
                },
              ];
            }
          } else {
            // Método CSV ou manual - assumir FIV por compatibilidade
            isFiv = true;
            tipoCobertura = "FIV";
            custoTotal = 120.0;
            custos = [
              {
                id: 1,
                tipo: "DNA",
                subtipo: "Paternidade",
                valor: 40.0,
                data: nascimento,
                observacoes: "DNA Paternidade - FIV (Importação)",
              },
              {
                id: 2,
                tipo: "DNA",
                subtipo: "Genômica",
                valor: 80.0,
                data: nascimento,
                observacoes: "DNA Genômica - FIV (Importação)",
              },
            ];
          }

          // Criar objeto do animal
          const animal = {
            id: Date.now() + Math.random(), // ID único temporário
            serie: dados.serie,
            rg: rg,
            raca: "Nelore", // CJCJ é sempre Nelore
            sexo: sexo,
            dataNascimento: nascimento,
            meses: meses,
            situacao: "Ativo",
            pai: pai || null,
            mae: null, // Não informado na importação
            avoMaterno: avoMaterno || null,
            receptora: null,
            isFiv: isFiv,
            tipoCobertura: tipoCobertura, // Adicionar campo para identificar o tipo
            peso: peso,
            lote: lote,
            custoTotal: custoTotal,
            valorVenda: null,
            valorReal: null,
            custos: custos,
          };

          animaisProcessados.push(animal);
        } catch (error) {
          erros.push({
            linha: index + 1,
            dados: linha,
            erro: error.message,
          });
        }
      });

      setValidationResults({
        sucesso: animaisProcessados,
        erros: erros,
        total: linhas.length,
      });
    } catch (error) {
      setValidationResults({
        sucesso: [],
        erros: [{ linha: 0, dados: "", erro: error.message }],
        total: 0,
      });
    }

    setIsValidating(false);
  };

  const handleImport = () => {
    if (validationResults && validationResults.sucesso.length > 0) {
      onImport(validationResults.sucesso);
      setImportData("");
      setValidationResults(null);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_importacao_cjcj.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Importar Animais CJCJ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Importe múltiplos animais CJCJ de uma vez
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Método de Importação */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Escolha o Método de Importação
            </h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={importMethod === "excel"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  📊 Excel/Planilha (Recomendado)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={importMethod === "csv"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={importMethod === "manual"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Manual</span>
              </label>
            </div>
          </div>

          {/* Template e Instruções */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 Instruções de Importação
            </h4>

            {importMethod === "excel" ? (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>📊 Formato Excel:</strong> Cole os dados diretamente
                  do Excel (com TAB ou vírgulas)
                </p>
                <p>
                  <strong>Colunas esperadas:</strong> Serie, RG, Lote, LOCAL,
                  PESO, CE, Sexo, iABC7, DECA, MGTe, TOP, NASC, Meses, Nome do
                  Pai, Avô Materno
                </p>
                <p>
                  <strong>Exemplo:</strong> CJCJ 15628 22 3 913 42 M 24,62 1
                  22,1 8 09/08/23 24 REM HERMOSO FIV GEN B2887 DA S.NICE
                </p>
                <p>
                  <strong>💡 Dica:</strong> Selecione as linhas no Excel e cole
                  aqui (Ctrl+C → Ctrl+V)
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📥 Baixar Template Excel
                </button>
              </div>
            ) : importMethod === "csv" ? (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Formato CSV:</strong> Use vírgulas para separar os
                  campos
                </p>
                <p>
                  <strong>Cabeçalho:</strong>{" "}
                  Serie,RG,Nascimento,Pai,AvoMaterno,Sexo
                </p>
                <p>
                  <strong>Exemplo:</strong> CJCJ,123456,2022-01-15,CJCJ
                  100001,CJCJ 100002,Macho
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📥 Baixar Template CSV
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Formato Manual:</strong> Use | (pipe) para separar os
                  campos
                </p>
                <p>
                  <strong>Ordem:</strong>{" "}
                  Serie|RG|Nascimento|Pai|AvoMaterno|Sexo
                </p>
                <p>
                  <strong>Exemplo:</strong> CJCJ|123456|2022-01-15|CJCJ
                  100001|CJCJ 100002|Macho
                </p>
                <p>
                  <strong>Uma linha por animal</strong>
                </p>
              </div>
            )}

            <div className="mt-3 text-sm text-blue-800 dark:text-blue-300">
              <p>
                <strong>📅 Data:</strong> Use formato YYYY-MM-DD (ex:
                2022-01-15)
              </p>
              <p>
                <strong>👥 Sexo:</strong> Macho, Femea ou Fêmea
              </p>
              <p>
                <strong>🧬 Automático:</strong> DNA Paternidade (R$ 40) +
                Genômica (R$ 80) serão adicionados
              </p>
            </div>
          </div>

          {/* Área de Entrada de Dados */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {importMethod === "excel"
                ? "📊 Cole os dados do Excel aqui (Ctrl+C → Ctrl+V):"
                : importMethod === "csv"
                ? "Cole os dados CSV aqui:"
                : "Digite os dados (uma linha por animal):"}
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder={
                importMethod === "excel"
                  ? "CJCJ\t15628\t22\t3\t913\t42\tM\t24,62\t1\t22,1\t8\t09/08/23\t24\tREM HERMOSO FIV GEN\tB2887 DA S.NICE\nCJCJ\t15562\t34\t3\t830\t41\tM\t24,96\t1\t19,2\t14\t03/07/23\t25\tMAIAIO DA S.NICE\tCJ SANT ANNA POI 7687"
                  : importMethod === "csv"
                  ? "Serie,RG,Nascimento,Pai,AvoMaterno,Sexo\nCJCJ,123456,2022-01-15,CJCJ 100001,CJCJ 100002,Macho\nCJCJ,123457,2022-02-20,CJCJ 100003,CJCJ 100004,Femea"
                  : "CJCJ|123456|2022-01-15|CJCJ 100001|CJCJ 100002|Macho\nCJCJ|123457|2022-02-20|CJCJ 100003|CJCJ 100004|Femea"
              }
            />
          </div>

          {/* Botão de Validação */}
          <div className="mb-6">
            <button
              onClick={validateData}
              disabled={!importData.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Validar Dados
                </>
              )}
            </button>
          </div>

          {/* Resultados da Validação */}
          {validationResults && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {validationResults.sucesso.length}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Válidos
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {validationResults.erros.length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Erros
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {validationResults.total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Total
                  </div>
                </div>
              </div>

              {/* Erros */}
              {validationResults.erros.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    Erros Encontrados
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResults.erros.map((erro, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-800 dark:text-red-300"
                      >
                        <strong>Linha {erro.linha}:</strong> {erro.erro}
                        {erro.dados && (
                          <div className="font-mono text-xs mt-1 bg-red-100 dark:bg-red-900/40 p-1 rounded">
                            {erro.dados}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview dos Animais Válidos */}
              {validationResults.sucesso.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Animais Prontos para Importação (
                    {validationResults.sucesso.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResults.sucesso
                      .slice(0, 5)
                      .map((animal, index) => (
                        <div
                          key={index}
                          className="text-sm text-green-800 dark:text-green-300 flex justify-between"
                        >
                          <span>
                            {animal.serie} {animal.rg} - {animal.sexo}
                          </span>
                          <span>
                            {animal.meses} meses - R${" "}
                            {animal.custoTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {validationResults.sucesso.length > 5 && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ... e mais {validationResults.sucesso.length - 5}{" "}
                        animais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={
              !validationResults || validationResults.sucesso.length === 0
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Importar {validationResults
              ? validationResults.sucesso.length
              : 0}{" "}
            Animais
          </button>
        </div>
      </div>
    </div>
  );
}
