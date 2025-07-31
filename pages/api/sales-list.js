import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        animal: true,
        saleEvent: true
      },
      orderBy: { dataVenda: 'desc' }
    })

    console.log('Vendas encontradas:', sales.length)
    res.status(200).json(sales)
  } catch (error) {
    console.error('Erro ao listar vendas:', error)
    res.status(500).json({ message: 'Erro ao listar vendas' })
  }
}