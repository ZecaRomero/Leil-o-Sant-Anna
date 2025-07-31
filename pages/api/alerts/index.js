import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const { status } = req.query
        
        const where = {
          userId,
          ...(status && { status })
        }

        const alerts = await prisma.alert.findMany({
          where,
          orderBy: [
            { prioridade: 'desc' },
            { data: 'asc' }
          ]
        })

        res.status(200).json(alerts)
      } catch (error) {
        console.error('Get alerts error:', error)
        res.status(500).json({ message: 'Erro ao buscar alertas' })
      }
      break

    case 'POST':
      try {
        const { tipo, titulo, descricao, data, prioridade } = req.body

        if (!tipo || !titulo || !descricao || !data) {
          return res.status(400).json({ message: 'Tipo, título, descrição e data são obrigatórios' })
        }

        const alert = await prisma.alert.create({
          data: {
            tipo,
            titulo,
            descricao,
            data: new Date(data),
            prioridade: prioridade || 'MEDIA',
            userId
          }
        })

        res.status(201).json(alert)
      } catch (error) {
        console.error('Create alert error:', error)
        res.status(500).json({ message: 'Erro ao criar alerta' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)