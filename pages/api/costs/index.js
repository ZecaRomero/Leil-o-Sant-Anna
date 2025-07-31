import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const { animalId, startDate, endDate, tipo } = req.query
        
        const where = {
          userId,
          ...(animalId && { animalId }),
          ...(tipo && { tipo }),
          ...(startDate && endDate && {
            data: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        }

        const costs = await prisma.cost.findMany({
          where,
          include: {
            animal: {
              select: {
                id: true,
                brinco: true,
                nome: true
              }
            }
          },
          orderBy: { data: 'desc' }
        })

        res.status(200).json(costs)
      } catch (error) {
        console.error('Get costs error:', error)
        res.status(500).json({ message: 'Erro ao buscar custos' })
      }
      break

    case 'POST':
      try {
        const { tipo, descricao, valor, data, categoria, observacoes, animalId } = req.body

        if (!tipo || !descricao || !valor || !data) {
          return res.status(400).json({ message: 'Tipo, descrição, valor e data são obrigatórios' })
        }

        // Se animalId foi fornecido, verificar se pertence ao usuário
        if (animalId) {
          const animal = await prisma.animal.findFirst({
            where: { id: animalId, userId }
          })

          if (!animal) {
            return res.status(404).json({ message: 'Animal não encontrado' })
          }
        }

        const cost = await prisma.cost.create({
          data: {
            tipo,
            descricao,
            valor: parseFloat(valor),
            data: new Date(data),
            categoria,
            observacoes,
            userId,
            animalId: animalId || null
          },
          include: {
            animal: {
              select: {
                id: true,
                brinco: true,
                nome: true
              }
            }
          }
        })

        res.status(201).json(cost)
      } catch (error) {
        console.error('Create cost error:', error)
        res.status(500).json({ message: 'Erro ao criar custo' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)