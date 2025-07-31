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

    const { period = '30', format = 'detailed' } = req.query
    const days = parseInt(period)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Buscar vendas do período
    const sales = await prisma.sale.findMany({
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
      },
      orderBy: { dataVenda: 'desc' }
    })

    // Calcular resumo
    const summary = calculateSummary(sales)

    // Top compradores
    const topBuyers = calculateTopBuyers(sales)

    // Análise por categoria
    const categoryAnalysis = calculateCategoryAnalysis(sales)

    // Vendas detalhadas (se solicitado)
    const detailedSales = format === 'detailed' ? 
      sales.map(sale => {
        const totalCost = sale.animal.costs
          .filter(cost => cost.tipo !== 'VENDA')
          .reduce((sum, cost) => sum + cost.valor, 0)
        
        const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

        return {
          ...sale,
          totalCost,
          profit,
          roi
        }
      }) : null

    // Evolução temporal
    const timeEvolution = calculateTimeEvolution(sales, days)

    res.status(200).json({
      summary,
      topBuyers,
      categoryAnalysis,
      detailedSales,
      timeEvolution,
      period: days,
      generatedAt: new Date(),
      totalRecords: sales.length
    })

  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

function calculateSummary(sales) {
  if (sales.length === 0) {
    return {
      totalRevenue: 0,
      totalAnimals: 0,
      averagePrice: 0,
      averageROI: 0,
      totalProfit: 0,
      totalCosts: 0
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.valor, 0)
  const totalAnimals = sales.length
  const averagePrice = totalRevenue / totalAnimals

  let totalProfit = 0
  let totalCosts = 0
  let validROICount = 0
  let totalROI = 0

  sales.forEach(sale => {
    const costs = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - costs - (sale.comissao || 0) - (sale.taxas || 0)
    totalProfit += profit
    totalCosts += costs

    if (costs > 0) {
      const roi = (profit / costs) * 100
      totalROI += roi
      validROICount += 1
    }
  })

  const averageROI = validROICount > 0 ? totalROI / validROICount : 0

  return {
    totalRevenue,
    totalAnimals,
    averagePrice,
    averageROI,
    totalProfit,
    totalCosts
  }
}

function calculateTopBuyers(sales) {
  const buyerStats = {}

  sales.forEach(sale => {
    if (!buyerStats[sale.comprador]) {
      buyerStats[sale.comprador] = {
        name: sale.comprador,
        document: sale.documento,
        totalValue: 0,
        totalAnimals: 0,
        lastPurchase: sale.dataVenda,
        purchases: []
      }
    }

    buyerStats[sale.comprador].totalValue += sale.valor
    buyerStats[sale.comprador].totalAnimals += 1
    buyerStats[sale.comprador].purchases.push(sale)
    
    // Atualizar última compra se for mais recente
    if (new Date(sale.dataVenda) > new Date(buyerStats[sale.comprador].lastPurchase)) {
      buyerStats[sale.comprador].lastPurchase = sale.dataVenda
    }
  })

  return Object.values(buyerStats)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .map(buyer => ({
      ...buyer,
      averageTicket: buyer.totalValue / buyer.totalAnimals
    }))
}

function calculateCategoryAnalysis(sales) {
  const categories = {}

  sales.forEach(sale => {
    const category = getCategoryFromAnimal(sale.animal)
    const categoryKey = category.name

    if (!categories[categoryKey]) {
      categories[categoryKey] = {
        name: category.name,
        icon: category.icon,
        volume: 0,
        revenue: 0,
        totalCosts: 0,
        totalProfit: 0
      }
    }

    const costs = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - costs - (sale.comissao || 0) - (sale.taxas || 0)

    categories[categoryKey].volume += 1
    categories[categoryKey].revenue += sale.valor
    categories[categoryKey].totalCosts += costs
    categories[categoryKey].totalProfit += profit
  })

  return Object.values(categories).map(category => {
    const averagePrice = category.revenue / category.volume
    const averageROI = category.totalCosts > 0 ? (category.totalProfit / category.totalCosts) * 100 : 0
    
    // Determinar tendência (simulada baseada em performance)
    let trend = 'stable'
    if (averageROI > 25) trend = 'up'
    else if (averageROI < 10) trend = 'down'

    return {
      ...category,
      averagePrice,
      averageROI,
      trend
    }
  }).sort((a, b) => b.revenue - a.revenue)
}

function calculateTimeEvolution(sales, days) {
  const evolution = []
  const salesByDate = {}

  // Agrupar vendas por data
  sales.forEach(sale => {
    const date = new Date(sale.dataVenda).toISOString().split('T')[0]
    if (!salesByDate[date]) {
      salesByDate[date] = {
        count: 0,
        value: 0,
        profit: 0
      }
    }
    
    const costs = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - costs - (sale.comissao || 0) - (sale.taxas || 0)

    salesByDate[date].count += 1
    salesByDate[date].value += sale.valor
    salesByDate[date].profit += profit
  })

  // Gerar dados para cada dia do período
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    evolution.push({
      date: dateStr,
      count: salesByDate[dateStr]?.count || 0,
      value: salesByDate[dateStr]?.value || 0,
      profit: salesByDate[dateStr]?.profit || 0
    })
  }

  return evolution
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