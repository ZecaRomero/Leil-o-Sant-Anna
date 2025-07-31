import { useState, useEffect } from 'react'
import { mockAnimals } from '../services/mockData'
import MetricsCards from './dashboard/MetricsCards'
import AdvancedCharts from './dashboard/AdvancedCharts'
import ReportsModal from './dashboard/ReportsModal'
import QuickActions from './dashboard/QuickActions'
import LiveStats from './dashboard/LiveStats'
import AnimalPerformance from './dashboard/AnimalPerformance'
import SmartAlerts from './SmartAlerts'
import ROICalculator from './ROICalculator'
import MarketDashboard from './MarketDashboard'
import PriceComparison from './PriceComparison'
import SalesDashboard from './SalesDashboard'
import SalesAnalytics from './SalesAnalytics'
import SalesManager from './SalesManager'
import InviteSystem from './InviteSystem'
import NotificationSystem from './NotificationSystem'

export default function ModernDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showROICalculator, setShowROICalculator] = useState(false)
  const [selectedView, setSelectedView] = useState('dashboard') // dashboard, market, comparison, sales, analytics
  const [showSalesManager, setShowSalesManager] = useState(false)
  const [selectedAnimals, setSelectedAnimals] = useState([])
  const [liveData, setLiveData] = useState({
    totalAnimals: 0,
    activeAnimals: 0,
    totalInvested: 0,
    totalRevenue: 0,
    avgROI: 0,
    topPerformer: null
  })

  // Carregar dados reais do banco
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Carregar animais reais
        const animalsResponse = await fetch('/api/animals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
          }
        })
        const animals = await animalsResponse.json()

        // Carregar vendas reais
        const salesResponse = await fetch('/api/sales', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
          }
        })
        const sales = await salesResponse.json()

        // Calcular métricas reais
        const totalAnimals = animals.length
        const activeAnimals = animals.filter(a => a.status === 'ATIVO').length
        
        const totalInvested = animals.reduce((acc, animal) => {
          const costs = animal.costs || []
          const totalCost = costs
            .filter(cost => cost.tipo !== 'VENDA')
            .reduce((sum, cost) => sum + cost.valor, 0)
          return acc + totalCost
        }, 0)

        const totalRevenue = sales.reduce((acc, sale) => acc + sale.valor, 0)
        
        let totalROI = 0
        let validROICount = 0
        let bestPerformer = null
        let bestROI = -Infinity

        sales.forEach(sale => {
          const animal = animals.find(a => a.id === sale.animalId)
          if (animal) {
            const costs = animal.costs || []
            const totalCost = costs
              .filter(cost => cost.tipo !== 'VENDA')
              .reduce((sum, cost) => sum + cost.valor, 0)
            
            if (totalCost > 0) {
              const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
              const roi = (profit / totalCost) * 100
              totalROI += roi
              validROICount += 1

              if (roi > bestROI) {
                bestROI = roi
                bestPerformer = {
                  ...animal,
                  saleValue: sale.valor,
                  roi: roi
                }
              }
            }
          }
        })

        const avgROI = validROICount > 0 ? totalROI / validROICount : 0

        setLiveData({
          totalAnimals,
          activeAnimals,
          totalInvested,
          totalRevenue,
          avgROI,
          topPerformer: bestPerformer,
          lastUpdate: new Date()
        })
      } catch (error) {
        console.error('Erro ao carregar dados reais:', error)
      }
    }

    loadRealData()
    const interval = setInterval(loadRealData, 30000) // Atualizar a cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const timeRanges = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '3 meses' },
    { value: '1y', label: '1 ano' },
    { value: 'all', label: 'Todos' }
  ]

  const views = [
    { id: 'dashboard', label: '🏠 Dashboard', description: 'Visão geral do rebanho' },
    { id: 'sales', label: '💰 Vendas', description: 'Dashboard completo de vendas' },
    { id: 'analytics', label: '📊 Análise Comparativa', description: 'FIV vs IA, performance por touro, avô materno' },
    { id: 'market', label: '📈 Market Intelligence', description: 'Dados de mercado em tempo real' },
    { id: 'comparison', label: '🔍 Comparação', description: 'Compare seus animais com o mercado' },
    { id: 'invites', label: '📱 Convites', description: 'Convide pessoas para acompanhar suas vendas' },
    { id: 'notifications', label: '🔔 Notificações', description: 'Alertas e atualizações em tempo real' }
  ]

  const renderContent = () => {
    switch (selectedView) {
      case 'sales':
        return <SalesDashboard onOpenSalesManager={() => setShowSalesManager(true)} />
      case 'analytics':
        return <SalesAnalytics />
      case 'market':
        return <MarketDashboard />
      case 'comparison':
        return <PriceComparison />
      case 'invites':
        return <InviteSystem userId="user123" />
      case 'notifications':
        return <NotificationSystem userId="user123" />
      default:
        return (
          <div className="space-y-8">
            {/* Stats em Tempo Real */}
            <LiveStats data={liveData} />

            {/* Métricas Principais */}
            <MetricsCards 
              timeRange={selectedTimeRange}
              onReportClick={(reportType) => {
                setSelectedReport(reportType)
                setShowReportsModal(true)
              }}
            />

            {/* Ações Rápidas */}
            <QuickActions onROICalculatorOpen={() => setShowROICalculator(true)} />

            {/* Alertas Inteligentes */}
            <SmartAlerts />

            {/* Gráficos Avançados */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <AdvancedCharts timeRange={selectedTimeRange} />
              </div>
              <div>
                <AnimalPerformance />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Moderno com Controles */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-3 flex items-center">
                🚀 Dashboard Inteligente
                <span className="ml-4 px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  v3.0 Pro + Market AI
                </span>
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Análise avançada do seu rebanho com dados de mercado em tempo real
              </p>
              <div className="mt-4 flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span>Sistema Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span>Última atualização: {liveData.lastUpdate?.toLocaleTimeString() || 'Carregando...'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  <span>APIs de Mercado Ativas</span>
                </div>
              </div>
            </div>

            {/* Controles de Tempo - apenas para dashboard */}
            {(selectedView === 'dashboard' || selectedView === 'sales' || selectedView === 'analytics') && (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-2">
                  {timeRanges.map(range => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedTimeRange(range.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedTimeRange === range.value
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{liveData.totalAnimals}</div>
                  <div className="text-blue-200 text-sm">Animais Cadastrados</div>
                </div>
              </div>
            )}

            {/* Info adicional para outras views */}
            {!['dashboard', 'sales', 'analytics'].includes(selectedView) && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedView === 'market' ? '📈' : 
                   selectedView === 'comparison' ? '🔍' : '📊'}
                </div>
                <div className="text-blue-200 text-sm">
                  {selectedView === 'market' ? 'Dados de Mercado' : 
                   selectedView === 'comparison' ? 'Análise de Preços' : 'Analytics'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Efeitos visuais */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Navegação entre Views */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex-1 min-w-[200px] p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                selectedView === view.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="font-semibold text-lg mb-1">{view.label}</div>
              <div className={`text-sm ${
                selectedView === view.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {view.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      {renderContent()}

      {/* Modal de Relatórios */}
      {showReportsModal && (
        <ReportsModal
          reportType={selectedReport}
          onClose={() => setShowReportsModal(false)}
          timeRange={selectedTimeRange}
        />
      )}

      {/* Calculadora ROI */}
      <ROICalculator
        isOpen={showROICalculator}
        onClose={() => setShowROICalculator(false)}
      />

      {/* Sistema de Vendas */}
      <SalesManager
        isOpen={showSalesManager}
        onClose={() => setShowSalesManager(false)}
        selectedAnimals={selectedAnimals}
        onSalesComplete={() => {
          // Recarregar dados após venda
          setSelectedAnimals([])
        }}
      />
    </div>
  )
}