import { useState, useEffect } from "react";

export default function InviteAnalytics({ invites }) {
  const [analytics, setAnalytics] = useState({
    totalInvites: 0,
    acceptanceRate: 0,
    activeUsers: 0,
    avgTimeToAccept: 0,
    topPermissions: [],
    engagementStats: {},
    deviceStats: {},
    timeStats: {}
  });

  useEffect(() => {
    calculateAnalytics();
  }, [invites]);

  const calculateAnalytics = () => {
    if (!invites || invites.length === 0) {
      setAnalytics({
        totalInvites: 0,
        acceptanceRate: 0,
        activeUsers: 0,
        avgTimeToAccept: 0,
        topPermissions: [],
        engagementStats: {},
        deviceStats: {},
        timeStats: {}
      });
      return;
    }

    const total = invites.length;
    const accepted = invites.filter(inv => inv.status === 'accepted').length;
    const acceptanceRate = total > 0 ? (accepted / total * 100) : 0;
    
    // Calcular tempo médio para aceitar
    const acceptedInvites = invites.filter(inv => inv.acceptedAt && inv.createdAt);
    const avgTimeToAccept = acceptedInvites.length > 0 
      ? acceptedInvites.reduce((sum, inv) => {
          const created = new Date(inv.createdAt);
          const accepted = new Date(inv.acceptedAt);
          return sum + (accepted - created);
        }, 0) / acceptedInvites.length / (1000 * 60 * 60) // em horas
      : 0;

    // Analisar permissões mais populares
    const permissionCounts = {};
    invites.forEach(inv => {
      inv.permissions?.forEach(perm => {
        permissionCounts[perm] = (permissionCounts[perm] || 0) + 1;
      });
    });

    const topPermissions = Object.entries(permissionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([perm, count]) => ({
        permission: perm,
        count,
        percentage: (count / total * 100).toFixed(1)
      }));

    // Simular estatísticas de engajamento
    const engagementStats = {
      dailyActive: Math.floor(accepted * 0.7),
      weeklyActive: Math.floor(accepted * 0.9),
      avgSessionTime: '4m 32s',
      mostViewedSection: 'Vendas Recentes'
    };

    // Simular estatísticas de dispositivos
    const deviceStats = {
      mobile: Math.floor(accepted * 0.75),
      desktop: Math.floor(accepted * 0.25),
      tablet: Math.floor(accepted * 0.1)
    };

    // Simular estatísticas de horários
    const timeStats = {
      morning: Math.floor(accepted * 0.3),
      afternoon: Math.floor(accepted * 0.4),
      evening: Math.floor(accepted * 0.3)
    };

    setAnalytics({
      totalInvites: total,
      acceptanceRate: acceptanceRate.toFixed(1),
      activeUsers: accepted,
      avgTimeToAccept: avgTimeToAccept.toFixed(1),
      topPermissions,
      engagementStats,
      deviceStats,
      timeStats
    });
  };

  const getPermissionIcon = (permission) => {
    const icons = {
      view_sales: '💰',
      view_rankings: '🏆',
      view_analytics: '📊',
      receive_alerts: '🔔'
    };
    return icons[permission] || '📋';
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      view_sales: 'Ver Vendas',
      view_rankings: 'Ver Rankings',
      view_analytics: 'Ver Análises',
      receive_alerts: 'Receber Alertas'
    };
    return labels[permission] || permission;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        📊 Analytics de Convites
      </h3>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalInvites}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Enviados
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {analytics.acceptanceRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Taxa de Aceitação
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.activeUsers}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Usuários Ativos
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.avgTimeToAccept}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tempo Médio
          </div>
        </div>
      </div>

      {/* Permissões Mais Populares */}
      {analytics.topPermissions.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Permissões Mais Solicitadas
          </h4>
          <div className="space-y-3">
            {analytics.topPermissions.map((item, index) => (
              <div key={item.permission} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPermissionIcon(item.permission)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getPermissionLabel(item.permission)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.count} convites ({item.percentage}%)
                    </div>
                  </div>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas de Engajamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Engajamento
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Ativos Diariamente</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {analytics.engagementStats.dailyActive}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Ativos Semanalmente</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {analytics.engagementStats.weeklyActive}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Tempo Médio de Sessão</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {analytics.engagementStats.avgSessionTime}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📱 Dispositivos
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>📱</span>
                <span className="text-gray-700 dark:text-gray-300">Mobile</span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">
                {analytics.deviceStats.mobile}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>💻</span>
                <span className="text-gray-700 dark:text-gray-300">Desktop</span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {analytics.deviceStats.desktop}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>📟</span>
                <span className="text-gray-700 dark:text-gray-300">Tablet</span>
              </div>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {analytics.deviceStats.tablet}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Horários de Acesso */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🕐 Horários de Maior Acesso
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl mb-2">🌅</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {analytics.timeStats.morning}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Manhã (6h-12h)
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl mb-2">☀️</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analytics.timeStats.afternoon}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tarde (12h-18h)
            </div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="text-2xl mb-2">🌙</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analytics.timeStats.evening}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Noite (18h-24h)
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {analytics.totalInvites > 0 && (
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            💡 Insights
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {analytics.acceptanceRate > 70 && (
              <p>✅ Excelente taxa de aceitação! Seus convites são muito atrativos.</p>
            )}
            {analytics.acceptanceRate < 30 && (
              <p>⚠️ Taxa de aceitação baixa. Considere personalizar mais as mensagens.</p>
            )}
            {analytics.avgTimeToAccept < 2 && (
              <p>⚡ Convites são aceitos rapidamente! Ótimo engajamento.</p>
            )}
            {analytics.deviceStats.mobile > analytics.deviceStats.desktop && (
              <p>📱 Maioria acessa via mobile. Dashboard está otimizado para celular.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}