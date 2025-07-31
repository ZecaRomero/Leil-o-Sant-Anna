import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    res.status(200).json(users)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    res.status(500).json({ message: 'Erro ao listar usuários' })
  }
}