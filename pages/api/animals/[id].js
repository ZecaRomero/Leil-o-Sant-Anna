import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method, query } = req
  const { id } = query
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const animal = await prisma.animal.findFirst({
          where: { id, userId },
          include: {
            gestations: {
              orderBy: { createdAt: 'desc' }
            },
            weights: {
              orderBy: { data: 'desc' }
            },
            costs: {
              orderBy: { data: 'desc' }
            }
          }
        })

        if (!animal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        res.status(200).json(animal)
      } catch (error) {
        console.error('Get animal error:', error)
        res.status(500).json({ message: 'Erro ao buscar animal' })
      }
      break

    case 'PUT':
      try {
        const { brinco, serie, nome, raca, sexo, dataNasc, peso, categoria, observacoes, status } = req.body

        // Verificar se animal existe e pertence ao usuário
        const existingAnimal = await prisma.animal.findFirst({
          where: { id, userId }
        })

        if (!existingAnimal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        // Se brinco foi alterado, verificar se não existe outro com mesmo brinco
        if (brinco && brinco !== existingAnimal.brinco) {
          const duplicateBrinco = await prisma.animal.findUnique({
            where: { brinco }
          })

          if (duplicateBrinco) {
            return res.status(400).json({ message: 'Brinco já existe' })
          }
        }

        const animal = await prisma.animal.update({
          where: { id },
          data: {
            brinco: brinco || existingAnimal.brinco,
            serie, // ADICIONAR ESTA LINHA
            nome,
            raca,
            sexo: sexo || existingAnimal.sexo,
            dataNasc: dataNasc ? new Date(dataNasc) : existingAnimal.dataNasc,
            peso: peso ? parseFloat(peso) : existingAnimal.peso,
            categoria,
            observacoes,
            status: status || existingAnimal.status
          }
        })

        res.status(200).json(animal)
      } catch (error) {
        console.error('Update animal error:', error)
        res.status(500).json({ message: 'Erro ao atualizar animal' })
      }
      break

    case 'DELETE':
      try {
        // Verificar se animal existe e pertence ao usuário
        const animal = await prisma.animal.findFirst({
          where: { id, userId }
        })

        if (!animal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        await prisma.animal.delete({
          where: { id }
        })

        res.status(200).json({ message: 'Animal removido com sucesso' })
      } catch (error) {
        console.error('Delete animal error:', error)
        res.status(500).json({ message: 'Erro ao remover animal' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)
