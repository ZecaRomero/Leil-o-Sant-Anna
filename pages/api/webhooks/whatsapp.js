import { WhatsAppAPI } from '../../../services/whatsappAPI';

export default async function handler(req, res) {
  const { method, query, body } = req;

  // Verificação do webhook (WhatsApp Business API)
  if (method === 'GET') {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    // Verificar se o token está correto
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook verificado com sucesso');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Falha na verificação do webhook');
      return res.status(403).json({ error: 'Token de verificação inválido' });
    }
  }

  // Processar eventos do webhook
  if (method === 'POST') {
    try {
      console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));

      // Processar diferentes tipos de eventos
      if (body.entry) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'messages') {
                await processMessageEvent(change.value);
              }
            }
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}

async function processMessageEvent(messageData) {
  // Processar status de entrega
  if (messageData.statuses) {
    for (const status of messageData.statuses) {
      await updateMessageStatus(status);
    }
  }

  // Processar mensagens recebidas (respostas dos convidados)
  if (messageData.messages) {
    for (const message of messageData.messages) {
      await processIncomingMessage(message);
    }
  }
}

async function updateMessageStatus(status) {
  const { id, status: messageStatus, timestamp, recipient_id } = status;
  
  console.log(`📊 Status da mensagem ${id}: ${messageStatus}`);
  
  try {
    // Aqui você atualizaria o status no banco de dados
    // Exemplo com Prisma:
    /*
    await prisma.inviteMessage.update({
      where: { whatsappMessageId: id },
      data: {
        status: messageStatus,
        statusUpdatedAt: new Date(parseInt(timestamp) * 1000),
        deliveredAt: messageStatus === 'delivered' ? new Date() : undefined,
        readAt: messageStatus === 'read' ? new Date() : undefined
      }
    });
    */
    
    // Por enquanto, apenas log
    console.log(`✅ Status atualizado: ${id} -> ${messageStatus}`);
    
    // Se a mensagem foi lida, podemos enviar uma notificação para o proprietário
    if (messageStatus === 'read') {
      await notifyOwnerMessageRead(id, recipient_id);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status da mensagem:', error);
  }
}

async function processIncomingMessage(message) {
  const { from, text, timestamp } = message;
  
  if (!text || !text.body) return;
  
  const messageText = text.body.toLowerCase();
  
  console.log(`💬 Mensagem recebida de ${from}: ${messageText}`);
  
  // Processar comandos automáticos
  if (messageText.includes('parar') || messageText.includes('stop')) {
    await handleUnsubscribe(from);
  } else if (messageText.includes('ajuda') || messageText.includes('help')) {
    await sendHelpMessage(from);
  } else if (messageText.includes('status') || messageText.includes('vendas')) {
    await sendQuickStatus(from);
  }
}

async function handleUnsubscribe(phoneNumber) {
  try {
    // Revogar convite ativo para este número
    /*
    await prisma.invite.updateMany({
      where: {
        phone: phoneNumber,
        status: 'accepted'
      },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedReason: 'user_request'
      }
    });
    */
    
    // Enviar confirmação
    const confirmMessage = `✅ Você foi removido da lista de notificações do Beef Sync.

Para voltar a receber atualizações, peça um novo convite ao proprietário.

Obrigado por usar o Beef Sync! 🐄`;

    await WhatsAppAPI.sendViaTwilio(phoneNumber, confirmMessage);
    
    console.log(`🚫 Usuário ${phoneNumber} removido das notificações`);
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento:', error);
  }
}

async function sendHelpMessage(phoneNumber) {
  const helpMessage = `🐄 *Beef Sync - Comandos Disponíveis*

📱 *Comandos que você pode usar:*

🔍 *"status"* ou *"vendas"*
   → Ver resumo rápido das últimas vendas

📊 *"ranking"*
   → Ver top 3 animais com melhor performance

📈 *"mercado"*
   → Ver preços atuais do mercado

🚫 *"parar"* ou *"stop"*
   → Parar de receber notificações

❓ *"ajuda"* ou *"help"*
   → Ver esta mensagem

🌐 *Link completo:*
Para ver todas as informações detalhadas, acesse: [SEU_LINK_AQUI]

*Beef Sync* - Gestão Bovina Inteligente 🚀`;

  try {
    await WhatsAppAPI.sendViaTwilio(phoneNumber, helpMessage);
    console.log(`ℹ️ Mensagem de ajuda enviada para ${phoneNumber}`);
  } catch (error) {
    console.error('❌ Erro ao enviar ajuda:', error);
  }
}

async function sendQuickStatus(phoneNumber) {
  try {
    // Buscar dados rápidos das vendas
    const quickStats = await getQuickStats(phoneNumber);
    
    const statusMessage = `📊 *Beef Sync - Status Rápido*

💰 *Vendas Hoje:* ${quickStats.salesToday} animais
💵 *Valor Total:* R$ ${quickStats.totalValue.toLocaleString('pt-BR')}
📈 *vs Ontem:* ${quickStats.changePercent > 0 ? '+' : ''}${quickStats.changePercent}%

🏆 *Melhor Venda:*
${quickStats.bestSale.animal} - R$ ${quickStats.bestSale.price.toLocaleString('pt-BR')}

📱 *Ver mais detalhes:*
${quickStats.dashboardLink}

*Atualizado em:* ${new Date().toLocaleTimeString('pt-BR')}`;

    await WhatsAppAPI.sendViaTwilio(phoneNumber, statusMessage);
    console.log(`📊 Status rápido enviado para ${phoneNumber}`);
  } catch (error) {
    console.error('❌ Erro ao enviar status:', error);
  }
}

async function getQuickStats(phoneNumber) {
  // Simular dados rápidos
  // Em produção, buscar do banco de dados baseado no convite
  return {
    salesToday: 3,
    totalValue: 25400,
    changePercent: 12.5,
    bestSale: {
      animal: "Boi Nelore #1234",
      price: 8500
    },
    dashboardLink: "https://beef-sync.com/invite/abc123"
  };
}

async function notifyOwnerMessageRead(messageId, recipientId) {
  try {
    // Notificar o proprietário que o convite foi lido
    console.log(`👀 Convite lido por ${recipientId}`);
    
    // Aqui você poderia:
    // 1. Atualizar status no dashboard
    // 2. Enviar notificação push para o proprietário
    // 3. Registrar analytics de engajamento
    
  } catch (error) {
    console.error('❌ Erro ao notificar proprietário:', error);
  }
}