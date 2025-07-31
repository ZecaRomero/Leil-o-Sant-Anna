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

    const { period = '90' } = req.query
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

    // Buscar vendas do período anterior
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

    // Calcular métricas de performance
    const performance = calculatePerformanceMetrics(currentSales, previousSales)

    // Análise por categoria
    const categoryAnalysis = calculateCategoryAnalysis(currentSales)

    // Análise de sazonalidade
    const seasonality = calculateSeasonality(currentSales)

    // Gerar recomendações
    const recommendations = generateRecommendations(currentSales, categoryAnalysis, performance)

    res.status(200).json({
      performance,
      categoryAnalysis,
      seasonality,
      recommendations,
      period: days
    })

  } catch (error) {
    console.error('Erro ao buscar analytics de vendas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

function calculatePerformanceMetrics(currentSales, previousSales) {
  // Métricas atuais
  const totalRevenue = currentSales.reduce((sum, sale) => sum + sale.valor, 0)
  const totalVolume = currentSales.length
  
  let totalProfit = 0
  let totalCosts = 0
  
  currentSales.forEach(sale => {
    const costs = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - costs - (sale.comissao || 0) - (sale.taxas || 0)
    totalProfit += profit
    totalCosts += costs
  })

  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  const salesFrequency = totalVolume / (currentSales.length > 0 ? 
    Math.ceil((new Date() - new Date(Math.min(...currentSales.map(s => new Date(s.dataVenda))))) / (1000 * 60 * 60 * 24 * 30)) : 1)

  // Métricas anteriores
  const prevTotalRevenue = previousSales.reduce((sum, sale) => sum + sale.valor, 0)
  const prevTotalVolume = previousSales.length
  
  let prevTotalProfit = 0
  previousSales.forEach(sale => {
    const costs = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - costs - (sale.comissao || 0) - (sale.taxas || 0)
    prevTotalProfit += profit
  })

  const prevAverageMargin = prevTotalRevenue > 0 ? (prevTotalProfit / prevTotalRevenue) * 100 : 0
  const prevSalesFrequency = prevTotalVolume / (previousSales.length > 0 ? 
    Math.ceil((new Date() - new Date(Math.min(...previousSales.map(s => new Date(s.dataVenda))))) / (1000 * 60 * 60 * 24 * 30)) : 1)

  // Calcular crescimento
  const revenueGrowth = calculateGrowth(totalRevenue, prevTotalRevenue)
  const volumeGrowth = calculateGrowth(totalVolume, prevTotalVolume)
  const marginGrowth = calculateGrowth(averageMargin, prevAverageMargin)
  const frequencyGrowth = calculateGrowth(salesFrequency, prevSalesFrequency)

  return {
    totalRevenue,
    totalVolume,
    averageMargin,
    salesFrequency,
    revenueGrowth,
    volumeGrowth,
    marginGrowth,
    frequencyGrowth
  }
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
        totalProfit: 0,
        sales: []
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
    categories[categoryKey].sales.push(sale)
  })

  const totalVolume = sales.length
  
  return Object.values(categories).map(category => {
    const averagePrice = category.revenue / category.volume
    const averageROI = category.totalCosts > 0 ? (category.totalProfit / category.totalCosts) * 100 : 0
    const margin = category.revenue > 0 ? (category.totalProfit / category.revenue) * 100 : 0
    const percentage = totalVolume > 0 ? ((category.volume / totalVolume) * 100).toFixed(1) : 0
    
    // Determinar tendência (simulada baseada em performance)
    let trend = 'stable'
    if (averageROI > 25) trend = 'up'
    else if (averageROI < 10) trend = 'down'
    
    return {
      ...category,
      averagePrice,
      averageROI,
      margin,
      percentage,
      trend
    }
  }).sort((a, b) => b.revenue - a.revenue)
}

function calculateSeasonality(sales) {
  const monthlyData = {}
  
  sales.forEach(sale => {
    const month = new Date(sale.dataVenda).toLocaleDateString('pt-BR', { month: 'long' })
    
    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        volume: 0,
        revenue: 0
      }
    }
    
    monthlyData[month].volume += 1
    monthlyData[month].revenue += sale.valor
  })

  const maxRevenue = Math.max(...Object.values(monthlyData).map(m => m.revenue))
  
  return Object.values(monthlyData).map(month => ({
    ...month,
    intensity: maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue)
}

function generateRecommendations(sales, categoryAnalysis, performance) {
  const recommendations = []
  
  // Recomendação baseada em performance geral
  if (performance.revenueGrowth < -10) {
    recommendations.push({
      type: 'warning',
      title: 'Queda na Receita',
      description: 'Sua receita caiu mais de 10% no período. Considere revisar sua estratégia de preços ou aumentar o volume de vendas.',
      impact: 'Alto'
    })
  } else if (performance.revenueGrowth > 20) {
    recommendations.push({
      type: 'opportunity',
      title: 'Crescimento Acelerado',
      description: 'Excelente crescimento na receita! Considere expandir as categorias que estão performando melhor.',
      impact: 'Alto'
    })
  }

  // Recomendação baseada em margem
  if (performance.averageMargin < 15) {
    recommendations.push({
      type: 'warning',
      title: 'Margem Baixa',
      description: 'Sua margem de lucro está abaixo de 15%. Revise seus custos ou considere ajustar preços.',
      impact: 'Médio'
    })
  }

  // Recomendação baseada em categorias
  const bestCategory = categoryAnalysis.find(cat => cat.averageROI > 30)
  if (bestCategory) {
    recommendations.push({
      type: 'opportunity',
      title: `Foque em ${bestCategory.name}`,
      description: `A categoria ${bestCategory.name} tem ROI de ${bestCategory.averageROI.toFixed(1)}%. Considere aumentar o investimento nesta categoria.`,
      impact: 'Médio'
    })
  }

  const worstCategory = categoryAnalysis.find(cat => cat.averageROI < 5)
  if (worstCategory) {
    recommendations.push({
      type: 'alert',
      title: `Revisar ${worstCategory.name}`,
      description: `A categoria ${worstCategory.name} tem ROI baixo (${worstCategory.averageROI.toFixed(1)}%). Analise os custos ou considere outras estratégias.`,
      impact: 'Alto'
    })
  }

  // Recomendação baseada em frequência
  if (performance.salesFrequency < 2) {
    recommendations.push({
      type: 'opportunity',
      title: 'Aumentar Frequência de Vendas',
      description: 'Você está vendendo menos de 2 animais por mês. Considere estratégias para acelerar o giro do rebanho.',
      impact: 'Médio'
    })
  }

  return recommendations.slice(0, 4) // Limitar a 4 recomendações
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