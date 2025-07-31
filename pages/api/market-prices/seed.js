import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Dados iniciais de preços de mercado
    const initialPrices = [
      {
        produto: 'BOI_GORDO',
        preco: 285.50,
        unidade: 'R$/arroba',
        mercado: 'CEPEA/ESALQ',
        fonte: 'CEPEA',
        data: new Date()
      },
      {
        produto: 'VACA_GORDA',
        preco: 265.00,
        unidade: 'R$/arroba',
        mercado: 'CEPEA/ESALQ',
        fonte: 'CEPEA',
        data: new Date()
      },
      {
        produto: 'NOVILHA',
        preco: 245.00,
        unidade: 'R$/arroba',
        mercado: 'CEPEA/ESALQ',
        fonte: 'CEPEA',
        data: new Date()
      },
      {
        produto: 'GARROTE',
        preco: 235.00,
        unidade: 'R$/arroba',
        mercado: 'Mercado Regional',
        fonte: 'Regional',
        data: new Date()
      },
      {
        produto: 'BEZERRO_MACHO',
        preco: 1850.00,
        unidade: 'R$/cabeça',
        mercado: 'Mercado Regional',
        fonte: 'Regional',
        data: new Date()
      },
      {
        produto: 'BEZERRA',
        preco: 1650.00,
        unidade: 'R$/cabeça',
        mercado: 'Mercado Regional',
        fonte: 'Regional',
        data: new Date()
      }
    ]

    // Limpar preços existentes
    await prisma.marketPrice.deleteMany({})

    // Inserir novos preços
    const createdPrices = await prisma.marketPrice.createMany({
      data: initialPrices
    })

    res.status(200).json({
      message: 'Preços iniciais criados com sucesso',
      count: createdPrices.count
    })
  } catch (error) {
    console.error('Erro ao criar preços iniciais:', error)
    res.status(500).json({ message: 'Erro ao criar preços iniciais' })
  }
}