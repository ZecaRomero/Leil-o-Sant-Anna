import { useState, useEffect } from "react";

export default function NotificationSystem({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    salesAlerts: true,
    priceAlerts: true,
    marketAlerts: true,
    weeklyReports: true,
    pushNotifications: true,
    emailNotifications: true,
    whatsappNotifications: true
  });

  useEffect(() => {
    loadNotifications();
    
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      addRandomNotification();
    }, 45000); // Nova notificação a cada 45 segundos

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Em produção, carregar notificações reais do banco:
      /*
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('beef_sync_token')}`
        }
      });
      const notifications = await response.json();
      setNotifications(notifications);
      */
      
      // Por enquanto, iniciar com array vazio
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    }
  };

  const addRandomNotification = () => {
    // Em produção, as notificações virão de eventos reais:
    // - Vendas realizadas
    // - Mudanças de preço de mercado
    // - Atualizações de ranking
    // - Alertas do sistema
    
    // Por enquanto, não adicionar notificações automáticas
    // As notificações serão criadas quando eventos reais acontecerem
  };

  const showBrowserNotification = (notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Beef Sync - ${notification.title}`, {
        body: notification.message,
        icon: "/beef-sync-icon.svg",
        badge: "/beef-sync-icon.svg"
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        alert("Notificações ativadas! 🔔");
      }
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low": return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      default: return "border-gray-500 bg-gray-50 dark:bg-gray-700";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🔔 Notificações
          </h2>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={requestNotificationPermission}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
          >
            🔔 Ativar Push
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors"
            >
              ✅ Marcar Todas
            </button>
          )}
        </div>
      </div>

      {/* Configurações Rápidas */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          ⚙️ Configurações Rápidas
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "salesAlerts", label: "Vendas", icon: "💰" },
            { key: "priceAlerts", label: "Preços", icon: "📈" },
            { key: "marketAlerts", label: "Mercado", icon: "📊" },
            { key: "weeklyReports", label: "Relatórios", icon: "📋" }
          ].map((setting) => (
            <label key={setting.key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings[setting.key]}
                onChange={(e) => setSettings({
                  ...settings,
                  [setting.key]: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {setting.icon} {setting.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔕</div>
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                notification.read 
                  ? "bg-gray-50 dark:bg-gray-700 opacity-75" 
                  : getPriorityColor(notification.priority)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{notification.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTimeAgo(notification.timestamp)}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        notification.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                        notification.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}>
                        {notification.priority === "high" ? "Alta" : 
                         notification.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="Marcar como lida"
                    >
                      ✅
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {notifications.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {unreadCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Não Lidas</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {notifications.filter(n => n.priority === "high").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Urgentes</div>
          </div>
        </div>
      </div>
    </div>
  );
}