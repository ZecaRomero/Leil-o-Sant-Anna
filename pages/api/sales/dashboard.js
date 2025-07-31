import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { period = '30' } = req.query
    const days = parseInt(period)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
    const previousEndDate = new Date()
    previousEndDate.setDate(previousEndDate.getDate() - days)

    // Buscar vendas do período atual
    const currentSales = await prisma.sale.findMany({
      where: {
        userId,
        dataVenda: {
          gte: startDate
        }
      },
      include: {
        animal: {
          include: {
            costs: true
          }
        },
        saleEvent: true
      }
    })

    // Buscar vendas do período anterior para comparação
    const previousSales = await prisma.sale.findMany({
      where: {
        userId,
        dataVenda: {
          gte: previousStartDate,
          lt: previousEndDate
        }
      },
      include: {
        animal: {
          include: {
            costs: true
          }
        }
      }
    })

    // Calcular métricas do período atual
    const currentMetrics = calculateMetrics(currentSales)
    const previousMetrics = calculateMetrics(previousSales)

    // Calcular crescimento
    const metrics = {
      totalRevenue: currentMetrics.totalRevenue,
      totalAnimals: currentMetrics.totalAnimals,
      averagePrice: currentMetrics.averagePrice,
      averageROI: currentMetrics.averageROI,
      revenueGrowth: calculateGrowth(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      animalsGrowth: calculateGrowth(currentMetrics.totalAnimals, previousMetrics.totalAnimals),
      priceGrowth: calculateGrowth(currentMetrics.averagePrice, previousMetrics.averagePrice),
      roiGrowth: calculateGrowth(currentMetrics.averageROI, previousMetrics.averageROI)
    }

    // Top compradores
    const buyerStats = {}
    currentSales.forEach(sale => {
      if (!buyerStats[sale.comprador]) {
        buyerStats[sale.comprador] = {
          name: sale.comprador,
          totalValue: 0,
          totalAnimals: 0,
          sales: []
        }
      }
      buyerStats[sale.comprador].totalValue += sale.valor
      buyerStats[sale.comprador].totalAnimals += 1
      buyerStats[sale.comprador].sales.push(sale)
    })

    const topBuyers = Object.values(buyerStats)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)
      .map(buyer => ({
        ...buyer,
        averagePrice: buyer.totalValue / buyer.totalAnimals
      }))

    // Vendas por categoria
    const categoryStats = {}
    currentSales.forEach(sale => {
      const category = getCategoryFromAnimal(sale.animal)
      if (!categoryStats[category.name]) {
        categoryStats[category.name] = {
          name: category.name,
          icon: category.icon,
          count: 0,
          totalValue: 0
        }
      }
      categoryStats[category.name].count += 1
      categoryStats[category.name].totalValue += sale.valor
    })

    const totalSales = currentSales.length
    const salesByCategory = Object.values(categoryStats)
      .sort((a, b) => b.totalValue - a.totalValue)
      .map(category => ({
        ...category,
        percentage: totalSales > 0 ? ((category.count / totalSales) * 100).toFixed(1) : 0,
        averagePrice: category.totalValue / category.count
      }))

    // Vendas recentes (últimas 10)
    const recentSales = currentSales
      .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
      .slice(0, 10)
      .map(sale => {
        const totalCosts = sale.animal.costs
          .filter(cost => cost.tipo !== 'VENDA')
          .reduce((sum, cost) => sum + cost.valor, 0)
        
        const profit = sale.valor - totalCosts - (sale.comissao || 0) - (sale.taxas || 0)
        const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0

        return {
          ...sale,
          profit,
          roi
        }
      })

    // Evolução das vendas (dados para gráfico)
    const salesEvolution = generateSalesEvolution(currentSales, days)

    res.status(200).json({
      metrics,
      topBuyers,
      salesByCategory,
      recentSales,
      salesEvolution,
      period: days
    })

  } catch (error) {
    console.error('Erro ao buscar dashboard de vendas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

function calculateMetrics(sales) {
  if (sales.length === 0) {
    return {
      totalRevenue: 0,
      totalAnimals: 0,
      averagePrice: 0,
      averageROI: 0
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.valor, 0)
  const totalAnimals = sales.length
  const averagePrice = totalRevenue / totalAnimals

  // Calcular ROI médio
  let totalROI = 0
  let validROICount = 0

  sales.forEach(sale => {
    const totalCosts = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    if (totalCosts > 0) {
      const profit = sale.valor - totalCosts - (sale.comissao || 0) - (sale.taxas || 0)
      const roi = (profit / totalCosts) * 100
      totalROI += roi
      validROICount += 1
    }
  })

  const averageROI = validROICount > 0 ? totalROI / validROICount : 0

  return {
    totalRevenue,
    totalAnimals,
    averagePrice,
    averageROI
  }
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function getCategoryFromAnimal(animal) {
  // Determinar categoria baseada no sexo e idade estimada
  const ageInMonths = animal.dataNasc ? 
    Math.floor((new Date() - new Date(animal.dataNasc)) / (1000 * 60 * 60 * 24 * 30)) : 
    24 // Assumir 24 meses se não tiver data de nascimento

  if (ageInMonths <= 12) {
    return {
      name: animal.sexo === 'Macho' ? 'Bezerro' : 'Bezerra',
      icon: animal.sexo === 'Macho' ? '🐂' : '🐄'
    }
  } else if (ageInMonths <= 24) {
    return {
      name: animal.sexo === 'Macho' ? 'Garrote' : 'Novilha',
      icon: animal.sexo === 'Macho' ? '🐃' : '🐮'
    }
  } else {
    return {
      name: animal.sexo === 'Macho' ? 'Boi' : 'Vaca',
      icon: animal.sexo === 'Macho' ? '🐂' : '🐄'
    }
  }
}

function generateSalesEvolution(sales, days) {
  const evolution = []
  const salesByDate = {}

  // Agrupar vendas por data
  sales.forEach(sale => {
    const date = new Date(sale.dataVenda).toISOString().split('T')[0]
    if (!salesByDate[date]) {
      salesByDate[date] = {
        count: 0,
        value: 0
      }
    }
    salesByDate[date].count += 1
    salesByDate[date].value += sale.valor
  })

  // Gerar dados para cada dia do período
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    evolution.push({
      date: dateStr,
      count: salesByDate[dateStr]?.count || 0,
      value: salesByDate[dateStr]?.value || 0
    })
  }

  return evolution
}