import { useState, useEffect } from "react";

export default function InviteQRCode({ inviteLink, visible, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && inviteLink) {
      generateQRCode();
    }
  }, [visible, inviteLink]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Usar API gratuita para gerar QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}&format=png&bgcolor=ffffff&color=000000&margin=20`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'beef-sync-convite-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beef Sync - Convite',
          text: 'Acesse o dashboard de vendas em tempo real',
          url: inviteLink
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(inviteLink);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            📱 QR Code do Convite
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="text-center">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin text-4xl">📱</div>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 inline-block mb-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code do Convite"
                  className="w-64 h-64"
                />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Escaneie este QR Code com a câmera do celular para acessar o dashboard
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>💾</span>
                  <span>Baixar</span>
                </button>
                
                <button
                  onClick={shareQRCode}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>📤</span>
                  <span>Compartilhar</span>
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                  {inviteLink}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}