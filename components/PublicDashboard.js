import { useState, useEffect } from "react";
import { InviteAPI } from "../services/inviteAPI";

export default function PublicDashboard({ inviteToken }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [selectedTab, setSelectedTab] = useState("sales");

  useEffect(() => {
    loadDashboard();
    
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      addLiveUpdate();
    }, 30000); // Nova atualização a cada 30 segundos

    return () => clearInterval(interval);
  }, [inviteToken]);

  const loadDashboard = async () => {
    try {
      const data = await InviteAPI.getPublicDashboard(inviteToken);
      setDashboardData(data);
      setLiveUpdates(data.liveUpdates);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLiveUpdate = () => {
    const updates = [
      { type: "sale", message: "Nova venda: Garrote #5555 por R$ 4.200", icon: "💰" },
      { type: "price_alert", message: "Preço da arroba subiu R$ 2,50", icon: "📈" },
      { type: "market", message: "Mercado em alta - momento favorável", icon: "🚀" },
      { type: "ranking", message: "Seu rebanho está 15% acima da média", icon: "🏆" }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    const newUpdate = {
      ...randomUpdate,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Manter apenas 10 atualizações
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐄</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Carregando dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Convite inválido ou expirado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🐄</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.farmName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proprietário: {dashboardData.owner} • {dashboardData.totalAnimals} animais
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ao vivo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com atualizações ao vivo */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🔴 Atualizações ao Vivo
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveUpdates.map((update) => (
                  <div
                    key={update.id || update.timestamp}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{update.icon || "📢"}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDateTime(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "sales", label: "Vendas Recentes", icon: "💰" },
                    { id: "rankings", label: "Rankings", icon: "🏆" },
                    { id: "market", label: "vs Mercado", icon: "📊" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        selectedTab === tab.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Aba de Vendas */}
                {selectedTab === "sales" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      💰 Vendas Recentes
                    </h3>
                    
                    <div className="space-y-4">
                      {dashboardData.recentSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">🐄</div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {sale.animal}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {sale.weight}kg • {sale.buyer}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTime(sale.date)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(sale.price)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Lucro: {formatCurrency(sale.profit)}
                              </div>
                              <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                {sale.category}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aba de Rankings */}
                {selectedTab === "rankings" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      🏆 Rankings e Performance
                    </h3>
                    
                    {/* Melhores Performers */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        🥇 Top Performers
                      </h4>
                      <div className="space-y-2">
                        {dashboardData.rankings.bestPerformers.map((animal, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {animal.animal}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  ROI: {animal.roi}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(animal.value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Por Categoria */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        📊 Por Categoria
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(dashboardData.rankings.byCategory).map(([category, data]) => (
                          <div
                            key={category}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                          >
                            <div className="text-2xl mb-2">
                              {category === "Terminados" ? "🐄" : 
                               category === "Recria" ? "🐂" : "🐮"}
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {category}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {data.count} animais
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                              {formatCurrency(data.avgPrice)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Preço médio
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Aba de Comparação com Mercado */}
                {selectedTab === "market" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      📊 Performance vs Mercado
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {dashboardData.marketComparison.aboveMarket}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📈 Acima do Mercado
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {dashboardData.marketComparison.atMarket}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ➡️ No Mercado
                        </div>
                      </div>
                      
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {dashboardData.marketComparison.belowMarket}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📉 Abaixo do Mercado
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          +{dashboardData.marketComparison.avgPremium}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          🎯 Prêmio Médio
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Excelente Performance!
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Seu rebanho está performando {dashboardData.marketComparison.avgPremium}% acima da média do mercado
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}