import { useState, useEffect } from 'react'

export default function AnimalTimeline({ animalId }) {
  const [animals, setAnimals] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(animalId)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  
  useEffect(() => {
    fetchAnimals()
  }, [])

  // Atualizar dados a cada 5 segundos para capturar mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnimals()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Escutar eventos de foco da janela para atualizar quando voltar
  useEffect(() => {
    const handleFocus = () => {
      fetchAnimals()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchAnimals = async () => {
    try {
      if (!loading) setUpdating(true)
      
      // Adicionar timestamp para evitar cache
      const response = await fetch(`/api/animals?t=${Date.now()}`)
      const data = await response.json()
      setAnimals(data)
      if (!selectedAnimal && data.length > 0) {
        setSelectedAnimal(data[0].id)
      }
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Erro ao carregar animais:', error)
    } finally {
      setLoading(false)
      setUpdating(false)
    }
  }
  
  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const animal = animals && animals.length > 0 ? animals.find(a => a.id === selectedAnimal) : null

  if (!animal) {
    return (
      <div className="card p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">🐄</div>
          <h3 className="text-lg font-medium mb-2">Nenhum animal selecionado</h3>
          <p>Selecione um animal para ver sua timeline completa</p>
        </div>
      </div>
    )
  }

  // Gerar timeline baseado APENAS nos dados reais do banco
  const generateTimeline = (animal) => {
    const events = []

    // Adicionar nascimento se existir data
    if (animal.data_nascimento) {
      events.push({
        id: 'nascimento',
        date: animal.data_nascimento,
        type: 'nascimento',
        title: 'Nascimento',
        description: `${animal.sexo} • ${animal.raca} • ${animal.serie || ''} ${animal.rg || ''}`,
        cost: 0,
        icon: '🍼',
        color: 'bg-green-500'
      })
    }

    // Adicionar APENAS custos reais do banco
    if (animal.custos && animal.custos.length > 0) {
      animal.custos.forEach((custo) => {
        events.push({
          id: `custo-${custo.id}`,
          date: custo.data,
          type: 'custo',
          title: custo.tipo + (custo.subtipo ? ` - ${custo.subtipo}` : ''),
          description: custo.observacoes || 'Custo registrado',
          cost: parseFloat(custo.valor) || 0,
          icon: getCostIcon(custo.tipo),
          color: getCostColor(custo.tipo)
        })
      })
    }

    // Adicionar venda APENAS se existir no banco
    if (animal.vendas && animal.vendas.length > 0) {
      animal.vendas.forEach((venda) => {
        events.push({
          id: `venda-${venda.id}`,
          date: venda.data_venda,
          type: 'venda',
          title: 'Venda do Animal',
          description: `Vendido por R$ ${parseFloat(venda.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          cost: -parseFloat(venda.valor), // Negativo porque é receita
          icon: '💰',
          color: 'bg-yellow-500'
        })
      })
    }

    // Ordenar por data
    return events.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getCostIcon = (tipo) => {
    const icons = {
      'Aquisição': '🛒',
      'Alimentação': '🌾',
      'DNA': '🧬',
      'Medicamentos': '💊',
      'Veterinários': '👨‍⚕️',
      'Mão de Obra Proporcional': '👷',
      'Frete / Transporte': '🚛',
      'Outros': '📋'
    }
    return icons[tipo] || '📋'
  }

  const getCostColor = (tipo) => {
    const colors = {
      'Aquisição': 'bg-purple-500',
      'Alimentação': 'bg-green-500',
      'DNA': 'bg-blue-500',
      'Medicamentos': 'bg-red-500',
      'Veterinários': 'bg-indigo-500',
      'Mão de Obra Proporcional': 'bg-orange-500',
      'Frete / Transporte': 'bg-gray-500',
      'Outros': 'bg-gray-400'
    }
    return colors[tipo] || 'bg-gray-400'
  }

  const timeline = generateTimeline(animal)
  const totalCustos = timeline.filter(e => e.cost > 0).reduce((acc, e) => acc + e.cost, 0)
  const totalReceitas = timeline.filter(e => e.cost < 0).reduce((acc, e) => acc + Math.abs(e.cost), 0)

  return (
    <div className="space-y-6">
      {/* Seletor de Animal */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecionar Animal para Timeline
          </label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
            </span>
            <button
              onClick={fetchAnimals}
              disabled={updating}
              className={`px-3 py-1 text-white text-xs rounded-md transition-colors ${
                updating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              title="Atualizar dados"
            >
              {updating ? '🔄 Atualizando...' : '🔄 Atualizar'}
            </button>
          </div>
        </div>
        <select
          value={selectedAnimal || ''}
          onChange={(e) => setSelectedAnimal(parseInt(e.target.value))}
          className="input-field max-w-md"
        >
          <option value="">Selecione um animal...</option>
          {animals && animals.map((animal) => (
            <option key={animal.id} value={animal.id}>
              {animal.serie || 'S/N'} {animal.rg || 'S/N'} - {animal.raca} ({animal.status})
            </option>
          ))}
        </select>
      </div>

      {/* Resumo do Animal */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {animal.serie || 'S/N'} {animal.rg || 'S/N'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {animal.raca} • {animal.sexo} • {animal.status}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl mb-2">
              {animal.sexo === 'Macho' ? '🐂' : '🐄'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              R$ {totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Total Investido</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Total Recebido</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className={`text-2xl font-bold ${
              (totalReceitas - totalCustos) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              R$ {(totalReceitas - totalCustos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Resultado</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📅 Timeline Completa
        </h3>
        
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex items-start">
                {/* Ícone do evento */}
                <div className={`${event.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg z-10`}>
                  {event.icon}
                </div>
                
                {/* Conteúdo do evento */}
                <div className="ml-6 flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                        {event.cost !== 0 && (
                          <span className={`text-lg font-bold ${
                            event.cost > 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {event.cost > 0 ? '-' : '+'}R$ {Math.abs(event.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                    
                    {/* Progresso visual para custos acumulados */}
                    {index > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Custo Acumulado:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            R$ {timeline.slice(0, index + 1)
                              .filter(e => e.cost > 0)
                              .reduce((acc, e) => acc + e.cost, 0)
                              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análise de Performance - APENAS se houver vendas reais */}
      {animal.vendas && animal.vendas.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Análise de Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Distribuição de Custos</h4>
              <div className="space-y-2">
                {Object.entries(
                  timeline
                    .filter(e => e.cost > 0)
                    .reduce((acc, e) => {
                      const tipo = e.type === 'custo' ? e.title.split(' - ')[0] : e.type
                      acc[tipo] = (acc[tipo] || 0) + e.cost
                      return acc
                    }, {})
                ).map(([tipo, valor]) => (
                  <div key={tipo} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tipo}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Métricas</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
                  <span className={`font-bold ${
                    (totalReceitas - totalCustos) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {totalCustos > 0 ? ((totalReceitas - totalCustos) / totalCustos * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data de Nascimento</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há dados suficientes */}
      {timeline.length === 0 && (
        <div className="card p-6 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Timeline vazia</h3>
            <p>Este animal ainda não possui custos ou eventos registrados.</p>
            <p className="text-sm mt-2">Adicione custos ou registre eventos para ver a timeline completa.</p>
          </div>
        </div>
      )}
    </div>
  )
}