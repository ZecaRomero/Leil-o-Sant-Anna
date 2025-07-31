import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const gestations = await prisma.gestation.findMany({
          include: {
            animal: {
              where: { userId },
              select: {
                id: true,
                brinco: true,
                nome: true,
                raca: true
              }
            }
          },
          where: {
            animal: {
              userId
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        res.status(200).json(gestations)
      } catch (error) {
        console.error('Get gestations error:', error)
        res.status(500).json({ message: 'Erro ao buscar gestações' })
      }
      break

    case 'POST':
      try {
        const { animalId, dataCobertura, dataPrevParto, touroId, observacoes } = req.body

        if (!animalId || !dataCobertura || !dataPrevParto) {
          return res.status(400).json({ message: 'Animal, data de cobertura e data prevista de parto são obrigatórios' })
        }

        // Verificar se animal existe e pertence ao usuário
        const animal = await prisma.animal.findFirst({
          where: { id: animalId, userId }
        })

        if (!animal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        const gestation = await prisma.gestation.create({
          data: {
            animalId,
            dataCobertura: new Date(dataCobertura),
            dataPrevParto: new Date(dataPrevParto),
            touroId,
            observacoes
          },
          include: {
            animal: {
              select: {
                id: true,
                brinco: true,
                nome: true,
                raca: true
              }
            }
          }
        })

        res.status(201).json(gestation)
      } catch (error) {
        console.error('Create gestation error:', error)
        res.status(500).json({ message: 'Erro ao criar gestação' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)