import { useState, useEffect } from "react";
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon } from "@heroicons/react/24/outline";
import animalDataManager from "../services/animalDataManager";

export default function AuctionManager({ isOpen, onClose, onSalesComplete }) {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [auctionData, setAuctionData] = useState({
    nome: "Leilão 03/08/2025",
    data: "2025-08-03",
    local: "Fazenda",
    tipo: "LEILAO"
  });
  const [salesData, setSalesData] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadActiveAnimals();
    }
  }, [isOpen]);

  // Filtrar animais baseado na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAnimals(animals);
    } else {
      const filtered = animals.filter(animal => {
        const searchLower = searchTerm.toLowerCase();
        const serie = animal.serie || extractSerieFromBrinco(animal.brinco);
        return (
          animal.brinco?.toLowerCase().includes(searchLower) ||
          serie?.toLowerCase().includes(searchLower) ||
          animal.raca?.toLowerCase().includes(searchLower) ||
          animal.nome?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredAnimals(filtered);
    }
  }, [searchTerm, animals]);

  // Função para extrair série do brinco
  const extractSerieFromBrinco = (brinco) => {
    if (!brinco) return 'CJCJ';
    const match = brinco.match(/^[A-Z]+/);
    return match ? match[0] : 'CJCJ';
  };

  const loadActiveAnimals = async () => {
    try {
      setLoading(true);
      const animalsData = await animalDataManager.getAllAnimals();
      console.log('Dados recebidos do animalDataManager:', animalsData); // Debug
      
      // Filtrar apenas animais ativos
      const activeAnimals = animalsData.filter(animal => {
        console.log('Animal:', animal.brinco, 'Status:', animal.status); // Debug
        return animal.status === 'ATIVO';
      });
      
      console.log('Animais ativos encontrados:', activeAnimals.length); // Debug
      setAnimals(activeAnimals);
      setFilteredAnimals(activeAnimals);
      
      // Inicializar dados de venda
      const initialSalesData = {};
      activeAnimals.forEach(animal => {
        initialSalesData[animal.id] = {
          valor: '',
          selected: false
        };
      });
      setSalesData(initialSalesData);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      alert('Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalToggle = (animalId) => {
    setSalesData(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        selected: !prev[animalId].selected
      }
    }));
  };

  const handleValueChange = (animalId, valor) => {
    setSalesData(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        valor: valor,
        selected: valor ? true : prev[animalId].selected
      }
    }));
  };

  const getSelectedAnimals = () => {
    return Object.entries(salesData)
      .filter(([id, data]) => data.selected && data.valor)
      .map(([id, data]) => ({
        animalId: id,
        animal: animals.find(a => a.id === id),
        valor: parseFloat(data.valor)
      }));
  };

  const handleSaveAuction = async () => {
    const selectedSales = getSelectedAnimals();
    
    if (selectedSales.length === 0) {
      alert('Selecione pelo menos um animal e informe o valor de venda');
      return;
    }

    try {
      setSaving(true);

      // 1. Criar evento de leilão (temporariamente sem autenticação)
      const eventResponse = await fetch('/api/sale-events-simple', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(auctionData)
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.json();
        console.error('Erro na resposta da API:', errorData);
        throw new Error(errorData.message || 'Erro ao criar evento');
      }

      const event = await eventResponse.json();
      console.log('Evento criado com sucesso:', event);

      // 2. Criar vendas para cada animal
      for (const sale of selectedSales) {
        // Criar venda
        const saleResponse = await fetch('/api/sales-simple', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            animalId: sale.animalId,
            valor: sale.valor,
            dataVenda: auctionData.data,
            saleEventId: event.id,
            formaPagamento: 'LEILAO',
            observacoes: `Vendido no ${auctionData.nome}`
          })
        });

        if (!saleResponse.ok) {
          throw new Error(`Erro ao registrar venda do animal ${sale.animal.brinco}`);
        }

        // Atualizar status do animal para VENDIDO
        await fetch(`/api/animals-simple/${sale.animalId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'VENDIDO' })
        });
      }

      alert(`✅ Leilão registrado com sucesso!\n${selectedSales.length} animais vendidos.`);
      
      if (onSalesComplete) {
        onSalesComplete();
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar leilão:', error);
      alert('Erro ao salvar leilão: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const totalValue = getSelectedAnimals().reduce((sum, sale) => sum + sale.valor, 0);
  const selectedCount = getSelectedAnimals().length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">🏛️ Gerenciar Leilão</h2>
              <p className="text-green-100">Registre as vendas do leilão de forma rápida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Dados do Leilão */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Evento
              </label>
              <input
                type="text"
                value={auctionData.nome}
                onChange={(e) => setAuctionData({...auctionData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data do Leilão
              </label>
              <input
                type="date"
                value={auctionData.data}
                onChange={(e) => setAuctionData({...auctionData, data: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Local
              </label>
              <input
                type="text"
                value={auctionData.local}
                onChange={(e) => setAuctionData({...auctionData, local: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Fazenda, Leilão Regional..."
              />
            </div>
          </div>
        </div>

        {/* Resumo */}
        {selectedCount > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCount}</span> animais selecionados
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Valor total: <span className="font-bold text-green-600 dark:text-green-400">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSaveAuction}
                disabled={saving || selectedCount === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? '💾 Salvando...' : '💾 Registrar Leilão'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Animais */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando animais...</p>
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🐄</div>
              <p>Nenhum animal ativo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Campo de Busca */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🔍 Buscar por brinco, série, raça ou nome..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Contador de Resultados */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  {searchTerm ? (
                    <span>
                      {filteredAnimals.length} de {animals.length} animais encontrados
                      {searchTerm && <span className="ml-2 font-medium">para "{searchTerm}"</span>}
                    </span>
                  ) : (
                    <span>{animals.length} animais ativos disponíveis</span>
                  )}
                </div>
                <div>
                  💡 <strong>Dica:</strong> Marque os animais vendidos e informe o valor
                </div>
              </div>
              
              {/* Lista de Animais Filtrados */}
              <div className="space-y-3">
                {filteredAnimals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>Nenhum animal encontrado para "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Limpar busca
                    </button>
                  </div>
                ) : (
                  filteredAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className={`border rounded-lg p-4 transition-all ${
                    salesData[animal.id]?.selected
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={salesData[animal.id]?.selected || false}
                      onChange={() => handleAnimalToggle(animal.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {animal.sexo === 'Macho' ? '🐂' : '🐄'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {animal.serie || extractSerieFromBrinco(animal.brinco)} {animal.brinco}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {animal.raca} • {animal.sexo} • {animal.categoria || 'Bezerro'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Custo Total</div>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          R$ {(animal.costs?.reduce((sum, cost) => sum + (cost.valor || 0), 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valor Venda
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={salesData[animal.id]?.valor || ''}
                          onChange={(e) => handleValueChange(animal.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-right"
                          placeholder="0,00"
                        />
                      </div>

                      {salesData[animal.id]?.valor && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Resultado</div>
                          <div className={`font-bold ${
                            (parseFloat(salesData[animal.id].valor) - (animal.costs?.reduce((sum, cost) => sum + (cost.valor || 0), 0) || 0)) >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            R$ {(parseFloat(salesData[animal.id].valor) - (animal.costs?.reduce((sum, cost) => sum + (cost.valor || 0), 0) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Os animais vendidos terão status alterado para "VENDIDO" automaticamente
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAuction}
                disabled={saving || selectedCount === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? '💾 Salvando...' : `💾 Registrar ${selectedCount} Vendas`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}