import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const saleEvents = await prisma.saleEvent.findMany({
          where: { userId },
          include: {
            sales: {
              include: {
                animal: {
                  select: {
                    id: true,
                    brinco: true,
                    nome: true,
                    serie: true
                  }
                }
              }
            },
            _count: {
              select: {
                sales: true
              }
            }
          },
          orderBy: { data: 'desc' }
        })

        res.status(200).json(saleEvents)
      } catch (error) {
        console.error('Get sale events error:', error)
        res.status(500).json({ message: 'Erro ao buscar eventos de venda' })
      }
      break

    case 'POST':
      try {
        const { nome, tipo, data, local, descricao, comissao, taxas, observacoes } = req.body

        if (!nome || !tipo || !data) {
          return res.status(400).json({ message: 'Nome, tipo e data são obrigatórios' })
        }

        const saleEvent = await prisma.saleEvent.create({
          data: {
            nome,
            tipo,
            data: new Date(data),
            local,
            descricao,
            comissao: comissao ? parseFloat(comissao) : null,
            taxas: taxas ? parseFloat(taxas) : null,
            observacoes,
            userId
          }
        })

        res.status(201).json(saleEvent)
      } catch (error) {
        console.error('Create sale event error:', error)
        res.status(500).json({ message: 'Erro ao criar evento de venda' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)
