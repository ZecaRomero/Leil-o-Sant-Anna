import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AnimalForm from "../components/AnimalForm";
import AnimalImporter from "../components/AnimalImporter";
import CostManager from "../components/CostManager";
import AnimalTimeline from "../components/AnimalTimeline";
import SalesManager from '../components/SalesManager';
import AuctionManager from '../components/AuctionManager';
import { situacoes } from "../services/mockData";
import animalDataManager from "../services/animalDataManager";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@heroicons/react/24/outline";

export default function Animals({ darkMode, toggleDarkMode }) {
  const router = useRouter();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCostManager, setShowCostManager] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSalesManager, setShowSalesManager] = useState(false);
  const [showAuctionManager, setShowAuctionManager] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [filters, setFilters] = useState({
    raca: "",
    sexo: "",
    situacao: "",
    serie: "",
  });
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Detectar parâmetros na URL
  useEffect(() => {
    if (router.query.openImporter === 'true') {
      setShowImporter(true);
      // Limpar o parâmetro da URL
      router.replace('/animals', undefined, { shallow: true });
    }

    // Detectar filtro automático dos cards clicáveis
    if (router.query.filter) {
      setFilters(prev => ({
        ...prev,
        situacao: router.query.filter
      }));
      // Limpar o parâmetro da URL após aplicar o filtro
      router.replace('/animals', undefined, { shallow: true });
    }
  }, [router.query.openImporter, router.query.filter]);

  // Detectar se deve abrir o importador automaticamente
  useEffect(() => {
    if (router.query.openImporter === 'true') {
      setShowImporter(true);
      // Limpar o parâmetro da URL
      router.replace('/animals', undefined, { shallow: true });
    }
  }, [router.query.openImporter]);

  // Filtrar animais
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.rg.includes(searchTerm) ||
      animal.raca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters =
      (!filters.raca || animal.raca === filters.raca) &&
      (!filters.sexo || animal.sexo === filters.sexo) &&
      (!filters.situacao || animal.situacao === filters.situacao) &&
      (!filters.serie || animal.serie === filters.serie);

    return matchesSearch && matchesFilters;
  });

  // Calcular paginação
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Funções de navegação da paginação
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSelectAnimal = (animalId) => {
    setSelectedAnimals(prev => {
      if (prev.includes(animalId)) {
        return prev.filter(id => id !== animalId);
      } else {
        return [...prev, animalId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(filteredAnimals.map(animal => animal.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSalesComplete = async () => {
    await loadAnimals() // Recarregar lista de animais
    setSelectedAnimals([]) // Limpar seleção
    setSelectAll(false)
  };

  const handleDeleteSelected = async () => {
    if (selectedAnimals.length === 0) {
      alert('Selecione pelo menos um animal para excluir.');
      return;
    }

    const confirmMessage = `Tem certeza que deseja excluir ${selectedAnimals.length} animal(is) selecionado(s)?`;
    if (confirm(confirmMessage)) {
      try {
        // Excluir todos os animais selecionados
        await Promise.all(
          selectedAnimals.map(id => animalDataManager.deleteAnimal(id))
        );

        // Limpar seleção e recarregar lista
        setSelectedAnimals([]);
        setSelectAll(false);
        await loadAnimals();

        alert(`${selectedAnimals.length} animal(is) excluído(s) com sucesso!`);
      } catch (error) {
        console.error('Erro ao excluir animais:', error);
        alert('Erro ao excluir animais: ' + error.message);
      }
    }
  };

  const handleSaveAnimal = async (animalData) => {
    try {
      console.log('Dados recebidos do formulário:', animalData); // Debug
      
      const statusMapping = {
        'Ativo': 'ATIVO',
        'Vendido': 'VENDIDO', 
        'Morto': 'MORTO',
        'Doado': 'DOADO'
      };
      
      const statusToSave = statusMapping[animalData.situacao] || 'ATIVO';
      console.log('Status que será salvo:', statusToSave); // Debug

      if (selectedAnimal) {
        // Editar animal existente
        const updateData = {
          brinco: animalData.rg,
          serie: animalData.serie,
          nome: animalData.nome,
          raca: animalData.raca,
          sexo: animalData.sexo,
          dataNasc: animalData.dataNascimento,
          peso: animalData.peso ? parseFloat(animalData.peso) : null,
          categoria: animalData.categoria || 'Bezerro',
          observacoes: animalData.observacoes,
          status: statusToSave
        };
        
        console.log('Dados que serão enviados para API:', updateData); // Debug
        await animalDataManager.updateAnimal(selectedAnimal.id, updateData);
      } else {
        // Adicionar novo animal
        const dadosParaAPI = {
          brinco: animalData.rg,
          serie: animalData.serie,
          nome: animalData.nome,
          raca: animalData.raca,
          sexo: animalData.sexo,
          dataNasc: animalData.dataNascimento,
          peso: animalData.peso ? parseFloat(animalData.peso) : null,
          categoria: animalData.categoria || 'Bezerro',
          observacoes: animalData.observacoes
        };

        console.log('Dados enviados para API:', dadosParaAPI); // Debug
        await animalDataManager.addAnimal(dadosParaAPI);
      }

      // Recarregar lista de animais com delay para garantir que o banco foi atualizado
      setTimeout(async () => {
        await loadAnimals();
      }, 500);
      
      setSelectedAnimal(null);
      setShowForm(false);
      
      alert('Animal atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar animal:', error);
      alert('Erro ao salvar animal: ' + error.message);
    }
  };

  const handleSaveCosts = (updatedAnimal) => {
    setAnimals(
      animals.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a))
    );
    setSelectedAnimal(null);
  };

  const handleDeleteAnimal = async (id) => {
    if (confirm("Tem certeza que deseja excluir este animal?")) {
      try {
        await animalDataManager.deleteAnimal(id);
        await loadAnimals(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir animal:', error);
        alert('Erro ao excluir animal: ' + error.message);
      }
    }
  };

  const handleExportExcel = () => {
    console.log("Exportando para Excel...");
    // Implementar exportação
  };

  const handleViewAnimal = (animal) => {
    setSelectedAnimal(animal);
    setShowViewModal(true);
  };

  const handlePrint = (animal) => {
    // Criar conteúdo para impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha do Animal - ${animal.serie} ${animal.rg}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { background-color: #f0f0f0; padding: 8px; margin: 0 0 10px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item { padding: 5px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; }
          .costs-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .costs-table th, .costs-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .costs-table th { background-color: #f0f0f0; }
          .total { font-weight: bold; background-color: #f9f9f9; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FICHA DO ANIMAL</h1>
          <h2>${animal.serie} ${animal.rg}</h2>
          <p>Impresso em: ${new Date().toLocaleDateString(
            "pt-BR"
          )} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>

        <div class="section">
          <h3>📋 Informações Básicas</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID:</span> ${animal.id}
            </div>
            <div class="info-item">
              <span class="info-label">Série:</span> ${animal.serie}
            </div>
            <div class="info-item">
              <span class="info-label">RG:</span> ${animal.rg}
            </div>
            <div class="info-item">
              <span class="info-label">Raça:</span> ${animal.raca}
            </div>
            <div class="info-item">
              <span class="info-label">Sexo:</span> ${animal.sexo}
            </div>
            <div class="info-item">
              <span class="info-label">Idade:</span> ${animal.meses} meses
            </div>
            <div class="info-item">
              <span class="info-label">Situação:</span> ${animal.situacao}
            </div>
            <div class="info-item">
              <span class="info-label">Data de Nascimento:</span> ${
                animal.dataNascimento
                  ? new Date(animal.dataNascimento).toLocaleDateString("pt-BR")
                  : "N/A"
              }
            </div>
          </div>
        </div>

        ${
          animal.pai || animal.mae || animal.avoMaterno || animal.receptora
            ? `
        <div class="section">
          <h3>🧬 Genealogia</h3>
          <div class="info-grid">
            ${
              animal.pai
                ? `<div class="info-item"><span class="info-label">Pai:</span> ${animal.pai}</div>`
                : ""
            }
            ${
              animal.mae
                ? `<div class="info-item"><span class="info-label">Mãe:</span> ${animal.mae}</div>`
                : ""
            }
            ${
              animal.avoMaterno
                ? `<div class="info-item"><span class="info-label">Avô Materno:</span> ${animal.avoMaterno}</div>`
                : ""
            }
            ${
              animal.receptora
                ? `<div class="info-item"><span class="info-label">Receptora:</span> ${animal.receptora}</div>`
                : ""
            }
            ${
              animal.isFiv
                ? `<div class="info-item"><span class="info-label">FIV:</span> Sim</div>`
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <h3>💰 Resumo Financeiro</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Custo Total:</span> R$ ${animal.custoTotal.toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2 }
              )}
            </div>
            <div class="info-item">
              <span class="info-label">Valor de Venda:</span> ${
                animal.valorVenda
                  ? `R$ ${animal.valorVenda.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Resultado:</span> ${
                animal.valorReal !== null
                  ? `R$ ${animal.valorReal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">ROI:</span> ${
                animal.valorVenda
                  ? `${(
                      ((animal.valorVenda - animal.custoTotal) /
                        animal.custoTotal) *
                      100
                    ).toFixed(1)}%`
                  : "N/A"
              }
            </div>
          </div>
        </div>

        ${
          animal.custos && animal.custos.length > 0
            ? `
        <div class="section">
          <h3>📊 Detalhamento de Custos</h3>
          <table class="costs-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Subtipo</th>
                <th>Valor</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${animal.custos
                .map(
                  (custo) => `
                <tr>
                  <td>${new Date(custo.data).toLocaleDateString("pt-BR")}</td>
                  <td>${custo.tipo}</td>
                  <td>${custo.subtipo || "-"}</td>
                  <td>R$ ${Math.abs(custo.valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}</td>
                  <td>${custo.observacoes || "-"}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td><strong>R$ ${animal.custoTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="section">
          <h3>📝 Observações</h3>
          <p>${animal.observacoes || "Nenhuma observação registrada."}</p>
        </div>
      </body>
      </html>
    `;

    // Abrir janela de impressão
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleImportAnimals = async (importedAnimals) => {
    try {
      // Salvar cada animal importado no banco
      for (const animal of importedAnimals) {
        await animalDataManager.addAnimal({
          brinco: animal.rg,
          nome: animal.nome,
          raca: animal.raca,
          sexo: animal.sexo,
          dataNasc: animal.dataNascimento,
          peso: animal.peso,
          categoria: 'Bezerro',
          observacoes: animal.observacoes
        });
      }

      // Recarregar lista de animais
      await loadAnimals();
      alert(`✅ ${importedAnimals.length} animais importados com sucesso!`);
    } catch (error) {
      console.error('Erro ao importar animais:', error);
      alert('Erro ao importar animais: ' + error.message);
    }
  };

  const clearFilters = () => {
    setFilters({
      raca: "",
      sexo: "",
      situacao: "",
      serie: "",
    });
    setSearchTerm("");
  };

  // Carregar animais do banco de dados
  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const animalsData = await animalDataManager.getAllAnimals();

      // Transformar dados do banco para o formato esperado pelo frontend
      const transformedAnimals = animalsData.map(animal => {
        // Usar a série diretamente do banco de dados, ou extrair do brinco como fallback
        const serie = animal.serie || (animal.brinco?.match(/^[A-Z]+/) ? animal.brinco.match(/^[A-Z]+/)[0] : 'CJCJ');

        return {
          id: animal.id,
          serie: serie,
          rg: animal.brinco,
          brinco: animal.brinco,
          nome: animal.nome,
          sexo: animal.sexo,
          raca: animal.raca,
          dataNascimento: animal.dataNasc ? new Date(animal.dataNasc).toISOString().split('T')[0] : null,
          dataNasc: animal.dataNasc,
          meses: animal.dataNasc ? Math.floor((new Date() - new Date(animal.dataNasc)) / (1000 * 60 * 60 * 24 * 30.44)) : 0,
          situacao: animal.status === 'ATIVO' ? 'Ativo' : 
                   animal.status === 'VENDIDO' ? 'Vendido' :
                   animal.status === 'MORTO' ? 'Morto' :
                   animal.status === 'DOADO' ? 'Doado' : animal.status,
          categoria: animal.categoria,
          peso: animal.peso,
          observacoes: animal.observacoes,
          custoTotal: animal.costs?.reduce((sum, cost) => sum + cost.valor, 0) || 0,
          custos: animal.costs?.map(cost => ({
            id: cost.id,
            tipo: cost.tipo,
            descricao: cost.descricao,
            valor: cost.valor,
            data: new Date(cost.data).toISOString().split('T')[0],
            observacoes: cost.observacoes
          })) || [],
          valorVenda: null,
          valorReal: null,
          // Campos específicos do mock que podem ser implementados depois
          pai: null,
          mae: null,
          avoMaterno: null,
          receptora: null,
          isFiv: false
        };
      });

      setAnimals(transformedAnimals);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      alert('Erro ao carregar animais do banco de dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar indicador de loading
  if (loading) {
    return (
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          <p className="ml-4 text-lg text-gray-600 dark:text-gray-400">Carregando animais...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestão de Animais
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie o cadastro e informações dos animais
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowImporter(true)}
              className="btn-secondary flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              📥 Importar CJCJ
            </button>
            <button
              onClick={() => setShowAuctionManager(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center font-medium shadow-lg"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              🏛️ Leilão 03/08
            </button>
            <button
              onClick={() => {
                setSelectedAnimal(null);
                setShowForm(true);
              }}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo Animal
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por série, RG ou raça..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </button>
              <button onClick={clearFilters} className="btn-secondary">
                Limpar
              </button>
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Série
                  </label>
                  <select
                    value={filters.serie}
                    onChange={(e) =>
                      setFilters({ ...filters, serie: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Todas</option>
                    <option value="RPT">RPT</option>
                    <option value="BENT">BENT</option>
                    <option value="CJCJ">CJCJ</option>
                    <option value="CJCG">CJCG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Raça
                  </label>
                  <select
                    value={filters.raca}
                    onChange={(e) =>
                      setFilters({ ...filters, raca: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Todas</option>
                    <option value="Nelore">Nelore</option>
                    <option value="Brahman">Brahman</option>
                    <option value="Gir">Gir</option>
                    <option value="Receptora">Receptora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sexo
                  </label>
                  <select
                    value={filters.sexo}
                    onChange={(e) =>
                      setFilters({ ...filters, sexo: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Situação
                  </label>
                  <select
                    value={filters.situacao}
                    onChange={(e) =>
                      setFilters({ ...filters, situacao: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Todas</option>
                    {situacoes.map((situacao) => (
                      <option key={situacao} value={situacao}>
                        {situacao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações em Lote */}
        {selectedAnimals.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-green-800 dark:text-green-200 font-medium">
                  {selectedAnimals.length} animais selecionados
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSalesManager(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  💰 Vender Animais
                </button>
                <button
                  onClick={() => {
                    setSelectedAnimals([])
                    setSelectAll(false)
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar Seleção
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="btn-danger flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Excluir Selecionados</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Animais */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Animal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detalhes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Financeiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedAnimals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAnimals.includes(animal.id)}
                        onChange={() => handleSelectAnimal(animal.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {animal.sexo === "Macho" ? "🐂" : "🐄"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {animal.serie} {animal.rg}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {animal.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {animal.raca} - {animal.sexo}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {animal.meses} meses
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          animal.situacao === "Ativo"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : animal.situacao === "Vendido"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : animal.situacao === "Morto"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        }`}
                      >
                        {animal.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900 dark:text-white">
                        Custo: R${" "}
                        {animal.custoTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {animal.valorReal !== null && (
                        <div
                          className={
                            animal.valorReal >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          Resultado: R${" "}
                          {animal.valorReal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAnimal(animal)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Visualizar"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnimal(animal);
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnimal(animal);
                            setShowCostManager(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Gerenciar Custos"
                        >
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnimal(animal);
                            setShowTimeline(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Timeline de Custos"
                        >
                          <ClockIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePrint(animal)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Imprimir"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnimal(animal.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Excluir"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{' '}
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}até{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredAnimals.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{filteredAnimals.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-200'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <UserGroupIcon className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhum animal encontrado</p>
                <p className="text-sm">
                  Tente ajustar os filtros ou adicione um novo animal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Estatísticas resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div 
            onClick={() => {
              clearFilters();
              setSearchTerm("");
            }}
            className="card p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              {filteredAnimals.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
              Total Filtrado
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para limpar filtros
            </div>
          </div>
          
          <div 
            onClick={() => {
              setFilters(prev => ({ ...prev, situacao: "Ativo" }));
              setSearchTerm("");
            }}
            className="card p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
              {filteredAnimals.filter((a) => a.situacao === "Ativo").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-medium">
              Ativos
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para filtrar ativos
            </div>
          </div>
          
          <div 
            onClick={() => {
              setFilters(prev => ({ ...prev, situacao: "Vendido" }));
              setSearchTerm("");
            }}
            className="card p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600"
          >
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform">
              {filteredAnimals.filter((a) => a.situacao === "Vendido").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors font-medium">
              Vendidos
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para ver vendidos
            </div>
          </div>
          
          <div 
            onClick={() => setShowFinancialModal(true)}
            className="card p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              R${" "}
              {filteredAnimals
                .reduce((acc, a) => acc + a.custoTotal, 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-medium">
              Custo Total
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para ver resumo
            </div>
          </div>
          
          <div 
            onClick={() => {
              const mortos = filteredAnimals.filter((a) => a.situacao === "Morto").length;
              const doados = filteredAnimals.filter((a) => a.situacao === "Doado").length;
              const outros = filteredAnimals.filter((a) => !["Ativo", "Vendido", "Morto", "Doado"].includes(a.situacao)).length;
              
              if (mortos > 0 || doados > 0 || outros > 0) {
                setFilters(prev => ({ 
                  ...prev, 
                  situacao: mortos > 0 ? "Morto" : doados > 0 ? "Doado" : "" 
                }));
              } else {
                alert("📊 Outras Situações:\n\nNenhum animal encontrado em outras situações (Morto, Doado, etc.)");
              }
            }}
            className="card p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
          >
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform">
              {filteredAnimals.filter((a) => !["Ativo", "Vendido"].includes(a.situacao)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors font-medium">
              Outros
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Mortos, doados, etc.
            </div>
          </div>
        </div>
      </div>

      {/* Modal do formulário */}
      <AnimalForm
        animal={selectedAnimal}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedAnimal(null);
        }}
        onSave={handleSaveAnimal}
      />

      {/* Modal de gerenciamento de custos */}
      {showCostManager && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Gerenciar Custos - {selectedAnimal.serie} {selectedAnimal.rg}
              </h2>
              <button
                onClick={() => {
                  setShowCostManager(false);
                  setSelectedAnimal(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <CostManager 
                animal={selectedAnimal}
                isOpen={true}
                onClose={() => {
                  setShowCostManager(false);
                  setSelectedAnimal(null);
                }}
                onSave={handleSaveCosts}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal da Timeline de Custos */}
      {showTimeline && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Timeline de Custos - {selectedAnimal.serie} {selectedAnimal.rg}
              </h2>
              <button
                onClick={() => {
                  setShowTimeline(false);
                  setSelectedAnimal(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AnimalTimeline animalId={selectedAnimal.id} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      <AnimalImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImport={handleImportAnimals}
      />

      {/* Modal do Sistema de Vendas */}
      <SalesManager
        isOpen={showSalesManager}
        onClose={() => setShowSalesManager(false)}
        selectedAnimals={selectedAnimals.map(id => animals.find(a => a.id === id)).filter(Boolean)}
        onSalesComplete={handleSalesComplete}
      />

      {/* Modal do Leilão */}
      <AuctionManager
        isOpen={showAuctionManager}
        onClose={() => setShowAuctionManager(false)}
        onSalesComplete={handleSalesComplete}
      />

      {/* Modal de Visualização Detalhada */}
      {showViewModal && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-2xl">
                    {selectedAnimal.sexo === "Macho" ? "🐂" : "🐄"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedAnimal.serie} {selectedAnimal.rg}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedAnimal.raca} • {selectedAnimal.sexo} •{" "}
                    {selectedAnimal.meses} meses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Status e Situação */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedAnimal.situacao === "Ativo"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : selectedAnimal.situacao === "Vendido"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : selectedAnimal.situacao === "Morto"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      }`}
                    >
                      {selectedAnimal.situacao}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ID do Sistema
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      #{selectedAnimal.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Informações Básicas */}
                <div className="card p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Informações Básicas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Série:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAnimal.serie}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        RG:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAnimal.rg}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Raça:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAnimal.raca}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Sexo:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAnimal.sexo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Idade:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAnimal.meses} meses
                      </span>
                    </div>
                    {selectedAnimal.dataNascimento && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Nascimento:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(
                            selectedAnimal.dataNascimento
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="card p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="mr-2">💰</span>
                    Resumo Financeiro
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Custo Total:
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        R${" "}
                        {selectedAnimal.custoTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {selectedAnimal.valorVenda && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Valor de Venda:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          R${" "}
                          {selectedAnimal.valorVenda.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.valorReal !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Resultado:
                        </span>
                        <span
                          className={`font-bold ${
                            selectedAnimal.valorReal >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          R${" "}
                          {selectedAnimal.valorReal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.valorVenda && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          ROI:
                        </span>
                        <span
                          className={`font-bold ${
                            (selectedAnimal.valorVenda -
                              selectedAnimal.custoTotal) /
                              selectedAnimal.custoTotal >=
                            0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {(
                            ((selectedAnimal.valorVenda -
                              selectedAnimal.custoTotal) /
                              selectedAnimal.custoTotal) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Genealogia */}
              {(selectedAnimal.pai ||
                selectedAnimal.mae ||
                selectedAnimal.avoMaterno ||
                selectedAnimal.receptora) && (
                <div className="card p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="mr-2">🧬</span>
                    Genealogia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAnimal.pai && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Pai:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAnimal.pai}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.mae && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Mãe:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAnimal.mae}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.avoMaterno && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Avô Materno:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAnimal.avoMaterno}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.receptora && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Receptora:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAnimal.receptora}
                        </span>
                      </div>
                    )}
                    {selectedAnimal.isFiv && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          FIV:
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          Sim
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Histórico de Custos */}
              {selectedAnimal.custos && selectedAnimal.custos.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Histórico de Custos ({selectedAnimal.custos.length}{" "}
                    registros)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Data
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Tipo
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Valor
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Observações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedAnimal.custos.map((custo, index) => (
                          <tr key={custo.id || index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(custo.data).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {custo.tipo}
                              </span>
                              {custo.subtipo && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                  - {custo.subtipo}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span
                                className={`text-sm font-bold ${
                                  custo.valor > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {custo.valor > 0 ? "-" : "+"}R${" "}
                                {Math.abs(custo.valor).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {custo.observacoes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    ✏️ Editar Animal
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedAnimal(selectedAnimal);
                      setShowCostManager(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    💰 Gerenciar Custos
                  </button>
                  <button
                    onClick={() => handlePrint(selectedAnimal)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    🖨️ Imprimir Ficha
                  </button>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  ❌ Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Financeiro */}
      {showFinancialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Resumo Financeiro</h2>
                  <p className="text-purple-100">Análise detalhada dos investimentos</p>
                </div>
              </div>
              <button
                onClick={() => setShowFinancialModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      R$ {filteredAnimals.reduce((acc, a) => acc + a.custoTotal, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Investido</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {(filteredAnimals.reduce((acc, a) => acc + a.custoTotal, 0) / (filteredAnimals.length || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Investimento Médio</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {filteredAnimals.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Animais Analisados</div>
                  </div>
                </div>
              </div>

              {/* Top 5 Maiores Investimentos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  🏆 Top 5 Maiores Investimentos
                </h3>
                <div className="space-y-3">
                  {[...filteredAnimals]
                    .sort((a, b) => b.custoTotal - a.custoTotal)
                    .slice(0, 5)
                    .map((animal, index) => (
                      <div key={animal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {animal.serie} {animal.rg}
                            </div>
                            <div className="text-sm text-gray-500">
                              {animal.raca} • {animal.sexo} • {animal.meses} meses
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600 dark:text-purple-400">
                            R$ {animal.custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((animal.custoTotal / filteredAnimals.reduce((acc, a) => acc + a.custoTotal, 0)) * 100).toFixed(1)}% do total
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Distribuição por Situação */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  📊 Distribuição de Investimentos por Situação
                </h3>
                <div className="space-y-3">
                  {['Ativo', 'Vendido', 'Morto', 'Doado'].map(situacao => {
                    const animaisSituacao = filteredAnimals.filter(a => a.situacao === situacao);
                    const custoSituacao = animaisSituacao.reduce((acc, a) => acc + a.custoTotal, 0);
                    const percentual = filteredAnimals.reduce((acc, a) => acc + a.custoTotal, 0) > 0 ? 
                      (custoSituacao / filteredAnimals.reduce((acc, a) => acc + a.custoTotal, 0)) * 100 : 0;
                    
                    if (animaisSituacao.length === 0) return null;
                    
                    return (
                      <div key={situacao} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            situacao === 'Ativo' ? 'bg-green-500' :
                            situacao === 'Vendido' ? 'bg-orange-500' :
                            situacao === 'Morto' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {situacao}
                            </div>
                            <div className="text-sm text-gray-500">
                              {animaisSituacao.length} animais
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            R$ {custoSituacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {percentual.toFixed(1)}% do total
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}