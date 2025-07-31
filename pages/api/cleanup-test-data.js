import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Remover animais fictícios (BENT, dados de teste, etc.)
    const ficticiousAnimals = await prisma.animal.findMany({
      where: {
        OR: [
          { serie: 'BENT' },
          { brinco: { contains: 'BENT' } },
          { nome: { contains: 'Teste' } },
          { observacoes: { contains: 'teste' } },
          { observacoes: { contains: 'mock' } },
          { observacoes: { contains: 'fictício' } }
        ]
      }
    })

    console.log('Animais fictícios encontrados:', ficticiousAnimals.length)

    // Deletar custos dos animais fictícios
    if (ficticiousAnimals.length > 0) {
      const animalIds = ficticiousAnimals.map(a => a.id)
      
      await prisma.cost.deleteMany({
        where: { animalId: { in: animalIds } }
      })

      await prisma.weight.deleteMany({
        where: { animalId: { in: animalIds } }
      })

      await prisma.gestation.deleteMany({
        where: { animalId: { in: animalIds } }
      })

      // Deletar os animais fictícios
      await prisma.animal.deleteMany({
        where: { id: { in: animalIds } }
      })
    }

    // Limpar dados de preços de mercado antigos (manter apenas os mais recentes)
    const oldPrices = await prisma.marketPrice.findMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Mais de 7 dias
        }
      }
    })

    if (oldPrices.length > 0) {
      await prisma.marketPrice.deleteMany({
        where: {
          id: { in: oldPrices.map(p => p.id) }
        }
      })
    }

    res.status(200).json({ 
      message: 'Dados de teste removidos com sucesso',
      animalsDeleted: ficticiousAnimals.length,
      oldPricesDeleted: oldPrices.length
    })
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error)
    res.status(500).json({ message: 'Erro ao limpar dados de teste' })
  }
}