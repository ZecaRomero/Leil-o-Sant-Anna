import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('=== CRIANDO EVENTO DE LEILÃO ===');
    console.log('Dados recebidos:', req.body);
    
    const { nome, tipo, data, local, descricao, comissao, taxas, observacoes } = req.body

    // Usando o userId correto do banco
    const userId = 'cmdqdvq8n0000h9l829787qv8'
    
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.error('Usuário não encontrado:', userId);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('Usuário encontrado:', user.email);

    const eventData = {
      nome: nome || 'Leilão',
      tipo: tipo || 'LEILAO',
      data: new Date(data),
      local: local || '',
      descricao: descricao || '',
      comissao: comissao ? parseFloat(comissao) : null,
      taxas: taxas ? parseFloat(taxas) : null,
      observacoes: observacoes || '',
      userId
    };
    
    console.log('Dados para criar evento:', eventData);

    const event = await prisma.saleEvent.create({
      data: eventData
    })

    console.log('Evento criado com sucesso:', event);
    res.status(201).json(event)
  } catch (error) {
    console.error('Erro detalhado ao criar evento:', error)
    res.status(500).json({ 
      message: 'Erro ao criar evento: ' + error.message,
      code: error.code,
      meta: error.meta
    })
  }
}