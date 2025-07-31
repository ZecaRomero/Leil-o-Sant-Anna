import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Contar vendas antes de deletar
    const salesCount = await prisma.sale.count()
    
    // Deletar todas as vendas
    await prisma.sale.deleteMany({})
    
    // Deletar todos os eventos de venda
    await prisma.saleEvent.deleteMany({})
    
    // Atualizar status dos animais vendidos para ATIVO
    await prisma.animal.updateMany({
      where: { status: 'VENDIDO' },
      data: { status: 'ATIVO' }
    })

    res.status(200).json({ 
      message: `${salesCount} vendas removidas com sucesso`,
      salesDeleted: salesCount
    })
  } catch (error) {
    console.error('Erro ao limpar vendas:', error)
    res.status(500).json({ message: 'Erro ao limpar vendas' })
  }
}