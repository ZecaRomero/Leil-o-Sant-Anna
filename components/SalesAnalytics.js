import { useState, useEffect } from 'react';
import { ChartBarIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/outline';

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState([]);
  const [animalsData, setAnimalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      // Carregar vendas com dados dos animais
      const salesResponse = await fetch('/api/sales-list');
      const sales = await salesResponse.json();
      
      // Carregar todos os animais para comparação
      const animalsResponse = await fetch('/api/animals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      });
      const animals = await animalsResponse.json();
      
      setSalesData(sales);
      setAnimalsData(animals);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Análise FIV vs IA
  const analyzeFivVsIa = () => {
    const fivSales = salesData.filter(sale => 
      sale.animal?.tipoCobertura === 'FIV' ||
      sale.animal?.observacoes?.toLowerCase().includes('fiv') ||
      sale.observacoes?.toLowerCase().includes('fiv')
    );
    
    const iaSales = salesData.filter(sale => 
      sale.animal?.tipoCobertura === 'IA' ||
      sale.animal?.observacoes?.toLowerCase().includes('ia') ||
      sale.observacoes?.toLowerCase().includes('ia') ||
      (!sale.animal?.tipoCobertura && !sale.animal?.observacoes?.toLowerCase().includes('fiv') && !sale.observacoes?.toLowerCase().includes('fiv'))
    );

    const fivStats = {
      count: fivSales.length,
      totalValue: fivSales.reduce((sum, sale) => sum + sale.valor, 0),
      avgValue: fivSales.length > 0 ? fivSales.reduce((sum, sale) => sum + sale.valor, 0) / fivSales.length : 0,
      bestSale: fivSales.reduce((best, sale) => sale.valor > (best?.valor || 0) ? sale : best, null)
    };

    const iaStats = {
      count: iaSales.length,
      totalValue: iaSales.reduce((sum, sale) => sum + sale.valor, 0),
      avgValue: iaSales.length > 0 ? iaSales.reduce((sum, sale) => sum + sale.valor, 0) / iaSales.length : 0,
      bestSale: iaSales.reduce((best, sale) => sale.valor > (best?.valor || 0) ? sale : best, null)
    };

    return { fiv: fivStats, ia: iaStats };
  };

  // Análise por Touro (Pai)
  const analyzeByBull = () => {
    const bullStats = {};
    
    salesData.forEach(sale => {
      if (sale.animal?.pai) {
        const bullName = sale.animal.pai || 'Não informado';
        
        if (!bullStats[bullName]) {
          bullStats[bullName] = {
            name: bullName,
            count: 0,
            totalValue: 0,
            sales: []
          };
        }
        
        bullStats[bullName].count++;
        bullStats[bullName].totalValue += sale.valor;
        bullStats[bullName].sales.push(sale);
      }
    });

    // Calcular médias e ordenar
    const bullArray = Object.values(bullStats).map(bull => ({
      ...bull,
      avgValue: bull.totalValue / bull.count,
      bestSale: bull.sales.reduce((best, sale) => sale.valor > (best?.valor || 0) ? sale : best, null)
    })).sort((a, b) => b.avgValue - a.avgValue);

    return bullArray;
  };

  // Análise por Avô Materno
  const analyzeByGrandfather = () => {
    const grandfatherStats = {};
    
    salesData.forEach(sale => {
      if (sale.animal?.avoMaterno) {
        const grandfatherName = sale.animal.avoMaterno || 'Não informado';
        
        if (!grandfatherStats[grandfatherName]) {
          grandfatherStats[grandfatherName] = {
            name: grandfatherName,
            count: 0,
            totalValue: 0,
            sales: []
          };
        }
        
        grandfatherStats[grandfatherName].count++;
        grandfatherStats[grandfatherName].totalValue += sale.valor;
        grandfatherStats[grandfatherName].sales.push(sale);
      }
    });

    const grandfatherArray = Object.values(grandfatherStats).map(grandfather => ({
      ...grandfather,
      avgValue: grandfather.totalValue / grandfather.count,
      bestSale: grandfather.sales.reduce((best, sale) => sale.valor > (best?.valor || 0) ? sale : best, null)
    })).sort((a, b) => b.avgValue - a.avgValue);

    return grandfatherArray;
  };

  // Análise por Raça
  const analyzeByBreed = () => {
    const breedStats = {};
    
    salesData.forEach(sale => {
      const breed = sale.animal?.raca || 'Não informado';
      
      if (!breedStats[breed]) {
        breedStats[breed] = {
          name: breed,
          count: 0,
          totalValue: 0,
          sales: []
        };
      }
      
      breedStats[breed].count++;
      breedStats[breed].totalValue += sale.valor;
      breedStats[breed].sales.push(sale);
    });

    const breedArray = Object.values(breedStats).map(breed => ({
      ...breed,
      avgValue: breed.totalValue / breed.count,
      bestSale: breed.sales.reduce((best, sale) => sale.valor > (best?.valor || 0) ? sale : best, null)
    })).sort((a, b) => b.avgValue - a.avgValue);

    return breedArray;
  };

  // Top Performers
  const getTopPerformers = () => {
    const sortedSales = [...salesData].sort((a, b) => b.valor - a.valor);
    return sortedSales.slice(0, 5);
  };

  const fivVsIa = analyzeFivVsIa();
  const bullAnalysis = analyzeByBull();
  const grandfatherAnalysis = analyzeByGrandfather();
  const breedAnalysis = analyzeByBreed();
  const topPerformers = getTopPerformers();

  const views = [
    { id: 'overview', label: '📊 Visão Geral', icon: ChartBarIcon },
    { id: 'fiv-ia', label: '🧬 FIV vs IA', icon: StarIcon },
    { id: 'bulls', label: '🐂 Por Touro', icon: TrophyIcon },
    { id: 'grandfathers', label: '👴 Avô Materno', icon: TrophyIcon },
    { id: 'breeds', label: '🐄 Por Raça', icon: ChartBarIcon }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📈 Análise Comparativa de Vendas</h2>
        <p className="text-purple-100">
          Resultados em tempo real • {salesData.length} vendas analisadas
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedView === view.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              🏆 Top 5 Melhores Vendas
            </h3>
            <div className="space-y-3">
              {topPerformers.map((sale, index) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                        {sale.animal?.serie || 'S/N'} {sale.animal?.brinco}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.animal?.raca} • {sale.animal?.sexo}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      R$ {sale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.dataVenda).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Estatísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total de Vendas:</span>
                <span className="font-bold text-gray-900 dark:text-white">{salesData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  R$ {salesData.reduce((sum, sale) => sum + sale.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor Médio:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  R$ {salesData.length > 0 ? (salesData.reduce((sum, sale) => sum + sale.valor, 0) / salesData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Melhor Venda:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  R$ {Math.max(...salesData.map(s => s.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'fiv-ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FIV Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              🧬 Animais FIV
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {fivVsIa.fiv.count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vendas FIV</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    R$ {fivVsIa.fiv.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Médio:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    R$ {fivVsIa.fiv.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {fivVsIa.fiv.bestSale && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Melhor Venda FIV:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {fivVsIa.fiv.bestSale.animal?.brinco} - R$ {fivVsIa.fiv.bestSale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IA Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              🐄 Animais IA
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {fivVsIa.ia.count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vendas IA</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    R$ {fivVsIa.ia.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Médio:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    R$ {fivVsIa.ia.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {fivVsIa.ia.bestSale && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Melhor Venda IA:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {fivVsIa.ia.bestSale.animal?.brinco} - R$ {fivVsIa.ia.bestSale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'bulls' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            🐂 Performance por Touro (Pai)
          </h3>
          {bullAnalysis.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🐂</div>
              <p>Nenhum dado de touro encontrado nas vendas</p>
              <p className="text-sm">Adicione informações de pai nos animais para ver esta análise</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bullAnalysis.map((bull, index) => (
                <div key={bull.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{bull.name}</div>
                        <div className="text-sm text-gray-500">{bull.count} filhos vendidos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        R$ {bull.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">Média por filho</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Arrecadado:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        R$ {bull.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {bull.bestSale && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Melhor Venda:</span>
                        <span className="ml-2 font-medium text-purple-600 dark:text-purple-400">
                          R$ {bull.bestSale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedView === 'grandfathers' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            👴 Performance por Avô Materno
          </h3>
          {grandfatherAnalysis.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">👴</div>
              <p>Nenhum dado de avô materno encontrado</p>
              <p className="text-sm">Adicione informações de avô materno para ver esta análise</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grandfatherAnalysis.map((grandfather, index) => (
                <div key={grandfather.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{grandfather.name}</div>
                        <div className="text-sm text-gray-500">{grandfather.count} netos vendidos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        R$ {grandfather.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">Média por neto</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Arrecadado:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        R$ {grandfather.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {grandfather.bestSale && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Melhor Venda:</span>
                        <span className="ml-2 font-medium text-purple-600 dark:text-purple-400">
                          R$ {grandfather.bestSale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedView === 'breeds' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            🐄 Performance por Raça
          </h3>
          <div className="space-y-4">
            {breedAnalysis.map((breed, index) => (
              <div key={breed.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{breed.name}</div>
                      <div className="text-sm text-gray-500">{breed.count} animais vendidos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      R$ {breed.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Valor médio</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Arrecadado:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      R$ {breed.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {breed.bestSale && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Melhor Venda:</span>
                      <span className="ml-2 font-medium text-purple-600 dark:text-purple-400">
                        R$ {breed.bestSale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}