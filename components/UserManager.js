import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function UserManager({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER'
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users-management');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/users-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await loadUsers();
        setNewUser({ name: '', email: '', password: '', role: 'VIEWER' });
        setShowAddForm(false);
        alert('✅ Usuário criado com sucesso!');
      } else {
        const error = await response.json();
        alert('Erro: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users-management/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadUsers();
        alert('✅ Usuário excluído com sucesso!');
      } else {
        alert('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const getRoleLabel = (role) => {
    const roles = {
      'ADMIN': '👑 Administrador',
      'OWNER': '🏠 Dono',
      'MANAGER': '👨‍💼 Gerente', 
      'VIEWER': '👁️ Visualizador',
      'USER': '👤 Usuário'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'OWNER': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'MANAGER': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'VIEWER': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'USER': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[role] || colors['USER'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">👥 Gerenciar Usuários</h2>
              <p className="text-blue-100">Adicione pessoas para acompanhar pelo celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add User Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              ➕ Adicionar Usuário
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Novo Usuário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="joao@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Senha *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="senha123"
                    />
                    <button
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                    >
                      🎲 Gerar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Função
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="VIEWER">👁️ Visualizador (só acompanha)</option>
                    <option value="USER">👤 Usuário (pode ver tudo)</option>
                    <option value="MANAGER">👨‍💼 Gerente (pode gerenciar)</option>
                    <option value="OWNER">🏠 Dono (acesso total)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✅ Criar Usuário
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                👥 Usuários Cadastrados ({users.length})
              </h3>
              
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhum usuário cadastrado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Usuário" para começar</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {user.name}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 dark:text-gray-400">Senha:</span>
                            <div className="ml-2 flex items-center space-x-2">
                              <span className="font-mono text-gray-900 dark:text-white">
                                {showPasswords[user.id] ? (user.tempPassword || '••••••••') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                {showPasswords[user.id] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.email !== 'admin@beefsync.com' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir usuário"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Dica:</strong> Compartilhe o email e senha com as pessoas para elas acessarem pelo celular
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}