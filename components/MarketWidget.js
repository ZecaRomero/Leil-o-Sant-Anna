import { useState, useEffect } from "react";
import { MarketAPI } from "../services/marketAPI";

export default function MarketWidget() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Recria");

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 15000); // Atualizar a cada 15 segundos para simular tempo real
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await MarketAPI.getCattlePrices();
      setMarketData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao carregar dados do mercado:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (change) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-2">📊</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Carregando preços...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
          📈 Preços Hoje
        </h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ao vivo
          </span>
        </div>
      </div>

      {/* Filtros de Categoria */}
      {marketData && (
        <div className="mb-4">
          <div className="flex space-x-1 text-xs">
            {["all", "Terminados", "Recria", "Cria"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 py-1 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category === "all" ? "Todos" : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preços dos Animais */}
      {marketData && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(marketData.prices)
            .filter(([key, data]) => {
              if (selectedCategory === "all") return true;
              if (selectedCategory === "Recria") {
                // Mostrar apenas Garrote e Novilha na categoria Recria
                return key === "garrote" || key === "novilha";
              }
              return data.category === selectedCategory;
            })
            .map(([key, data]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{data.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {key === "boi_gordo"
                        ? "Boi Gordo"
                        : key === "vaca_gorda"
                        ? "Vaca Gorda"
                        : key === "novilha"
                        ? "Novilha"
                        : key === "garrote"
                        ? "Garrote"
                        : key === "bezerro_macho"
                        ? "Bezerro"
                        : key === "bezerra"
                        ? "Bezerra"
                        : key}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {data.market}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {data.unit.includes("arroba")
                      ? `R$ ${data.price.toFixed(0)}`
                      : formatCurrency(data.price)}
                  </div>
                  <div
                    className={`text-xs flex items-center justify-end ${getTrendColor(
                      data.change
                    )}`}
                  >
                    <span className="mr-1">{getTrendIcon(data.trend)}</span>
                    {data.changePercent > 0 ? "+" : ""}
                    {data.changePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Índices Econômicos */}
      {marketData && (
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <span>{marketData.indices.dolar.icon}</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  USD {marketData.indices.dolar.value.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-500 mt-1">Dólar</div>
              <div
                className={`text-xs ${getTrendColor(
                  marketData.indices.dolar.change
                )}`}
              >
                {marketData.indices.dolar.changePercent > 0 ? "+" : ""}
                {marketData.indices.dolar.changePercent.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <span>{marketData.indices.soja.icon}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  R$ {marketData.indices.soja.value.toFixed(0)}
                </span>
              </div>
              <div className="text-gray-500 mt-1">Soja</div>
              <div
                className={`text-xs ${getTrendColor(
                  marketData.indices.soja.change
                )}`}
              >
                {marketData.indices.soja.changePercent > 0 ? "+" : ""}
                {marketData.indices.soja.changePercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status do Mercado */}
      {marketData && (
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  marketData.marketStatus.session.status === "open"
                    ? "bg-green-500 animate-pulse"
                    : marketData.marketStatus.session.status === "closing"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">
                {marketData.marketStatus.session.label}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {lastUpdate?.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
