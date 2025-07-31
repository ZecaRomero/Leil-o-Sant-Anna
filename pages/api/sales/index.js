import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Verificar autenticação
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userId = decoded.userId

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
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      // Verificar autenticação
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userId = decoded.userId

      const { vendas } = req.body

      if (!vendas || !Array.isArray(vendas) || vendas.length === 0) {
        return res.status(400).json({ error: 'Dados de vendas inválidos' })
      }

      // Processar cada venda
      const results = []
      
      for (const venda of vendas) {
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
          saleEventId,
          comissao = 0,
          taxas = 0
        } = venda

        // Validações
        if (!animalId || !valor || valor <= 0) {
          return res.status(400).json({ 
            error: `Dados inválidos para animal ID ${animalId}` 
          })
        }

        if (!comprador?.trim()) {
          return res.status(400).json({ 
            error: 'Nome do comprador é obrigatório' 
          })
        }

        // Verificar se o animal existe e pertence ao usuário
        const animal = await prisma.animal.findFirst({
          where: {
            id: animalId,
            userId: userId,
            status: 'ATIVO'
          }
        })

        if (!animal) {
          return res.status(404).json({ 
            error: `Animal não encontrado ou já vendido: ${animalId}` 
          })
        }

        // Criar a venda
        const sale = await prisma.sale.create({
          data: {
            animalId,
            userId,
            valor: parseFloat(valor),
            dataVenda: new Date(dataVenda),
            comprador: comprador.trim(),
            documento: documento?.trim() || null,
            telefone: telefone?.trim() || null,
            endereco: endereco?.trim() || null,
            formaPagamento,
            observacoes: observacoes?.trim() || null,
            saleEventId: saleEventId || null,
            comissao: parseFloat(comissao) || 0,
            taxas: parseFloat(taxas) || 0
          }
        })

        // Atualizar status do animal para VENDIDO
        await prisma.animal.update({
          where: { id: animalId },
          data: { status: 'VENDIDO' }
        })

        // Registrar a receita como custo negativo
        const valorLiquido = parseFloat(valor) - parseFloat(comissao) - parseFloat(taxas)
        
        await prisma.cost.create({
          data: {
            animalId,
            userId,
            tipo: 'VENDA',
            descricao: `Venda para ${comprador}`,
            valor: -valorLiquido, // Valor negativo = receita
            data: new Date(dataVenda),
            observacoes: `Venda por R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${comissao > 0 ? ` - Comissão: R$ ${comissao.toFixed(2)}` : ''}${taxas > 0 ? ` - Taxas: R$ ${taxas.toFixed(2)}` : ''}`
          }
        })

        results.push({
          saleId: sale.id,
          animalId,
          valor: parseFloat(valor),
          valorLiquido,
          status: 'success'
        })
      }

      res.status(201).json({
        message: `${results.length} venda(s) registrada(s) com sucesso`,
        sales: results
      })

    } catch (error) {
      console.error('Erro ao registrar vendas:', error)
      
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Conflito: Animal já possui venda registrada' 
        })
      }
      
      res.status(500).json({ 
        error: 'Erro interno do servidor ao registrar vendas',
        details: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
}
