import { useState, useEffect } from "react";
import { InviteAPI } from "../services/inviteAPI";
import InviteQRCode from "./InviteQRCode";
import InviteAnalytics from "./InviteAnalytics";
import InviteTemplates from "./InviteTemplates";

export default function InviteSystem({ userId }) {
  const [invites, setInvites] = useState([]);
  const [newInvite, setNewInvite] = useState({
    name: "",
    phone: "",
    email: "",
    permissions: ["view_sales", "view_rankings"]
  });
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedInviteLink, setSelectedInviteLink] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const data = await InviteAPI.getInvites(userId);
      setInvites(data);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    }
  };

  const sendInvite = async () => {
    if (!newInvite.name || !newInvite.phone) {
      alert("Nome e telefone são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const inviteData = {
        ...newInvite,
        invitedBy: userId,
        phone: formatPhone(newInvite.phone),
        customMessage: customMessage || undefined
      };

      const invite = await InviteAPI.sendInvite(inviteData);

      setInvites([...invites, invite]);
      setNewInvite({
        name: "",
        phone: "",
        email: "",
        permissions: ["view_sales", "view_rankings"]
      });
      setCustomMessage("");
      setShowInviteForm(false);
      
      // Mostrar opções pós-envio
      const showQR = confirm(`Convite enviado para ${newInvite.name}! 📱\n\nDeseja gerar um QR Code também?`);
      if (showQR) {
        setSelectedInviteLink(invite.inviteLink);
        setShowQRCode(true);
      }
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      alert("Erro ao enviar convite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setCustomMessage(template.message);
    setNewInvite({
      ...newInvite,
      permissions: template.permissions
    });
  };

  const showInviteQR = (invite) => {
    setSelectedInviteLink(invite.inviteLink);
    setShowQRCode(true);
  };

  const copyInviteLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Link copiado para a área de transferência! 📋");
  };

  const resendInvite = async (invite) => {
    if (!confirm(`Reenviar convite para ${invite.name}?`)) return;

    try {
      await InviteAPI.sendInvite({
        ...invite,
        customMessage: customMessage || undefined
      });
      alert(`Convite reenviado para ${invite.name}! 📱`);
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      alert("Erro ao reenviar convite.");
    }
  };

  const formatPhone = (phone) => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, "");
    
    // Adiciona +55 se não tiver código do país
    if (numbers.length === 11) {
      return `+55${numbers}`;
    } else if (numbers.length === 13 && numbers.startsWith("55")) {
      return `+${numbers}`;
    }
    return phone;
  };

  const revokeInvite = async (inviteId) => {
    if (!confirm("Tem certeza que deseja revogar este convite?")) return;

    try {
      await InviteAPI.revokeInvite(inviteId);
      setInvites(invites.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error("Erro ao revogar convite:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "⏳";
      case "accepted": return "✅";
      case "expired": return "⏰";
      case "revoked": return "❌";
      default: return "📤";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-50";
      case "accepted": return "text-green-600 bg-green-50";
      case "expired": return "text-gray-600 bg-gray-50";
      case "revoked": return "text-red-600 bg-red-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            📱 Sistema de Convites
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Convide pessoas para acompanhar suas vendas em tempo real
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Novo Convite</span>
        </button>
      </div>

      {/* Formulário de Convite */}
      {showInviteForm && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📤 Enviar Novo Convite
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={newInvite.name}
                onChange={(e) => setNewInvite({...newInvite, name: e.target.value})}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone/WhatsApp *
              </label>
              <input
                type="tel"
                value={newInvite.phone}
                onChange={(e) => setNewInvite({...newInvite, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              value={newInvite.email}
              onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
              placeholder="joao@email.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissões
            </label>
            <div className="space-y-2">
              {[
                { id: "view_sales", label: "Ver vendas em tempo real", icon: "💰" },
                { id: "view_rankings", label: "Ver rankings e comparações", icon: "🏆" },
                { id: "view_analytics", label: "Ver análises e relatórios", icon: "📊" },
                { id: "receive_alerts", label: "Receber alertas de vendas", icon: "🔔" }
              ].map((permission) => (
                <label key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newInvite.permissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewInvite({
                          ...newInvite,
                          permissions: [...newInvite.permissions, permission.id]
                        });
                      } else {
                        setNewInvite({
                          ...newInvite,
                          permissions: newInvite.permissions.filter(p => p !== permission.id)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {permission.icon} {permission.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={sendInvite}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>📱</span>
                  <span>Enviar Convite</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowInviteForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Convites */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📋 Convites Enviados ({invites.length})
        </h3>
        
        {invites.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📱</div>
            <p>Nenhum convite enviado ainda</p>
            <p className="text-sm">Clique em "Novo Convite" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">👤</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invite.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {invite.phone} {invite.email && `• ${invite.email}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enviado em {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                    {getStatusIcon(invite.status)} {invite.status === "pending" ? "Pendente" : 
                     invite.status === "accepted" ? "Aceito" : 
                     invite.status === "expired" ? "Expirado" : "Revogado"}
                  </div>
                  
                  {invite.status === "accepted" && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      🟢 Online
                    </div>
                  )}
                  
                  {invite.status === "pending" && (
                    <button
                      onClick={() => revokeInvite(invite.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Revogar convite"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {invites.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {invites.filter(inv => inv.status === "accepted").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Aceitos</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {invites.filter(inv => inv.status === "pending").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Pendentes</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {invites.filter(inv => inv.status === "accepted").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}