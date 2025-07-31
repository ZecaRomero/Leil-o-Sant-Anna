import { useState } from 'react'
import { mockAnimals } from '../../services/mockData'

export default function MonthlyReport() {
  const [selectedYear, setSelectedYear] = useState(2023)
  const [selectedMonth, setSelectedMonth] = useState(12)
  const [viewType, setViewType] = useState('summary')

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Simular dados mensais (em um sistema real, isso viria do backend)
  const generateMonthlyData = () => {
    const monthlyData = {}
    
    for (let month = 1; month <= 12; month++) {
      // Simular custos mensais baseados nos dados reais
      const baseCosts = mockAnimals.reduce((acc, animal) => {
        const monthlyCost = animal.custoTotal / 12 // Distribuir custos ao longo do ano
        return acc + monthlyCost
      }, 0)

      // Adicionar variação mensal (simulada)
      const variation = 1 + (Math.sin(month / 2) * 0.3) // Variação sazonal
      const monthlyCosts = baseCosts * variation

      // Simular receitas (apenas alguns meses têm vendas)
      const monthlyRevenue = month % 3 === 0 ? monthlyCosts * 1.2 : 0

      monthlyData[month] = {
        costs: monthlyCosts,
        revenue: monthlyRevenue,
        profit: monthlyRevenue - (monthlyRevenue > 0 ? monthlyCosts * 0.8 : 0),
        animals: {
          born: Math.floor(Math.random() * 3) + 1,
          sold: monthlyRevenue > 0 ? Math.floor(Math.random() * 2) + 1 : 0,
          died: Math.random() > 0.8 ? 1 : 0
        },
        events: []
      }

      // Adicionar eventos simulados
      if (month === 3 || month === 9) {
        monthlyData[month].events.push('Vacinação em massa')
      }
      if (month === 6) {
        monthlyData[month].events.push('Exames reprodutivos')
      }
      if (monthlyRevenue > 0) {
        monthlyData[month].events.push('Vendas realizadas')
      }
    }

    return monthlyData
  }

  const monthlyData = generateMonthlyData()
  const currentMonthData = monthlyData[selectedMonth]

  // Calcular totais anuais
  const yearlyTotals = Object.values(monthlyData).reduce((acc, month) => ({
    costs: acc.costs + month.costs,
    revenue: acc.revenue + month.revenue,
    profit: acc.profit + month.profit,
    animalsBorn: acc.animalsBorn + month.animals.born,
    animalsSold: acc.animalsSold + month.animals.sold,
    animalsDied: acc.animalsDied + month.animals.died
  }), { costs: 0, revenue: 0, profit: 0, animalsBorn: 0, animalsSold: 0, animalsDied: 0 })

  const renderSummaryView = () => (
    <div className="space-y-6">
      {/* Métricas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Custos</h3>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                R$ {currentMonthData.costs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Receitas</h3>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                R$ {currentMonthData.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Lucro</h3>
              <p className={`text-2xl font-bold ${currentMonthData.profit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                R$ {currentMonthData.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-3xl">{currentMonthData.profit >= 0 ? '🎯' : '📉'}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Margem</h3>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {currentMonthData.revenue > 0 ? ((currentMonthData.profit / currentMonthData.revenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Movimentação de Animais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🐄</span>
          Movimentação de Animais - {months[selectedMonth - 1]}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl mb-2">🐣</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentMonthData.animals.born}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Nascimentos</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentMonthData.animals.sold}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vendas</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl mb-2">💔</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currentMonthData.animals.died}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Óbitos</div>
          </div>
        </div>
      </div>

      {/* Eventos do Mês */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">📅</span>
          Eventos e Atividades
        </h3>
        
        {currentMonthData.events.length > 0 ? (
          <div className="space-y-3">
            {currentMonthData.events.map((event, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-900 dark:text-white">{event}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Nenhum evento registrado para este mês
          </p>
        )}
      </div>
    </div>
  )

  const renderChartView = () => (
    <div className="space-y-6">
      {/* Gráfico de Linha - Evolução Mensal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-2">📈</span>
          Evolução Mensal - {selectedYear}
        </h3>
        
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="50"
                y1={i * 40 + 20}
                x2="750"
                y2={i * 40 + 20}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-300 dark:text-gray-600"
              />
            ))}

            {/* Linha de Custos */}
            <polyline
              fill="none"
              stroke="#EF4444"
              strokeWidth="3"
              points={Object.entries(monthlyData).map(([month, data], index) => {
                const x = 50 + (index * 60)
                const y = 180 - (data.costs / Math.max(...Object.values(monthlyData).map(d => d.costs)) * 140)
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Linha de Receitas */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              points={Object.entries(monthlyData).map(([month, data], index) => {
                const x = 50 + (index * 60)
                const maxRevenue = Math.max(...Object.values(monthlyData).map(d => d.revenue))
                const y = maxRevenue > 0 ? 180 - (data.revenue / maxRevenue * 140) : 180
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Labels dos meses */}
            {months.map((month, index) => (
              <text
                key={index}
                x={50 + (index * 60)}
                y={195}
                textAnchor="middle"
                className="text-xs fill-current text-gray-500"
              >
                {month.substring(0, 3)}
              </text>
            ))}
          </svg>
        </div>

        {/* Legenda */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Custos</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Receitas</span>
          </div>
        </div>
      </div>

      {/* Comparativo Mensal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-2">📊</span>
          Comparativo Mensal
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Mês</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Custos</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Receitas</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Lucro</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Margem</th>
                <th className="text-center p-3 font-semibold text-gray-900 dark:text-white">Vendas</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, index) => {
                const data = monthlyData[index + 1]
                const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100) : 0
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index + 1 === selectedMonth ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{month}</td>
                    <td className="p-3 text-center text-red-600 dark:text-red-400">
                      R$ {data.costs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center text-green-600 dark:text-green-400">
                      R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-center font-bold ${data.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {data.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center text-gray-600 dark:text-gray-400">
                      {margin.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center text-gray-600 dark:text-gray-400">
                      {data.animals.sold}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              📅 Relatório Mensal
              <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {months[selectedMonth - 1]} {selectedYear}
              </span>
            </h1>
            <p className="text-purple-100 text-lg">
              Análise detalhada da performance mensal do rebanho
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              R$ {yearlyTotals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-purple-200">Lucro Anual</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewType('summary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewType === 'summary'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📊 Resumo
            </button>
            <button
              onClick={() => setViewType('chart')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewType === 'chart'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📈 Gráficos
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {viewType === 'summary' ? renderSummaryView() : renderChartView()}

      {/* Resumo Anual */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-3">📈</span>
          Resumo Anual {selectedYear}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              R$ {yearlyTotals.costs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Custos Totais</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              R$ {yearlyTotals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Receitas Totais</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className={`text-lg font-bold ${yearlyTotals.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              R$ {yearlyTotals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Lucro Total</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {yearlyTotals.animalsBorn}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Nascimentos</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {yearlyTotals.animalsSold}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vendas</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {yearlyTotals.revenue > 0 ? ((yearlyTotals.profit / yearlyTotals.revenue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Margem Anual</div>
          </div>
        </div>
      </div>
    </div>
  )
}