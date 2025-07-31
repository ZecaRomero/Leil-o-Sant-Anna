import { useState, useEffect } from 'react'

export default function MetricsCards({ timeRange, onReportClick }) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [realData, setRealData] = useState({
    animals: [],
    sales: [],
    loading: true
  })

  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      // Carregar animais reais do banco
      const animalsResponse = await fetch('/api/animals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      })
      const animals = await animalsResponse.json()

      // Carregar vendas reais do banco
      const salesResponse = await fetch('/api/sales', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      })
      const sales = await salesResponse.json()

      setRealData({
        animals: animals || [],
        sales: sales || [],
        loading: false
      })
    } catch (error) {
      console.error('Erro ao carregar dados reais:', error)
      setRealData({
        animals: [],
        sales: [],
        loading: false
      })
    }
  }

  // Calcular métricas baseadas nos dados reais do banco
  const calculateMetrics = () => {
    if (realData.loading) {
      return {
        totalInvested: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgROI: 0,
        activeAnimals: 0,
        soldAnimals: 0,
        conversionRate: 0
      }
    }

    const { animals, sales } = realData

    // Calcular investimento total (soma dos custos de todos os animais)
    const totalInvested = animals.reduce((acc, animal) => {
      const costs = animal.costs || []
      const totalCost = costs
        .filter(cost => cost.tipo !== 'VENDA')
        .reduce((sum, cost) => sum + cost.valor, 0)
      return acc + totalCost
    }, 0)

    // Calcular receita total das vendas
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.valor, 0)

    // Calcular lucro total (receita - custos - comissões - taxas)
    let totalProfit = 0
    sales.forEach(sale => {
      const animal = animals.find(a => a.id === sale.animalId)
      if (animal) {
        const costs = animal.costs || []
        const totalCost = costs
          .filter(cost => cost.tipo !== 'VENDA')
          .reduce((sum, cost) => sum + cost.valor, 0)
        
        const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
        totalProfit += profit
      }
    })

    // Calcular ROI médio
    let totalROI = 0
    let validROICount = 0

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
        }
      }
    })

    const avgROI = validROICount > 0 ? totalROI / validROICount : 0

    // Contar animais ativos e vendidos
    const activeAnimals = animals.filter(a => a.status === 'ATIVO').length
    const soldAnimals = sales.length
    const conversionRate = animals.length > 0 ? (soldAnimals / animals.length) * 100 : 0

    return {
      totalInvested,
      totalRevenue,
      totalProfit,
      avgROI,
      activeAnimals,
      soldAnimals,
      conversionRate
    }
  }

  const metrics = calculateMetrics()

  const cards = [
    {
      id: 'invested',
      title: 'Total Investido',
      value: `R$ ${metrics.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: realData.loading ? '...' : 'Atual',
      trend: 'stable',
      icon: '💰',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Investimento total em todos os animais',
      details: `${realData.animals.length} animais cadastrados`
    },
    {
      id: 'revenue',
      title: 'Receita Total',
      value: `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: realData.loading ? '...' : (metrics.soldAnimals > 0 ? 'Com vendas' : 'Sem vendas'),
      trend: metrics.soldAnimals > 0 ? 'up' : 'stable',
      icon: '📈',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Receita com vendas realizadas',
      details: `${metrics.soldAnimals} animais vendidos`
    },
    {
      id: 'profit',
      title: 'Lucro Líquido',
      value: `R$ ${metrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: realData.loading ? '...' : (metrics.totalProfit >= 0 ? 'Positivo' : 'Negativo'),
      trend: metrics.totalProfit >= 0 ? 'up' : 'down',
      icon: metrics.totalProfit >= 0 ? '🎯' : '📉',
      color: metrics.totalProfit >= 0 ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-orange-600',
      bgColor: metrics.totalProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20',
      description: 'Lucro líquido das operações',
      details: `Margem: ${metrics.totalRevenue > 0 ? ((metrics.totalProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%`
    },
    {
      id: 'roi',
      title: 'ROI Médio',
      value: `${metrics.avgROI.toFixed(1)}%`,
      change: realData.loading ? '...' : (metrics.avgROI > 0 ? 'Positivo' : 'Neutro'),
      trend: metrics.avgROI > 0 ? 'up' : 'stable',
      icon: '📊',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Retorno médio sobre investimento',
      details: `Taxa de conversão: ${metrics.conversionRate.toFixed(1)}%`
    },
    {
      id: 'active',
      title: 'Animais Ativos',
      value: metrics.activeAnimals.toString(),
      change: realData.loading ? '...' : 'Atual',
      trend: 'stable',
      icon: '🐄',
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Animais ativos no rebanho',
      details: `${realData.animals.length > 0 ? ((metrics.activeAnimals / realData.animals.length) * 100).toFixed(1) : 0}% do rebanho`
    },
    {
      id: 'sold',
      title: 'Animais Vendidos',
      value: metrics.soldAnimals.toString(),
      change: metrics.soldAnimals > 0 ? '+1' : '0',
      trend: metrics.soldAnimals > 0 ? 'up' : 'stable',
      icon: '💰',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'Animais vendidos no período',
      details: `Taxa de conversão: ${metrics.conversionRate.toFixed(1)}%`
    },
    {
      id: 'performance',
      title: 'Performance',
      value: metrics.avgROI > 15 ? 'Excelente' : metrics.avgROI > 5 ? 'Boa' : 'Regular',
      change: realData.loading ? '...' : 'Atual',
      trend: 'stable',
      icon: metrics.avgROI > 15 ? '🏆' : metrics.avgROI > 5 ? '⭐' : '📈',
      color: 'from-teal-500 to-green-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'Avaliação geral do desempenho',
      details: `Meta: ROI > 20%`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={() => onReportClick(card.id)}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`
            relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 transform
            ${hoveredCard === card.id ? 'scale-105 shadow-2xl' : 'hover:scale-102 shadow-lg'}
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            hover:border-transparent
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`}></div>
          
          {/* Hover Effect */}
          <div className={`
            absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity duration-300
            ${hoveredCard === card.id ? 'opacity-10' : ''}
          `}></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-xs font-semibold flex items-center
                ${card.trend === 'up' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
              `}>
                <span className="mr-1">{card.trend === 'up' ? '↗️' : '↘️'}</span>
                {card.change}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {card.details}
              </p>
            </div>

            {/* Progress Bar (simulado) */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${card.color} h-2 rounded-full transition-all duration-1000`}
                  style={{ 
                    width: `${Math.min(100, Math.abs(parseFloat(card.change)) * 5)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Click Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                <span className="text-xs">📊</span>
              </div>
            </div>
          </div>

          {/* Animated Border */}
          <div className={`
            absolute inset-0 rounded-2xl border-2 border-transparent
            ${hoveredCard === card.id ? `bg-gradient-to-r ${card.color} p-[2px]` : ''}
          `}>
            {hoveredCard === card.id && (
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}