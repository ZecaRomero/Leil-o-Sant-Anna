import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Buscar preços mais recentes de cada produto
        const prices = await prisma.marketPrice.findMany({
          orderBy: { data: 'desc' },
          distinct: ['produto']
        })

        res.status(200).json(prices)
      } catch (error) {
        console.error('Erro ao buscar preços:', error)
        res.status(500).json({ message: 'Erro ao buscar preços' })
      }
      break

    case 'POST':
      try {
        const { produto, preco, unidade, mercado, fonte } = req.body

        // Criar novo preço
        const price = await prisma.marketPrice.create({
          data: {
            produto: produto.toUpperCase(),
            preco: parseFloat(preco),
            unidade: unidade || 'R$/arroba',
            mercado: mercado || 'Mercado Regional',
            fonte: fonte || 'Manual',
            data: new Date()
          }
        })

        res.status(201).json(price)
      } catch (error) {
        console.error('Erro ao criar preço:', error)
        res.status(500).json({ message: 'Erro ao criar preço' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}