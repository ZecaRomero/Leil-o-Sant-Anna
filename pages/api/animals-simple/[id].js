import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { method, query } = req
  const { id } = query

  if (method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { status } = req.body

    const animal = await prisma.animal.update({
      where: { id },
      data: { status }
    })

    res.status(200).json(animal)
  } catch (error) {
    console.error('Erro ao atualizar animal:', error)
    res.status(500).json({ 
      message: 'Erro ao atualizar animal: ' + error.message
    })
  }
}