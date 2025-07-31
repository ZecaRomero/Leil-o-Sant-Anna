import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const animals = await prisma.animal.findMany({
          where: { userId },
          include: {
            gestations: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            weights: {
              orderBy: { data: 'desc' },
              take: 1
            },
            _count: {
              select: {
                costs: true,
                weights: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        res.status(200).json(animals)
      } catch (error) {
        console.error('Get animals error:', error)
        res.status(500).json({ message: 'Erro ao buscar animais' })
      }
      break

    case 'POST':
      try {
        const { brinco, serie, nome, raca, sexo, dataNasc, peso, categoria, observacoes } = req.body

        if (!brinco || !sexo) {
          return res.status(400).json({ message: 'Brinco e sexo são obrigatórios' })
        }

        // Verificar se brinco já existe
        const existingAnimal = await prisma.animal.findUnique({
          where: { brinco }
        })

        if (existingAnimal) {
          return res.status(400).json({ message: 'Brinco já existe' })
        }

        const animal = await prisma.animal.create({
          data: {
            brinco,
            serie, // ADICIONAR ESTA LINHA
            nome,
            raca,
            sexo,
            dataNasc: dataNasc ? new Date(dataNasc) : null,
            peso: peso ? parseFloat(peso) : null,
            categoria,
            observacoes,
            userId
          }
        })

        // Se peso foi informado, criar registro de peso
        if (peso) {
          await prisma.weight.create({
            data: {
              peso: parseFloat(peso),
              data: new Date(),
              animalId: animal.id
            }
          })
        }

        res.status(201).json(animal)
      } catch (error) {
        console.error('Create animal error:', error)
        res.status(500).json({ message: 'Erro ao criar animal' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)
