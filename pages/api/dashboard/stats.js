import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const userId = req.user.id

    // Estatísticas básicas
    const totalAnimals = await prisma.animal.count({
      where: { userId, status: 'ATIVO' }
    })

    const totalGestations = await prisma.gestation.count({
      where: { 
        animal: { userId },
        status: 'GESTANTE'
      }
    })

    const pendingAlerts = await prisma.alert.count({
      where: { userId, status: 'PENDENTE' }
    })

    // Custos do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlyCosts = await prisma.cost.aggregate({
      where: {
        userId,
        data: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        valor: true
      }
    })

    // Animais por categoria
    const animalsByCategory = await prisma.animal.groupBy({
      by: ['categoria'],
      where: { userId, status: 'ATIVO' },
      _count: {
        categoria: true
      }
    })

    // Custos por tipo (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const costsByType = await prisma.cost.groupBy({
      by: ['tipo'],
      where: {
        userId,
        data: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        valor: true
      },
      _count: {
        tipo: true
      }
    })

    // Próximos partos (próximos 30 dias)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const upcomingBirths = await prisma.gestation.findMany({
      where: {
        animal: { userId },
        status: 'GESTANTE',
        dataPrevParto: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        animal: {
          select: {
            brinco: true,
            nome: true
          }
        }
      },
      orderBy: { dataPrevParto: 'asc' }
    })

    res.status(200).json({
      totalAnimals,
      totalGestations,
      pendingAlerts,
      monthlyCosts: monthlyCosts._sum.valor || 0,
      animalsByCategory: animalsByCategory.map(item => ({
        categoria: item.categoria || 'Sem categoria',
        count: item._count.categoria
      })),
      costsByType: costsByType.map(item => ({
        tipo: item.tipo,
        total: item._sum.valor,
        count: item._count.tipo
      })),
      upcomingBirths
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Erro ao buscar estatísticas' })
  }
}

export default withAuth(handler)