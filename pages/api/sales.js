import { prisma } from '../../lib/prisma'
import { withAuth } from '../../lib/auth'

async function handler(req, res) {
  const { method } = req
  const userId = req.user.id

  switch (method) {
    case 'GET':
      try {
        const sales = await prisma.sale.findMany({
          where: { userId },
          include: {
            animal: true,
            saleEvent: true
          },
          orderBy: { dataVenda: 'desc' }
        })

        res.status(200).json(sales)
      } catch (error) {
        console.error('Erro ao buscar vendas:', error)
        res.status(500).json({ message: 'Erro ao buscar vendas' })
      }
      break

    case 'POST':
      try {
        const {
          animalId,
          valor,
          dataVenda,
          comprador,
          documento,
          telefone,
          endereco,
          formaPagamento,
          observacoes,
          comissao,
          taxas,
          saleEventId
        } = req.body

        // Verificar se o animal existe e pertence ao usuário
        const animal = await prisma.animal.findFirst({
          where: { id: animalId, userId }
        })

        if (!animal) {
          return res.status(404).json({ message: 'Animal não encontrado' })
        }

        // Calcular valor líquido
        const valorBruto = parseFloat(valor)
        const comissaoValor = comissao ? parseFloat(comissao) : 0
        const taxasValor = taxas ? parseFloat(taxas) : 0
        const valorLiquido = valorBruto - comissaoValor - taxasValor

        const sale = await prisma.sale.create({
          data: {
            animalId,
            userId,
            valor: valorBruto,
            dataVenda: new Date(dataVenda),
            comprador,
            documento,
            telefone,
            endereco,
            formaPagamento: formaPagamento || 'PIX',
            observacoes,
            comissao: comissaoValor,
            taxas: taxasValor,
            valorLiquido,
            saleEventId
          },
          include: {
            animal: true,
            saleEvent: true
          }
        })

        res.status(201).json(sale)
      } catch (error) {
        console.error('Erro ao criar venda:', error)
        res.status(500).json({ message: 'Erro ao criar venda' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withAuth(handler)