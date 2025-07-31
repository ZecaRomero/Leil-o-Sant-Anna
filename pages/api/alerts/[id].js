import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  const { method, query } = req
  const { id } = query
  const userId = req.user.id

  switch (method) {
    case 'PUT':
      try {
        const { status } = req.body

        // Verificar se alerta existe e pertence ao usuário
        const alert = await prisma.alert.findFirst({
          where: { id, userId }
        })

        if (!alert) {
          return res.status(404).json({ message: 'Alerta não encontrado' })
        }

        const updatedAlert = await prisma.alert.update({
          where: { id },
          data: { status: status || alert.status }
        })

        res.status(200).json(updatedAlert)
      } catch (error) {
        console.error('Update alert error:', error)
        res.status(500).json({ message: 'Erro ao atualizar alerta' })
      }
      break

    case 'DELETE':
      try {
        // Verificar se alerta existe e pertence ao usuário
        const alert = await prisma.alert.findFirst({
          where: { id, userId }
        })

        if (!alert) {
          return res.status(404).json({ message: 'Alerta não encontrado' })
        }

        await prisma.alert.delete({
          where: { id }
        })

        res.status(200).json({ message: 'Alerta removido com sucesso' })
      } catch (error) {
        console.error('Delete alert error:', error)
        res.status(500).json({ message: 'Erro ao remover alerta' })
      }
      break

    default:
      res.setHeader('Allow', ['PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)