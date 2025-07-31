import { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function SalesDashboard({ onOpenSalesManager }) {
  const [salesData, setSalesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadSalesData()
  }, [selectedPeriod])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sales/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      })
      const data = await response.json()
      setSalesData(data)
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value || 0)
  }

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Receita Total</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(salesData?.metrics.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {salesData?.metrics.revenueGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  salesData?.metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(salesData?.metrics.revenueGrowth || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Animais Vendidos</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {salesData?.metrics.totalAnimals || 0}
              </p>
              <div className="flex items-center mt-2">
                {salesData?.metrics.animalsGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  salesData?.metrics.animalsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(salesData?.metrics.animalsGrowth || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Preço Médio</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(salesData?.metrics.averagePrice)}
              </p>
              <div className="flex items-center mt-2">
                {salesData?.metrics.priceGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  salesData?.metrics.priceGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(salesData?.metrics.priceGrowth || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">ROI Médio</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {salesData?.metrics.averageROI?.toFixed(1) || 0}%
              </p>
              <div className="flex items-center mt-2">
                {salesData?.metrics.roiGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  salesData?.metrics.roiGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(salesData?.metrics.roiGrowth || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Vendas por Período */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Evolução das Vendas
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {/* Aqui seria implementado um gráfico real */}
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Gráfico de evolução das vendas</p>
            <p className="text-sm">Implementar com Chart.js ou similar</p>
          </div>
        </div>
      </div>

      {/* Top Compradores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Top Compradores
          </h3>
          <div className="space-y-3">
            {salesData?.topBuyers?.map((buyer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                      {buyer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {buyer.totalAnimals} animais
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(buyer.totalValue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Média: {formatCurrency(buyer.averagePrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendas por Categoria */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🐄 Vendas por Categoria
          </h3>
          <div className="space-y-3">
            {salesData?.salesByCategory?.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.count} animais ({category.percentage}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.totalValue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Média: {formatCurrency(category.averagePrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRecentSalesTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Vendas Recentes
          </h3>
          <button
            onClick={onOpenSalesManager}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Venda
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Data</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Animal</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Comprador</th>
              <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Valor</th>
              <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">ROI</th>
              <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Pagamento</th>
              <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {salesData?.recentSales?.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {new Date(sale.dataVenda).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {sale.animal.serie} {sale.animal.rg}
                  </div>
                  <div className="text-sm text-gray-500">
                    {sale.animal.raca} • {sale.animal.sexo}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {sale.comprador}
                  </div>
                  {sale.documento && (
                    <div className="text-sm text-gray-500">
                      {sale.documento}
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(sale.valor)}
                  </div>
                  {(sale.comissao > 0 || sale.taxas > 0) && (
                    <div className="text-xs text-gray-500">
                      Líquido: {formatCurrency(sale.valor - sale.comissao - sale.taxas)}
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className={`font-bold ${
                    sale.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {sale.roi?.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Lucro: {formatCurrency(sale.profit || 0)}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    sale.formaPagamento === 'PIX' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    sale.formaPagamento === 'DINHEIRO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {sale.formaPagamento}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">💰</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Carregando dashboard de vendas...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              💰 Dashboard de Vendas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análise completa das suas vendas e performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>
            <button
              onClick={onOpenSalesManager}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Venda
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-b-2 border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setSelectedTab('recent')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'recent'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-b-2 border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📋 Vendas Recentes
          </button>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'recent' && renderRecentSalesTab()}
        </div>
      </div>
    </div>
  )
}