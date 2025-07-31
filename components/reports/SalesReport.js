import { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function SalesReport({ isOpen, onClose, timeRange = '30' }) {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState('detailed')
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange)

  useEffect(() => {
    if (isOpen) {
      loadReportData()
    }
  }, [isOpen, selectedPeriod])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sales/report?period=${selectedPeriod}&format=${selectedFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      })
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
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

  const exportReport = async (format) => {
    try {
      const response = await fetch(`/api/sales/export?period=${selectedPeriod}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-vendas-${selectedPeriod}dias.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    }
  }

  const printReport = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Relatório de Vendas</h2>
              <p className="text-blue-100">Análise completa do período selecionado</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin text-4xl mb-4">📊</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Gerando relatório...
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
            {/* Controles do Relatório */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="detailed">Detalhado</option>
                  <option value="summary">Resumo</option>
                  <option value="financial">Financeiro</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportReport('pdf')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('xlsx')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Excel
                </button>
                <button
                  onClick={printReport}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Imprimir
                </button>
              </div>
            </div>

            {reportData && (
              <>
                {/* Resumo Executivo */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    📋 Resumo Executivo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(reportData.summary.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Receita Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {reportData.summary.totalAnimals}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Animais Vendidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(reportData.summary.averagePrice)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Preço Médio</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        reportData.summary.averageROI >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {reportData.summary.averageROI?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">ROI Médio</div>
                    </div>
                  </div>
                </div>

                {/* Vendas por Período */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Evolução das Vendas
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    {/* Aqui seria implementado um gráfico real */}
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Gráfico de evolução temporal</p>
                      <p className="text-sm">Implementar com Chart.js</p>
                    </div>
                  </div>
                </div>

                {/* Top Compradores */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Principais Compradores
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Comprador</th>
                          <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Animais</th>
                          <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Valor Total</th>
                          <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Ticket Médio</th>
                          <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Última Compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topBuyers?.map((buyer, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
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
                                  {buyer.document && (
                                    <div className="text-xs text-gray-500">
                                      {buyer.document}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center text-gray-600 dark:text-gray-400">
                              {buyer.totalAnimals}
                            </td>
                            <td className="p-3 text-center font-medium text-gray-900 dark:text-white">
                              {formatCurrency(buyer.totalValue)}
                            </td>
                            <td className="p-3 text-center font-medium text-gray-900 dark:text-white">
                              {formatCurrency(buyer.averageTicket)}
                            </td>
                            <td className="p-3 text-center text-gray-600 dark:text-gray-400">
                              {new Date(buyer.lastPurchase).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Análise por Categoria */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    🐄 Performance por Categoria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.categoryAnalysis?.map((category, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{category.icon}</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${
                            category.trend === 'up' ? 'text-green-600' :
                            category.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {category.trend === 'up' ? '📈' :
                             category.trend === 'down' ? '📉' : '➡️'}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{category.volume}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Receita:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(category.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ROI Médio:</span>
                            <span className={`font-medium ${
                              category.averageROI >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {category.averageROI?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detalhamento das Vendas */}
                {selectedFormat === 'detailed' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Detalhamento das Vendas
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Data</th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Animal</th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Comprador</th>
                            <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Valor</th>
                            <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Custo</th>
                            <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Lucro</th>
                            <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.detailedSales?.map((sale) => (
                            <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="p-3 text-gray-600 dark:text-gray-400">
                                {new Date(sale.dataVenda).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {sale.animal.serie} {sale.animal.rg}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {sale.animal.raca} • {sale.animal.sexo}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {sale.comprador}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {sale.formaPagamento}
                                </div>
                              </td>
                              <td className="p-3 text-center font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(sale.valor)}
                              </td>
                              <td className="p-3 text-center font-medium text-red-600 dark:text-red-400">
                                {formatCurrency(sale.totalCost)}
                              </td>
                              <td className="p-3 text-center font-medium text-gray-900 dark:text-white">
                                {formatCurrency(sale.profit)}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`font-medium ${
                                  sale.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {sale.roi?.toFixed(1) || 0}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}