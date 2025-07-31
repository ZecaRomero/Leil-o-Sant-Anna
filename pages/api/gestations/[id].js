import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method, query } = req
  const { id } = query
  const userId = req.user.id

  switch (method) {
    case 'PUT':
      try {
        const { dataCobertura, dataPrevParto, dataRealParto, touroId, status, observacoes } = req.body

        // Verificar se gestação existe e pertence ao usuário
        const gestation = await prisma.gestation.findFirst({
          where: { 
            id,
            animal: { userId }
          }
        })

        if (!gestation) {
          return res.status(404).json({ message: 'Gestação não encontrada' })
        }

        const updatedGestation = await prisma.gestation.update({
          where: { id },
          data: {
            dataCobertura: dataCobertura ? new Date(dataCobertura) : gestation.dataCobertura,
            dataPrevParto: dataPrevParto ? new Date(dataPrevParto) : gestation.dataPrevParto,
            dataRealParto: dataRealParto ? new Date(dataRealParto) : gestation.dataRealParto,
            touroId: touroId || gestation.touroId,
            status: status || gestation.status,
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

        res.status(200).json(updatedGestation)
      } catch (error) {
        console.error('Update gestation error:', error)
        res.status(500).json({ message: 'Erro ao atualizar gestação' })
      }
      break

    case 'DELETE':
      try {
        // Verificar se gestação existe e pertence ao usuário
        const gestation = await prisma.gestation.findFirst({
          where: { 
            id,
            animal: { userId }
          }
        })

        if (!gestation) {
          return res.status(404).json({ message: 'Gestação não encontrada' })
        }

        await prisma.gestation.delete({
          where: { id }
        })

        res.status(200).json({ message: 'Gestação removida com sucesso' })
      } catch (error) {
        console.error('Delete gestation error:', error)
        res.status(500).json({ message: 'Erro ao remover gestação' })
      }
      break

    default:
      res.setHeader('Allow', ['PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)