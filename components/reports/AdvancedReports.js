import { useState } from 'react'
import { mockAnimals } from '../../services/mockData'

export default function AdvancedReports() {
  const [selectedReport, setSelectedReport] = useState('profitability')
  const [dateRange, setDateRange] = useState('2023')
  const [exportFormat, setExportFormat] = useState('pdf')

  const reports = [
    {
      id: 'profitability',
      title: '💰 Análise de Lucratividade',
      description: 'Relatório detalhado de lucros e perdas por animal',
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
      category: 'Financeiro'
    },
    {
      id: 'productivity',
      title: '📈 Produtividade do Rebanho',
      description: 'Métricas de performance e eficiência',
      icon: '📈',
      color: 'from-blue-500 to-cyan-600',
      category: 'Performance'
    },
    {
      id: 'breeding',
      title: '🐄 Relatório Reprodutivo',
      description: 'Análise de nascimentos, gestações e fertilidade',
      icon: '🐄',
      color: 'from-pink-500 to-rose-600',
      category: 'Reprodução'
    },
    {
      id: 'health',
      title: '🏥 Relatório Sanitário',
      description: 'Controle de saúde, vacinas e medicamentos',
      icon: '🏥',
      color: 'from-red-500 to-orange-600',
      category: 'Saúde'
    },
    {
      id: 'feed',
      title: '🌾 Análise de Alimentação',
      description: 'Custos e eficiência alimentar',
      icon: '🌾',
      color: 'from-yellow-500 to-amber-600',
      category: 'Nutrição'
    },
    {
      id: 'genetics',
      title: '🧬 Relatório Genético',
      description: 'Análise de DNA, paternidade e melhoramento',
      icon: '🧬',
      color: 'from-purple-500 to-indigo-600',
      category: 'Genética'
    },
    {
      id: 'inventory',
      title: '📦 Controle de Estoque',
      description: 'Medicamentos, ração e suprimentos',
      icon: '📦',
      color: 'from-gray-500 to-slate-600',
      category: 'Estoque'
    },
    {
      id: 'compliance',
      title: '📋 Conformidade Legal',
      description: 'Documentação e regulamentações',
      icon: '📋',
      color: 'from-teal-500 to-green-600',
      category: 'Legal'
    },
    {
      id: 'forecast',
      title: '🔮 Projeções Futuras',
      description: 'Previsões e planejamento estratégico',
      icon: '🔮',
      color: 'from-indigo-500 to-purple-600',
      category: 'Estratégia'
    }
  ]

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '📱',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => shareToWhatsApp()
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => shareToEmail()
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => shareToTelegram()
    },
    {
      id: 'print',
      name: 'Imprimir',
      icon: '🖨️',
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => printReport()
    }
  ]

  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: '📄', description: 'Documento formatado' },
    { id: 'excel', name: 'Excel', icon: '📊', description: 'Planilha editável' },
    { id: 'word', name: 'Word', icon: '📝', description: 'Documento editável' },
    { id: 'csv', name: 'CSV', icon: '📋', description: 'Dados tabulares' }
  ]

  const shareToWhatsApp = () => {
    const message = `📊 *Relatório Beef_Sync*\n\n🐄 Total de Animais: ${mockAnimals.length}\n💰 Investimento Total: R$ ${mockAnimals.reduce((acc, a) => acc + a.custoTotal, 0).toLocaleString('pt-BR')}\n\n📈 Gerado pelo Beef_Sync v3.0 Pro`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const shareToEmail = () => {
    const subject = 'Relatório Beef_Sync - Gestão do Rebanho'
    const body = `Olá!\n\nSegue em anexo o relatório do rebanho gerado pelo sistema Beef_Sync.\n\n📊 Resumo:\n• Total de Animais: ${mockAnimals.length}\n• Animais Ativos: ${mockAnimals.filter(a => a.situacao === 'Ativo').length}\n• Investimento Total: R$ ${mockAnimals.reduce((acc, a) => acc + a.custoTotal, 0).toLocaleString('pt-BR')}\n\nAtenciosamente,\nSistema Beef_Sync v3.0 Pro`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  const shareToTelegram = () => {
    const message = `📊 Relatório Beef_Sync\n\n🐄 Animais: ${mockAnimals.length}\n💰 Investimento: R$ ${mockAnimals.reduce((acc, a) => acc + a.custoTotal, 0).toLocaleString('pt-BR')}\n\n📈 Beef_Sync v3.0 Pro`
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://beef-sync.com')}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const printReport = () => {
    window.print()
  }

  const generateReport = () => {
    alert(`📊 Gerando relatório: ${reports.find(r => r.id === selectedReport)?.title}\n📅 Período: ${dateRange}\n📄 Formato: ${exportFormats.find(f => f.id === exportFormat)?.name}\n\n✅ Relatório será baixado em instantes!`)
  }

  const categories = [...new Set(reports.map(r => r.category))]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center">
                📊 Relatórios Avançados
                <span className="ml-4 px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  Pro Analytics
                </span>
              </h1>
              <p className="text-indigo-100 text-lg">
                Relatórios profissionais com compartilhamento inteligente
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{reports.length}</div>
              <div className="text-indigo-200">Tipos de Relatórios</div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📅 Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="2023">2023 - Ano Completo</option>
              <option value="2023-q4">2023 - 4º Trimestre</option>
              <option value="2023-12">Dezembro 2023</option>
              <option value="last-30">Últimos 30 dias</option>
              <option value="last-90">Últimos 90 dias</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📄 Formato
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {exportFormats.map(format => (
                <option key={format.id} value={format.id}>
                  {format.icon} {format.name} - {format.description}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end space-x-2">
            <button
              onClick={generateReport}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Gerar Relatório</span>
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Relatórios por Categoria */}
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            📁 {category}
            <span className="ml-3 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
              {reports.filter(r => r.category === category).length} relatórios
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.filter(r => r.category === category).map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`
                  relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl
                  ${selectedReport === report.id 
                    ? 'ring-4 ring-blue-500 shadow-2xl' 
                    : 'hover:shadow-xl'
                  }
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                `}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${report.color} opacity-5`}></div>
                
                {/* Selected Indicator */}
                {selectedReport === report.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110`}>
                    <span className="text-3xl text-white">{report.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {report.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${report.color} text-white`}>
                      {report.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📊 Disponível
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-2">👆</div>
                      <div className="text-sm font-medium">Clique para selecionar</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Painel de Compartilhamento */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          📤 Compartilhar Relatório
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className={`
                ${option.color} text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                flex flex-col items-center space-y-2
              `}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Share Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">47</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Compartilhamentos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Impressões</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview do Relatório Selecionado */}
      {selectedReport && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              📋 Preview: {reports.find(r => r.id === selectedReport)?.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                ✅ Pronto
              </span>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                👁️ Visualizar
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {reports.find(r => r.id === selectedReport)?.icon}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {reports.find(r => r.id === selectedReport)?.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {reports.find(r => r.id === selectedReport)?.description}
            </p>
            
            {/* Sample Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockAnimals.length}
                </div>
                <div className="text-sm text-gray-500">Total de Registros</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {mockAnimals.reduce((acc, a) => acc + a.custoTotal, 0).toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">Valor Total</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dateRange}
                </div>
                <div className="text-sm text-gray-500">Período</div>
              </div>
            </div>

            <button
              onClick={generateReport}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <span>🚀</span>
              <span>Gerar Este Relatório</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}