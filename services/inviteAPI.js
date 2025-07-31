// API para sistema de convites
export const InviteAPI = {
  // Array para armazenar convites (em produção, usar banco de dados)
  invites: [],

  // Buscar convites do usuário
  async getInvites(userId) {
    await this.delay(500);
    
    // Carregar convites do localStorage
    const savedInvites = localStorage.getItem('beef_sync_invites');
    if (savedInvites) {
      this.invites = JSON.parse(savedInvites);
    }
    
    return this.invites.filter(invite => invite.invitedBy === userId);
  },

  // Enviar novo convite
  async sendInvite(inviteData) {
    await this.delay(1000);
    
    const newInvite = {
      id: Date.now(),
      ...inviteData,
      status: "pending",
      createdAt: new Date().toISOString(),
      inviteLink: this.generateInviteLink(),
      whatsappMessage: this.generateWhatsAppMessage(inviteData)
    };

    this.invites.push(newInvite);
    
    // Salvar no localStorage
    localStorage.setItem('beef_sync_invites', JSON.stringify(this.invites));

    // Tentar envio real via WhatsApp (se configurado)
    try {
      await this.sendWhatsAppInvite(newInvite);
    } catch (error) {
      console.warn('Envio via WhatsApp não configurado:', error.message);
      // Mesmo assim, salvar o convite para demonstração
    }
    
    return newInvite;
  },

  // Revogar convite
  async revokeInvite(inviteId) {
    await this.delay(300);
    const invite = this.invites.find(inv => inv.id === inviteId);
    if (invite) {
      invite.status = "revoked";
      invite.revokedAt = new Date().toISOString();
    }
    return invite;
  },

  // Aceitar convite
  async acceptInvite(inviteToken) {
    await this.delay(500);
    const invite = this.invites.find(inv => inv.inviteLink.includes(inviteToken));
    if (invite && invite.status === "pending") {
      invite.status = "accepted";
      invite.acceptedAt = new Date().toISOString();
      invite.lastSeen = new Date().toISOString();
      return invite;
    }
    throw new Error("Convite inválido ou expirado");
  },

  // Gerar link de convite
  generateInviteLink() {
    const token = Math.random().toString(36).substring(2, 15);
    return `${window.location.origin}/invite/${token}`;
  },

  // Gerar mensagem do WhatsApp
  generateWhatsAppMessage(inviteData) {
    const message = `🐄 *Beef Sync - Convite Especial*

Olá ${inviteData.name}! 👋

Você foi convidado para acompanhar em tempo real as vendas de gado e resultados do mercado!

🎯 *O que você pode fazer:*
${inviteData.permissions.includes('view_sales') ? '💰 Ver vendas em tempo real\n' : ''}${inviteData.permissions.includes('view_rankings') ? '🏆 Acompanhar rankings e comparações\n' : ''}${inviteData.permissions.includes('view_analytics') ? '📊 Ver análises e relatórios\n' : ''}${inviteData.permissions.includes('receive_alerts') ? '🔔 Receber alertas de oportunidades\n' : ''}

📱 *Acesse agora:*
${this.generateInviteLink()}

⏰ Este convite expira em 7 dias.

*Beef Sync* - Gestão Bovina Inteligente 🚀`;

    return encodeURIComponent(message);
  },

  // Enviar via WhatsApp
  async sendWhatsAppInvite(invite) {
    const whatsappUrl = `https://wa.me/${invite.phone.replace(/\D/g, '')}?text=${invite.whatsappMessage}`;
    
    console.log("📱 Link do WhatsApp gerado:", whatsappUrl);
    
    // Tentar abrir WhatsApp automaticamente
    if (typeof window !== 'undefined') {
      // Abrir em nova aba
      window.open(whatsappUrl, '_blank');
      
      // Mostrar notificação de sucesso
      setTimeout(() => {
        console.log(`✅ WhatsApp aberto para ${invite.name}`);
      }, 1000);
    }
    
    // Para envio automático real, usar as APIs do whatsappAPI.js
    // Exemplo:
    /*
    const { WhatsAppAPI } = await import('./whatsappAPI');
    const result = await WhatsAppAPI.sendInvite({
      phone: invite.phone,
      name: invite.name,
      inviteLink: invite.inviteLink,
      permissions: invite.permissions
    });
    return result;
    */
  },

  // Buscar dados do dashboard público
  async getPublicDashboard(inviteToken) {
    await this.delay(800);
    
    // Buscar dados reais do banco de dados baseado no token
    try {
      // Em produção, fazer consulta real ao banco:
      /*
      const invite = await prisma.invite.findFirst({
        where: { inviteLink: { contains: inviteToken } },
        include: { user: { include: { animals: true, sales: true } } }
      });
      
      if (!invite || invite.status !== 'accepted') {
        throw new Error('Convite inválido');
      }
      
      return {
        farmName: invite.user.farmName,
        owner: invite.user.name,
        totalAnimals: invite.user.animals.length,
        recentSales: invite.user.sales.slice(-10),
        // ... outros dados reais
      };
      */
      
      // Por enquanto, retornar estrutura vazia
      return {
        farmName: "Sua Fazenda",
        owner: "Proprietário",
        totalAnimals: 0,
        recentSales: [],
        rankings: {
          bestPerformers: [],
          byCategory: {}
        },
        marketComparison: {
          aboveMarket: 0,
          atMarket: 0,
          belowMarket: 0,
          avgPremium: 0
        },
        liveUpdates: []
      };
    } catch (error) {
      throw new Error('Erro ao carregar dados do dashboard');
    }
  },

  // Simular delay de rede
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};