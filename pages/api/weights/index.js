import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'POST':
      try {
        const { animalId, peso, data } = req.body

        if (!animalId || !peso || !data) {
          return res.status(400).json({ message: 'Animal, peso e data são obrigatórios' })
        }

        // Verificar se animal existe e pertence ao usuário
        const animal = await prisma.animal.findFirst({
          where: { id: animalId, userId }
        })

        if (!animal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        const weight = await prisma.weight.create({
          data: {
            animalId,
            peso: parseFloat(peso),
            data: new Date(data)
          }
        })

        // Atualizar peso atual do animal
        await prisma.animal.update({
          where: { id: animalId },
          data: { peso: parseFloat(peso) }
        })

        res.status(201).json(weight)
      } catch (error) {
        console.error('Create weight error:', error)
        res.status(500).json({ message: 'Erro ao registrar peso' })
      }
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)