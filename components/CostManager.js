import { useState, useEffect } from "react";

export default function CostManager({ animal, isOpen, onClose, onSave }) {
  if (!isOpen || !animal) return null;
  
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCost, setNewCost] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  useEffect(() => {
    if (animal) {
      loadCosts();
    }
  }, [animal]);

  const loadCosts = async () => {
    try {
      setLoading(true);
      // Simular carregamento de custos do animal
      const animalCosts = animal.custos || [];
      setCosts(animalCosts);
    } catch (error) {
      console.error('Erro ao carregar custos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = () => {
    if (!newCost.tipo || !newCost.valor) {
      alert('Preencha pelo menos o tipo e valor do custo');
      return;
    }

    const cost = {
      id: Date.now(),
      tipo: newCost.tipo,
      descricao: newCost.descricao,
      valor: parseFloat(newCost.valor),
      data: newCost.data,
      observacoes: newCost.observacoes
    };

    const updatedCosts = [...costs, cost];
    setCosts(updatedCosts);
    
    // Atualizar animal com novos custos
    const updatedAnimal = {
      ...animal,
      custos: updatedCosts,
      custoTotal: updatedCosts.reduce((sum, c) => sum + c.valor, 0)
    };
    
    if (onSave) {
      onSave(updatedAnimal);
    }

    setNewCost({
      tipo: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setShowAddForm(false);
    alert('Custo adicionado com sucesso!');
  };

  const handleDeleteCost = (costId) => {
    if (!confirm('Tem certeza que deseja excluir este custo?')) return;

    const updatedCosts = costs.filter(c => c.id !== costId);
    setCosts(updatedCosts);
    
    // Atualizar animal
    const updatedAnimal = {
      ...animal,
      custos: updatedCosts,
      custoTotal: updatedCosts.reduce((sum, c) => sum + c.valor, 0)
    };
    
    if (onSave) {
      onSave(updatedAnimal);
    }
    
    alert('Custo excluído com sucesso!');
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.valor, 0);

  const costTypes = [
    'Aquisição',
    'Alimentação',
    'Medicamentos',
    'Veterinários',
    'DNA',
    'Mão de Obra',
    'Transporte',
    'Outros'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            💰 Gerenciar Custos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {animal.serie} {animal.rg} - {animal.raca}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Adicionar Custo
        </button>
      </div>

      {/* Resumo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Custos</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Registros</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {costs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Custos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando custos...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {costs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>Nenhum custo registrado ainda</p>
              <p className="text-sm">Clique em "Adicionar Custo" para começar</p>
            </div>
          ) : (
            costs.map((cost) => (
              <div key={cost.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {cost.tipo}
                      </div>
                      {cost.descricao && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          - {cost.descricao}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(cost.data).toLocaleDateString('pt-BR')}
                      </div>
                      {cost.observacoes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cost.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      R$ {cost.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => handleDeleteCost(cost.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir custo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Adicionar Custo */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Adicionar Novo Custo
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Custo *
                </label>
                <select
                  value={newCost.tipo}
                  onChange={(e) => setNewCost({ ...newCost, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione o tipo</option>
                  {costTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newCost.descricao}
                  onChange={(e) => setNewCost({ ...newCost, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Ração concentrada, Vacina, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newCost.valor}
                  onChange={(e) => setNewCost({ ...newCost, valor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={newCost.data}
                  onChange={(e) => setNewCost({ ...newCost, data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={newCost.observacoes}
                  onChange={(e) => setNewCost({ ...newCost, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}