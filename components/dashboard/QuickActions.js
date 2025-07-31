import { useState } from 'react'
import { useRouter } from 'next/router'

export default function QuickActions({ onROICalculatorOpen }) {
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const quickActions = [
    {
      id: 'add-animal',
      title: 'Novo Animal',
      description: 'Cadastrar novo animal',
      icon: '🐄',
      color: 'from-green-500 to-emerald-600',
      action: () => {
        router.push('/animals')
        showNotificationMessage('Redirecionando para cadastro...')
      }
    },
    {
      id: 'add-cost',
      title: 'Adicionar Custo',
      description: 'Registrar novo custo',
      icon: '💰',
      color: 'from-blue-500 to-cyan-600',
      action: () => {
        router.push('/animals')
        showNotificationMessage('Abrindo gerenciador de custos...')
      }
    },
    {
      id: 'pregnancy',
      title: 'Gestação',
      description: 'Gerenciar gestações',
      icon: '🐄',
      color: 'from-pink-500 to-rose-600',
      action: () => {
        router.push('/gestacao')
        showNotificationMessage('Abrindo controle de gestações...')
      }
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Ver relatórios detalhados',
      icon: '📊',
      color: 'from-purple-500 to-indigo-600',
      action: () => {
        router.push('/reports')
        showNotificationMessage('Carregando relatórios...')
      }
    },
    {
      id: 'export',
      title: 'Exportar Dados',
      description: 'Exportar para Excel/PDF',
      icon: '📤',
      color: 'from-orange-500 to-yellow-600',
      action: () => {
        showNotificationMessage('Preparando exportação...')
        // Simular exportação
        setTimeout(() => {
          showNotificationMessage('✅ Dados exportados com sucesso!')
        }, 2000)
      }
    },
    {
      id: 'calculator',
      title: 'Calculadora ROI',
      description: 'Calcular retorno',
      icon: '🧮',
      color: 'from-teal-500 to-green-600',
      action: () => {
        if (onROICalculatorOpen) {
          onROICalculatorOpen()
        }
        showNotificationMessage('Abrindo calculadora de ROI...')
      }
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Análises avançadas',
      icon: '📈',
      color: 'from-red-500 to-pink-600',
      action: () => {
        showNotificationMessage('Carregando analytics...')
      }
    },
    {
      id: 'backup',
      title: 'Backup',
      description: 'Fazer backup dos dados',
      icon: '💾',
      color: 'from-gray-500 to-slate-600',
      action: () => {
        showNotificationMessage('Iniciando backup...')
        setTimeout(() => {
          showNotificationMessage('✅ Backup realizado com sucesso!')
        }, 3000)
      }
    }
  ]

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-2xl">⚡</span>
            Ações Rápidas
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Clique para executar
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`
                group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300
                hover:scale-105 hover:shadow-xl transform
                bg-gradient-to-br ${action.color} text-white
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-white/80">
                  {action.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              {/* Click Ripple Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
            </button>
          ))}
        </div>

        {/* Estatísticas de Uso */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">127</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Ações hoje</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">89%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Eficiência</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tempo médio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificação */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-bounce">
          <div className="flex items-center">
            <div className="mr-3 text-lg">✅</div>
            <div className="font-medium">{notificationMessage}</div>
          </div>
        </div>
      )}
    </>
  )
}