import { prisma } from '../../lib/prisma'
import { withAuth } from '../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const events = await prisma.saleEvent.findMany({
          where: { userId },
          include: {
            sales: {
              include: {
                animal: true
              }
            }
          },
          orderBy: { data: 'desc' }
        })

        res.status(200).json(events)
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
        res.status(500).json({ message: 'Erro ao buscar eventos' })
      }
      break

    case 'POST':
      try {
        console.log('Dados recebidos:', req.body); // Debug
        console.log('User ID:', userId); // Debug
        
        const { nome, tipo, data, local, descricao, comissao, taxas, observacoes } = req.body

        if (!nome || !data) {
          return res.status(400).json({ message: 'Nome e data são obrigatórios' })
        }

        const eventData = {
          nome,
          tipo: tipo || 'LEILAO',
          data: new Date(data),
          local: local || '',
          descricao: descricao || '',
          comissao: comissao ? parseFloat(comissao) : null,
          taxas: taxas ? parseFloat(taxas) : null,
          observacoes: observacoes || '',
          userId
        }

        console.log('Dados para criar evento:', eventData); // Debug

        const event = await prisma.saleEvent.create({
          data: eventData
        })

        console.log('Evento criado:', event); // Debug
        res.status(201).json(event)
      } catch (error) {
        console.error('Erro detalhado ao criar evento:', error)
        res.status(500).json({ 
          message: 'Erro ao criar evento',
          error: error.message,
          details: error
        })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)