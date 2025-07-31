import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PublicDashboard from "../../components/PublicDashboard";
import { InviteAPI } from "../../services/inviteAPI";

export default function InvitePage() {
  const router = useRouter();
  const { token } = router.query;
  const [inviteStatus, setInviteStatus] = useState("loading");
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    if (token) {
      handleInviteAcceptance();
    }
  }, [token]);

  const handleInviteAcceptance = async () => {
    try {
      const invite = await InviteAPI.acceptInvite(token);
      setInviteData(invite);
      setInviteStatus("accepted");
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setInviteStatus("invalid");
    }
  };

  if (inviteStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐄</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Verificando convite...
          </div>
        </div>
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Convite Inválido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Este convite pode ter expirado ou já foi usado. Entre em contato com quem te convidou para obter um novo link.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Dica:</strong> Verifique se o link está completo e tente novamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (inviteStatus === "accepted") {
    return (
      <div>
        {/* Mensagem de boas-vindas */}
        <div className="bg-green-500 text-white p-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold">
                Bem-vindo! Convite aceito com sucesso.
              </span>
              <span className="text-2xl">🐄</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard público */}
        <PublicDashboard inviteToken={token} />
      </div>
    );
  }

  return null;
}