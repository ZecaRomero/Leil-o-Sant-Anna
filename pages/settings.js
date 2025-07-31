import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { usuarios } from '../services/mockData'
import { 
  UserIcon, 
  CogIcon, 
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

export default function Settings({ darkMode, toggleDarkMode }) {
  const [activeTab, setActiveTab] = useState('users')
  const [userList, setUserList] = useState(usuarios)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const tabs = [
    { id: 'users', name: 'Usuários', icon: UserIcon },
    { id: 'system', name: 'Sistema', icon: CogIcon },
    { id: 'security', name: 'Segurança', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notificações', icon: BellIcon },
    { id: 'backup', name: 'Backup', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'reports', name: 'Relatórios', icon: ClipboardDocumentListIcon },
    { id: 'monitoring', name: 'Monitoramento', icon: EyeIcon },
    { id: 'performance', name: 'Performance', icon: CpuChipIcon },
  ]

  const roles = [
    { 
      id: 'Desenvolvedor', 
      name: 'Desenvolvedor', 
      permissions: ['all'],
      description: 'Acesso total ao sistema'
    },
    { 
      id: 'Dono', 
      name: 'Dono', 
      permissions: ['reports', 'financial'],
      description: 'Acesso a relatórios e financeiro'
    },
    { 
      id: 'Gerente', 
      name: 'Gerente', 
      permissions: ['reports', 'financial', 'management'],
      description: 'Mesmo privilégios do Dono'
    },
    { 
      id: 'Capataz', 
      name: 'Capataz', 
      permissions: ['birth', 'death', 'entry', 'exit', 'reports_view'],
      description: 'Nascimento, morte, entrada/saída e visualizar relatórios'
    }
  ]

  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUserList(userList.map(u => u.id === editingUser.id ? { ...u, ...userData } : u))
    } else {
      const newUser = {
        ...userData,
        id: Math.max(...userList.map(u => u.id)) + 1
      }
      setUserList([...userList, newUser])
    }
    setShowUserForm(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (id) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUserList(userList.filter(u => u.id !== id))
    }
  }

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gerenciamento de Usuários
        </h3>
        <button
          onClick={() => {
            setEditingUser(null)
            setShowUserForm(true)
          }}
          className="btn-primary"
        >
          Novo Usuário
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Permissões
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {userList.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nome}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Desenvolvedor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    user.role === 'Dono' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    user.role === 'Gerente' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.permissoes.includes('all') ? 'Todas' : user.permissoes.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user)
                        setShowUserForm(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      disabled={user.id === 1} // Não pode excluir o desenvolvedor
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Descrição das Funções
        </h4>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {role.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {role.description}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {role.permissions.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configurações do Sistema
      </h3>
      
      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Configurações Gerais
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Fazenda
            </label>
            <input
              type="text"
              defaultValue="Fazenda Sant Anna"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Moeda Padrão
            </label>
            <select className="input-field">
              <option value="BRL">Real Brasileiro (R$)</option>
              <option value="USD">Dólar Americano ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuso Horário
            </label>
            <select className="input-field">
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/New_York">Nova York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Configurações de DNA
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor DNA Paternidade (R$)
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="40.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor DNA Genômica (R$)
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="80.00"
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configurações de Segurança
      </h3>
      
      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Autenticação
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Autenticação de Dois Fatores (2FA)
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Adiciona uma camada extra de segurança
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Sessões Múltiplas
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Permitir login simultâneo em múltiplos dispositivos
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tempo de Expiração da Sessão (minutos)
            </label>
            <input
              type="number"
              defaultValue="60"
              min="15"
              max="480"
              className="input-field w-32"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Logs de Auditoria
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Registrar Ações dos Usuários
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Manter histórico de todas as ações realizadas
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Retenção de Logs (dias)
            </label>
            <input
              type="number"
              defaultValue="90"
              min="30"
              max="365"
              className="input-field w-32"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Política de Senhas
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comprimento Mínimo
            </label>
            <input
              type="number"
              defaultValue="8"
              min="6"
              max="20"
              className="input-field w-32"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="require-uppercase" className="mr-2" defaultChecked />
              <label htmlFor="require-uppercase" className="text-sm text-gray-700 dark:text-gray-300">
                Exigir letras maiúsculas
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="require-numbers" className="mr-2" defaultChecked />
              <label htmlFor="require-numbers" className="text-sm text-gray-700 dark:text-gray-300">
                Exigir números
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="require-symbols" className="mr-2" />
              <label htmlFor="require-symbols" className="text-sm text-gray-700 dark:text-gray-300">
                Exigir símbolos especiais
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Salvar Configurações de Segurança
        </button>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configurações de Notificações
      </h3>
      
      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Alertas do Sistema
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Notificações de Vendas
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Receber alertas quando uma venda for realizada
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Alertas de Custo Alto
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Notificar quando custos estiverem acima da média
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Lembretes de Vacinação
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Alertas para vacinações pendentes
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Relatórios Automáticos
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Notificar quando relatórios estiverem prontos
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Configurações de E-mail
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-mail para Notificações
            </label>
            <input
              type="email"
              placeholder="admin@fazenda.com"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequência de Resumos
            </label>
            <select className="input-field">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="never">Nunca</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Salvar Configurações de Notificações
        </button>
      </div>
    </div>
  )

  const renderBackupTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Backup e Restauração
      </h3>
      
      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Backup Automático
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Backup Automático Ativado
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Realizar backup automático dos dados
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequência do Backup
            </label>
            <select className="input-field">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Horário do Backup
            </label>
            <input
              type="time"
              defaultValue="02:00"
              className="input-field w-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Retenção de Backups (dias)
            </label>
            <input
              type="number"
              defaultValue="30"
              min="7"
              max="365"
              className="input-field w-32"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Backup Manual
        </h4>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Realize um backup manual dos seus dados a qualquer momento.
          </p>
          
          <div className="flex space-x-4">
            <button className="btn-primary">
              🔄 Criar Backup Agora
            </button>
            <button className="btn-secondary">
              📥 Baixar Último Backup
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Último Backup Realizado
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📅 {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📊 Tamanho: 2.4 MB
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              ✅ Status: Sucesso
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Restauração
        </h4>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Restaure seus dados a partir de um backup anterior.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Selecionar Arquivo de Backup
            </label>
            <input
              type="file"
              accept=".backup,.json"
              className="input-field"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> A restauração substituirá todos os dados atuais. 
                Recomendamos fazer um backup antes de prosseguir.
              </div>
            </div>
          </div>

          <button className="btn-secondary">
            🔄 Restaurar Dados
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Salvar Configurações de Backup
        </button>
      </div>
    </div>
  )

  // Componente de gráfico de ondas animado
  const WaveChart = ({ data, color = "blue", height = 60 }) => {
    const [animationPhase, setAnimationPhase] = useState(0)
    
    useEffect(() => {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 360)
      }, 50)
      return () => clearInterval(interval)
    }, [])

    const generateWavePath = () => {
      const points = []
      const amplitude = height * 0.3
      const frequency = 0.02
      const phase = animationPhase * 0.1
      
      for (let x = 0; x <= 300; x += 5) {
        const y = height/2 + amplitude * Math.sin(frequency * x + phase)
        points.push(`${x},${y}`)
      }
      
      return `M0,${height} L${points.join(' L')} L300,${height} Z`
    }

    return (
      <div className="relative overflow-hidden rounded-lg">
        <svg width="300" height={height} className="absolute inset-0">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`rgb(59 130 246)`} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={`rgb(59 130 246)`} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path
            d={generateWavePath()}
            fill={`url(#gradient-${color})`}
            className="animate-pulse"
          />
        </svg>
        <div className="relative z-10 p-4 text-center">
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            {data.value}
          </div>
          <div className="text-sm text-white/80 drop-shadow">
            {data.label}
          </div>
        </div>
      </div>
    )
  }

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          📊 Analytics Avançado
        </h3>
        <div className="flex space-x-2">
          <button className="btn-secondary text-sm">📈 Exportar</button>
          <button className="btn-primary text-sm">🔄 Atualizar</button>
        </div>
      </div>

      {/* Métricas em Tempo Real com Gráficos de Onda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <WaveChart data={{ value: "1,247", label: "Animais Ativos" }} color="blue" />
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg overflow-hidden">
          <WaveChart data={{ value: "R$ 2.4M", label: "Valor Total" }} color="green" />
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
          <WaveChart data={{ value: "87%", label: "Taxa Sucesso" }} color="purple" />
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg overflow-hidden">
          <WaveChart data={{ value: "342", label: "Vendas/Mês" }} color="orange" />
        </div>
      </div>

      {/* Dashboard de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            📈 Crescimento do Rebanho
          </h4>
          <div className="space-y-4">
            {[
              { month: "Jan", value: 85, color: "bg-blue-500" },
              { month: "Fev", value: 92, color: "bg-green-500" },
              { month: "Mar", value: 78, color: "bg-yellow-500" },
              { month: "Abr", value: 96, color: "bg-purple-500" },
              { month: "Mai", value: 88, color: "bg-pink-500" },
              { month: "Jun", value: 94, color: "bg-indigo-500" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.month}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out animate-pulse`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-bold text-gray-900 dark:text-white">
                  {item.value}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            💰 Análise Financeira
          </h4>
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.73)}`}
                    className="text-green-500 animate-pulse"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">73%</div>
                    <div className="text-xs text-gray-500">ROI Médio</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">R$ 847K</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Receita</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">R$ 234K</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Custos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap de Atividades */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          🔥 Mapa de Calor - Atividades por Hora
        </h4>
        <div className="grid grid-cols-24 gap-1">
          {Array.from({ length: 24 * 7 }, (_, i) => {
            const intensity = Math.random()
            const opacity = intensity * 0.8 + 0.1
            return (
              <div
                key={i}
                className="w-4 h-4 rounded-sm bg-blue-500 hover:scale-110 transition-transform cursor-pointer"
                style={{ opacity }}
                title={`${Math.floor(i / 24)} dia, ${i % 24}h - ${Math.round(intensity * 100)}% atividade`}
              />
            )
          })}
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Menos ativo</span>
          <div className="flex space-x-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
              <div key={i} className="w-3 h-3 bg-blue-500 rounded-sm" style={{ opacity }} />
            ))}
          </div>
          <span>Mais ativo</span>
        </div>
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          📋 Central de Relatórios
        </h3>
        <button className="btn-primary flex items-center space-x-2">
          <span>➕</span>
          <span>Novo Relatório</span>
        </button>
      </div>

      {/* Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: "Relatório Financeiro", 
            icon: "💰", 
            description: "Análise completa de receitas e despesas",
            status: "Pronto",
            lastUpdate: "2 min atrás",
            color: "green"
          },
          { 
            title: "Inventário do Rebanho", 
            icon: "🐄", 
            description: "Contagem e status de todos os animais",
            status: "Processando",
            lastUpdate: "Atualizando...",
            color: "yellow"
          },
          { 
            title: "Performance Reprodutiva", 
            icon: "📊", 
            description: "Taxas de prenhez e nascimentos",
            status: "Agendado",
            lastUpdate: "Próx: 14:00",
            color: "blue"
          }
        ].map((report, index) => (
          <div key={index} className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{report.icon}</div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                report.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                report.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {report.status}
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {report.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {report.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{report.lastUpdate}</span>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Ver detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Relatórios Personalizados */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          🎯 Relatórios Personalizados
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Relatório
              </label>
              <select className="input-field">
                <option>Financeiro Detalhado</option>
                <option>Análise de Custos</option>
                <option>Performance por Animal</option>
                <option>Relatório de Vendas</option>
                <option>Análise Reprodutiva</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <input type="date" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtros Avançados
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Incluir animais vendidos</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Apenas fêmeas reprodutoras</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Incluir custos de DNA</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Preview do Relatório</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded">
                <span className="text-sm">Total de Animais</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded">
                <span className="text-sm">Receita Total</span>
                <span className="font-semibold text-green-600">R$ 847.320</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded">
                <span className="text-sm">Custos Totais</span>
                <span className="font-semibold text-red-600">R$ 234.180</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded border-t-2 border-blue-500">
                <span className="text-sm font-semibold">Lucro Líquido</span>
                <span className="font-bold text-blue-600">R$ 613.140</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <button className="w-full btn-primary">
                📊 Gerar Relatório Completo
              </button>
              <button className="w-full btn-secondary">
                📧 Enviar por E-mail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Relatórios */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          📚 Histórico de Relatórios
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3 font-semibold">Relatório</th>
                <th className="text-left p-3 font-semibold">Período</th>
                <th className="text-left p-3 font-semibold">Gerado em</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Relatório Mensal - Dezembro", period: "01/12 - 31/12", date: "02/01/2025", status: "Concluído" },
                { name: "Análise Trimestral Q4", period: "01/10 - 31/12", date: "01/01/2025", status: "Concluído" },
                { name: "Inventário Anual 2024", period: "01/01 - 31/12", date: "31/12/2024", status: "Processando" }
              ].map((report, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 font-medium">{report.name}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{report.period}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{report.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'Concluído' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                        📥 Baixar
                      </button>
                      <button className="text-gray-600 dark:text-gray-400 hover:underline text-xs">
                        👁️ Visualizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          👁️ Monitoramento em Tempo Real
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
          </div>
          <button className="btn-secondary text-sm">⚙️ Configurar</button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "CPU", value: "23%", status: "normal", icon: "🖥️" },
          { title: "Memória", value: "67%", status: "warning", icon: "💾" },
          { title: "Disco", value: "45%", status: "normal", icon: "💿" },
          { title: "Rede", value: "12%", status: "normal", icon: "🌐" }
        ].map((metric, index) => (
          <div key={index} className="card p-6 text-center">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {metric.title}
            </div>
            <div className={`w-full h-2 rounded-full ${
              metric.status === 'normal' ? 'bg-green-200 dark:bg-green-800' : 'bg-yellow-200 dark:bg-yellow-800'
            }`}>
              <div className={`h-full rounded-full transition-all duration-500 ${
                metric.status === 'normal' ? 'bg-green-500' : 'bg-yellow-500'
              }`} style={{ width: metric.value }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Logs em Tempo Real */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          📜 Logs do Sistema
        </h4>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-blue-400">INFO</span>
              <span>Sistema iniciado com sucesso</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">[{new Date(Date.now() - 1000).toLocaleTimeString()}]</span>
              <span className="text-green-400">SUCCESS</span>
              <span>Backup automático concluído</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">[{new Date(Date.now() - 2000).toLocaleTimeString()}]</span>
              <span className="text-yellow-400">WARNING</span>
              <span>Uso de memória acima de 60%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">[{new Date(Date.now() - 3000).toLocaleTimeString()}]</span>
              <span className="text-blue-400">INFO</span>
              <span>Usuário admin fez login</span>
            </div>
            <div className="flex items-center space-x-2 animate-pulse">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-green-400">LIVE</span>
              <span>Monitoramento ativo...</span>
              <span className="animate-spin">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            🚨 Alertas Ativos
          </h4>
          <div className="space-y-3">
            {[
              { type: "warning", message: "Uso de memória alto (67%)", time: "2 min atrás" },
              { type: "info", message: "Backup agendado para 02:00", time: "1 hora atrás" },
              { type: "success", message: "Todos os serviços operacionais", time: "5 min atrás" }
            ].map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
                'bg-green-50 border-green-400 dark:bg-green-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.message}</span>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            📊 Estatísticas de Acesso
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Usuários Online</span>
              <span className="font-bold text-green-600">7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sessões Ativas</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Requests/min</span>
              <span className="font-bold">847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          ⚡ Performance do Sistema
        </h3>
        <button className="btn-primary text-sm">🔧 Otimizar Sistema</button>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1.2s</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tempo de Resposta</div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">94%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Score de Performance</div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '94%' }}></div>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">💾</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">2.1GB</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Uso de Memória</div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '67%' }}></div>
          </div>
        </div>
      </div>

      {/* Gráfico de Performance Histórica */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          📈 Performance nas Últimas 24h
        </h4>
        <div className="relative h-64 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/20 rounded-lg p-4">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q50,150 100,120 T200,100 T300,80 T400,90 T500,70 T600,85 L600,240 L0,240 Z"
              fill="url(#performanceGradient)"
              className="animate-pulse"
            />
            <path
              d="M0,200 Q50,150 100,120 T200,100 T300,80 T400,90 T500,70 T600,85"
              stroke="rgb(59 130 246)"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
            />
          </svg>
          <div className="absolute top-4 left-4 text-sm text-gray-600 dark:text-gray-400">
            100%
          </div>
          <div className="absolute bottom-4 left-4 text-sm text-gray-600 dark:text-gray-400">
            0%
          </div>
          <div className="absolute bottom-4 right-4 text-sm text-gray-600 dark:text-gray-400">
            Agora
          </div>
        </div>
      </div>

      {/* Recomendações de Otimização */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          💡 Recomendações de Otimização
        </h4>
        <div className="space-y-4">
          {[
            { 
              title: "Limpeza de Cache", 
              description: "Limpar cache antigo pode liberar 340MB de memória",
              impact: "Alto",
              action: "Limpar Agora"
            },
            { 
              title: "Otimização de Banco", 
              description: "Reindexar tabelas pode melhorar performance em 15%",
              impact: "Médio",
              action: "Agendar"
            },
            { 
              title: "Compressão de Logs", 
              description: "Comprimir logs antigos pode liberar 120MB de disco",
              impact: "Baixo",
              action: "Executar"
            }
          ].map((rec, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{rec.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.impact === 'Alto' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  rec.impact === 'Médio' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {rec.impact}
                </span>
                <button className="btn-secondary text-sm">
                  {rec.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab()
      case 'system':
        return renderSystemTab()
      case 'security':
        return renderSecurityTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'backup':
        return renderBackupTab()
      case 'analytics':
        return renderAnalyticsTab()
      case 'reports':
        return renderReportsTab()
      case 'monitoring':
        return renderMonitoringTab()
      case 'performance':
        return renderPerformanceTab()
      default:
        return renderUsersTab()
    }
  }



  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie usuários, permissões e configurações do sistema
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderCurrentTab()}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserFormModal
          user={editingUser}
          isOpen={showUserForm}
          onClose={() => {
            setShowUserForm(false)
            setEditingUser(null)
          }}
          onSave={handleSaveUser}
          roles={roles}
        />
      )}
    </Layout>
  )
}

// Modal para formulário de usuário
function UserFormModal({ user, isOpen, onClose, onSave, roles }) {
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    role: user?.role || 'Capataz',
    permissoes: user?.permissoes || ['reports_view']
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedRole = roles.find(r => r.id === formData.role)
    onSave({
      ...formData,
      permissoes: selectedRole.permissions
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Função *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição das Permissões
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              {roles.find(r => r.id === formData.role)?.description}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {user ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}