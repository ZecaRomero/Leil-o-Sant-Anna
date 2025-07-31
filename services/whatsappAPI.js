// Integração com APIs de WhatsApp para envio de convites
// Suporte para múltiplos provedores: Twilio, WhatsApp Business API, etc.

export const WhatsAppAPI = {
  // Configurações dos provedores
  providers: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER, // Ex: whatsapp:+14155238886
      apiUrl: 'https://api.twilio.com/2010-04-01'
    },
    whatsappBusiness: {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      apiUrl: 'https://graph.facebook.com/v18.0'
    },
    chatapi: {
      token: process.env.CHATAPI_TOKEN,
      instanceId: process.env.CHATAPI_INSTANCE_ID,
      apiUrl: 'https://api.chat-api.com/instance'
    }
  },

  // Provedor ativo (configurável)
  activeProvider: process.env.WHATSAPP_PROVIDER || 'twilio',

  // Enviar convite via Twilio
  async sendViaTwilio(phoneNumber, message, mediaUrl = null) {
    const { accountSid, authToken, whatsappNumber } = this.providers.twilio;
    
    if (!accountSid || !authToken) {
      throw new Error('Credenciais do Twilio não configuradas');
    }

    const client = require('twilio')(accountSid, authToken);
    
    try {
      const messageData = {
        from: whatsappNumber,
        to: `whatsapp:${phoneNumber}`,
        body: message
      };

      // Adicionar mídia se fornecida (logo, QR code, etc.)
      if (mediaUrl) {
        messageData.mediaUrl = [mediaUrl];
      }

      const result = await client.messages.create(messageData);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        provider: 'twilio'
      };
    } catch (error) {
      console.error('Erro ao enviar via Twilio:', error);
      throw new Error(`Falha no envio via Twilio: ${error.message}`);
    }
  },

  // Enviar convite via WhatsApp Business API
  async sendViaWhatsAppBusiness(phoneNumber, message, templateName = null) {
    const { accessToken, phoneNumberId } = this.providers.whatsappBusiness;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('Credenciais do WhatsApp Business não configuradas');
    }

    try {
      const url = `${this.providers.whatsappBusiness.apiUrl}/${phoneNumberId}/messages`;
      
      let messageData;
      
      if (templateName) {
        // Usar template aprovado
        messageData = {
          messaging_product: "whatsapp",
          to: phoneNumber.replace('+', ''),
          type: "template",
          template: {
            name: templateName,
            language: { code: "pt_BR" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: message }
                ]
              }
            ]
          }
        };
      } else {
        // Mensagem de texto simples (apenas para números verificados)
        messageData = {
          messaging_product: "whatsapp",
          to: phoneNumber.replace('+', ''),
          type: "text",
          text: { body: message }
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro na API do WhatsApp');
      }

      return {
        success: true,
        messageId: result.messages[0].id,
        status: 'sent',
        provider: 'whatsapp_business'
      };
    } catch (error) {
      console.error('Erro ao enviar via WhatsApp Business:', error);
      throw new Error(`Falha no envio via WhatsApp Business: ${error.message}`);
    }
  },

  // Enviar convite via Chat-API
  async sendViaChatAPI(phoneNumber, message) {
    const { token, instanceId } = this.providers.chatapi;
    
    if (!token || !instanceId) {
      throw new Error('Credenciais do Chat-API não configuradas');
    }

    try {
      const url = `${this.providers.chatapi.apiUrl}${instanceId}/sendMessage?token=${token}`;
      
      const messageData = {
        phone: phoneNumber.replace('+', ''),
        body: message
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      
      if (!result.sent) {
        throw new Error(result.message || 'Erro no envio');
      }

      return {
        success: true,
        messageId: result.id,
        status: 'sent',
        provider: 'chatapi'
      };
    } catch (error) {
      console.error('Erro ao enviar via Chat-API:', error);
      throw new Error(`Falha no envio via Chat-API: ${error.message}`);
    }
  },

  // Método principal para envio de convites
  async sendInvite(inviteData) {
    const { phone, name, inviteLink, permissions } = inviteData;
    
    // Gerar mensagem personalizada
    const message = this.generateInviteMessage(name, inviteLink, permissions);
    
    try {
      let result;
      
      // Tentar enviar com o provedor ativo
      switch (this.activeProvider) {
        case 'twilio':
          result = await this.sendViaTwilio(phone, message);
          break;
        case 'whatsapp_business':
          result = await this.sendViaWhatsAppBusiness(phone, message);
          break;
        case 'chatapi':
          result = await this.sendViaChatAPI(phone, message);
          break;
        default:
          throw new Error(`Provedor não suportado: ${this.activeProvider}`);
      }

      // Log do envio bem-sucedido
      console.log(`✅ Convite enviado para ${name} (${phone}) via ${result.provider}`);
      
      return result;
    } catch (error) {
      // Tentar fallback para outros provedores
      console.warn(`❌ Falha com ${this.activeProvider}, tentando fallback...`);
      
      const fallbackProviders = Object.keys(this.providers).filter(p => p !== this.activeProvider);
      
      for (const provider of fallbackProviders) {
        try {
          let result;
          switch (provider) {
            case 'twilio':
              result = await this.sendViaTwilio(phone, message);
              break;
            case 'whatsapp_business':
              result = await this.sendViaWhatsAppBusiness(phone, message);
              break;
            case 'chatapi':
              result = await this.sendViaChatAPI(phone, message);
              break;
          }
          
          console.log(`✅ Convite enviado via fallback ${provider}`);
          return result;
        } catch (fallbackError) {
          console.warn(`❌ Fallback ${provider} também falhou:`, fallbackError.message);
          continue;
        }
      }
      
      // Se todos os provedores falharam
      throw new Error(`Falha em todos os provedores de WhatsApp: ${error.message}`);
    }
  },

  // Gerar mensagem de convite personalizada
  generateInviteMessage(name, inviteLink, permissions) {
    const permissionIcons = {
      view_sales: '💰 Ver vendas em tempo real',
      view_rankings: '🏆 Acompanhar rankings e comparações',
      view_analytics: '📊 Ver análises e relatórios',
      receive_alerts: '🔔 Receber alertas de oportunidades'
    };

    const permissionList = permissions
      .map(p => permissionIcons[p])
      .filter(Boolean)
      .join('\n');

    return `🐄 *Beef Sync - Convite Especial*

Olá ${name}! 👋

Você foi convidado para acompanhar em tempo real as vendas de gado e resultados do mercado!

🎯 *O que você pode fazer:*
${permissionList}

📱 *Acesse agora:*
${inviteLink}

⏰ Este convite expira em 7 dias.

*Beef Sync* - Gestão Bovina Inteligente 🚀`;
  },

  // Verificar status de entrega
  async checkDeliveryStatus(messageId, provider) {
    try {
      switch (provider) {
        case 'twilio':
          return await this.checkTwilioStatus(messageId);
        case 'whatsapp_business':
          return await this.checkWhatsAppBusinessStatus(messageId);
        case 'chatapi':
          return await this.checkChatAPIStatus(messageId);
        default:
          return { status: 'unknown', provider };
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return { status: 'error', error: error.message, provider };
    }
  },

  // Verificar status no Twilio
  async checkTwilioStatus(messageId) {
    const { accountSid, authToken } = this.providers.twilio;
    const client = require('twilio')(accountSid, authToken);
    
    const message = await client.messages(messageId).fetch();
    return {
      status: message.status, // queued, sent, delivered, read, failed, etc.
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      provider: 'twilio'
    };
  },

  // Verificar status no WhatsApp Business
  async checkWhatsAppBusinessStatus(messageId) {
    // WhatsApp Business API usa webhooks para status
    // Aqui você consultaria seu banco de dados onde armazena os status recebidos
    return {
      status: 'sent', // sent, delivered, read, failed
      provider: 'whatsapp_business'
    };
  },

  // Verificar status no Chat-API
  async checkChatAPIStatus(messageId) {
    const { token, instanceId } = this.providers.chatapi;
    
    const url = `${this.providers.chatapi.apiUrl}${instanceId}/getMessage?token=${token}&id=${messageId}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    return {
      status: result.status, // sent, delivered, read, failed
      provider: 'chatapi'
    };
  },

  // Configurar webhook para receber status (WhatsApp Business)
  setupWebhook(webhookUrl, verifyToken) {
    return {
      webhook_url: webhookUrl,
      verify_token: verifyToken,
      events: ['messages', 'message_deliveries', 'message_reads']
    };
  },

  // Processar webhook recebido
  processWebhook(webhookData) {
    // Processar diferentes tipos de eventos
    if (webhookData.entry) {
      for (const entry of webhookData.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              // Processar status de mensagem
              const statuses = change.value.statuses || [];
              for (const status of statuses) {
                console.log(`Status da mensagem ${status.id}: ${status.status}`);
                // Aqui você atualizaria o status no banco de dados
              }
            }
          }
        }
      }
    }
  }
};

// Exemplo de uso:
/*
// Enviar convite
const result = await WhatsAppAPI.sendInvite({
  phone: '+5511999999999',
  name: 'João Silva',
  inviteLink: 'https://beef-sync.com/invite/abc123',
  permissions: ['view_sales', 'view_rankings']
});

// Verificar status
const status = await WhatsAppAPI.checkDeliveryStatus(result.messageId, result.provider);
*/