import { useState } from "react";

export default function InviteTemplates({ onSelectTemplate, visible, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'investor',
      name: 'Para Investidores',
      icon: '💼',
      description: 'Template focado em ROI e performance financeira',
      permissions: ['view_sales', 'view_analytics', 'receive_alerts'],
      message: `🐄 *Beef Sync - Relatório de Investimento*

Olá {name}! 👋

Como investidor na nossa operação, você agora tem acesso exclusivo ao dashboard de performance em tempo real!

💰 *Acompanhe seus investimentos:*
📊 ROI e performance detalhada
💵 Vendas e receitas em tempo real
📈 Análises comparativas de mercado
🔔 Alertas de oportunidades

📱 *Acesse seu dashboard:*
{link}

*Transparência total para nossos parceiros!* 🤝

*Beef Sync* - Gestão Bovina Inteligente 🚀`
    },
    {
      id: 'family',
      name: 'Para Família',
      icon: '👨‍👩‍👧‍👦',
      description: 'Template casual para familiares',
      permissions: ['view_sales', 'view_rankings'],
      message: `🐄 *Beef Sync - Acompanhe a Fazenda*

Oi {name}! 😊

Que tal acompanhar como está indo o negócio da família? Criei um acesso especial para você!

🏆 *Veja como estamos indo:*
💰 Vendas que estamos fazendo
🥇 Ranking dos melhores animais
📊 Como estamos vs mercado

📱 *Acesse aqui:*
{link}

É bem fácil de usar, até no celular! 📱

*Beef Sync* - Tecnologia na Pecuária 🚀`
    },
    {
      id: 'consultant',
      name: 'Para Consultores',
      icon: '👨‍💻',
      description: 'Template técnico para profissionais',
      permissions: ['view_sales', 'view_rankings', 'view_analytics', 'receive_alerts'],
      message: `🐄 *Beef Sync - Acesso Técnico*

Olá {name}! 👋

Como nosso consultor técnico, você agora tem acesso completo aos dados de performance da operação.

📊 *Dados disponíveis:*
💰 Vendas e receitas detalhadas
🏆 Rankings e comparações
📈 Análises técnicas avançadas
🔔 Alertas de mercado e oportunidades

📱 *Dashboard técnico:*
{link}

Todos os dados que você precisa para suas análises e recomendações.

*Beef Sync* - Dados para Decisões 🚀`
    },
    {
      id: 'partner',
      name: 'Para Parceiros',
      icon: '🤝',
      description: 'Template para parceiros comerciais',
      permissions: ['view_sales', 'view_rankings', 'receive_alerts'],
      message: `🐄 *Beef Sync - Parceria Transparente*

Olá {name}! 👋

Como nosso parceiro comercial, você merece total transparência nos nossos resultados!

🎯 *Acompanhe nossa performance:*
💰 Vendas e resultados em tempo real
🏆 Performance dos animais
📊 Comparação com mercado
🔔 Alertas de oportunidades

📱 *Acesse o dashboard:*
{link}

Parceria baseada em transparência e resultados! 🤝

*Beef Sync* - Pecuária Profissional 🚀`
    },
    {
      id: 'buyer',
      name: 'Para Compradores',
      icon: '🛒',
      description: 'Template para potenciais compradores',
      permissions: ['view_sales', 'view_rankings'],
      message: `🐄 *Beef Sync - Qualidade Comprovada*

Olá {name}! 👋

Quer ver a qualidade dos nossos animais? Criamos um acesso especial para você acompanhar nossa produção!

🏆 *Veja nossa qualidade:*
💰 Histórico de vendas
🥇 Ranking dos melhores animais
📊 Performance vs mercado

📱 *Acesse aqui:*
{link}

Qualidade que você pode acompanhar em tempo real! 📈

*Beef Sync* - Transparência na Pecuária 🚀`
    },
    {
      id: 'custom',
      name: 'Personalizado',
      icon: '✏️',
      description: 'Crie sua própria mensagem',
      permissions: ['view_sales'],
      message: `🐄 *Beef Sync - Convite Especial*

Olá {name}! 👋

Você foi convidado para acompanhar nossos resultados em tempo real!

📱 *Acesse agora:*
{link}

*Beef Sync* - Gestão Bovina Inteligente 🚀`
    }
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      view_sales: '💰 Ver Vendas',
      view_rankings: '🏆 Ver Rankings',
      view_analytics: '📊 Ver Análises',
      receive_alerts: '🔔 Receber Alertas'
    };
    return labels[permission] || permission;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 Templates de Convite
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{template.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissões incluídas:
                </p>
                {template.permissions.map((permission) => (
                  <div key={permission} className="text-xs text-gray-600 dark:text-gray-400">
                    {getPermissionLabel(permission)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Preview da mensagem */}
        {selectedTemplate && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📱 Preview da Mensagem
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                {selectedTemplate.message}
              </pre>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * {'{name}'} e {'{link}'} serão substituídos automaticamente
            </p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex space-x-3">
          <button
            onClick={handleUseTemplate}
            disabled={!selectedTemplate}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ✅ Usar Template
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Dica */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Dica:</strong> Você pode editar a mensagem depois de selecionar o template para personalizar ainda mais o convite.
          </p>
        </div>
      </div>
    </div>
  );
}