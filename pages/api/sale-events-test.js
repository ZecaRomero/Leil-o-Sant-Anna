import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Dados recebidos:', req.body)
    
    const { nome, tipo, data, local, descricao, comissao, taxas, observacoes } = req.body

    // Usar um userId fixo para teste
    const userId = 'cm4dqq41eh00s5hew9wzzesur5c' // Substitua pelo seu userId real

    const eventData = {
      nome: nome || 'Teste',
      tipo: tipo || 'LEILAO',
      data: new Date(data || '2025-08-03'),
      local: local || '',
      descricao: descricao || '',
      comissao: comissao ? parseFloat(comissao) : null,
      taxas: taxas ? parseFloat(taxas) : null,
      observacoes: observacoes || '',
      userId
    }

    console.log('Dados para criar evento:', eventData)

    const event = await prisma.saleEvent.create({
      data: eventData
    })

    console.log('Evento criado:', event)
    res.status(201).json(event)
  } catch (error) {
    console.error('Erro detalhado:', error)
    res.status(500).json({ 
      message: 'Erro ao criar evento',
      error: error.message,
      stack: error.stack
    })
  }
}