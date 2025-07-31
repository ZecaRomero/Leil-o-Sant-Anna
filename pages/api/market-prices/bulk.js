import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { prices } = req.body

    if (!prices || !Array.isArray(prices)) {
      return res.status(400).json({ message: 'Prices array is required' })
    }

    // Inserir múltiplos preços
    const createdPrices = await prisma.marketPrice.createMany({
      data: prices.map(price => ({
        produto: price.produto.toUpperCase(),
        preco: parseFloat(price.preco),
        unidade: price.unidade || 'R$/arroba',
        mercado: price.mercado || 'Mercado Regional',
        fonte: price.fonte || 'Manual',
        data: new Date()
      }))
    })

    res.status(201).json({
      message: 'Preços atualizados com sucesso',
      count: createdPrices.count
    })
  } catch (error) {
    console.error('Erro ao atualizar preços:', error)
    res.status(500).json({ message: 'Erro ao atualizar preços' })
  }
}