import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Buscar preços mais recentes de cada produto
        const prices = await prisma.marketPrice.findMany({
          orderBy: { data: 'desc' },
          take: 50 // Limitar para os 50 mais recentes
        })

        // Agrupar por produto e pegar o mais recente de cada
        const latestPrices = {}
        prices.forEach(price => {
          if (!latestPrices[price.produto] || 
              new Date(price.data) > new Date(latestPrices[price.produto].data)) {
            latestPrices[price.produto] = price
          }
        })

        res.status(200).json(Object.values(latestPrices))
      } catch (error) {
        console.error('Erro ao buscar preços:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
      break

    case 'POST':
      try {
        // Verificar autenticação (opcional - pode ser público para admin)
        const token = req.headers.authorization?.replace('Bearer ', '')
        if (token) {
          try {
            jwt.verify(token, process.env.JWT_SECRET)
          } catch (error) {
            return res.status(401).json({ error: 'Token inválido' })
          }
        }

        const { produto, preco, unidade, mercado, fonte } = req.body

        if (!produto || !preco || !unidade || !mercado) {
          return res.status(400).json({ 
            error: 'Produto, preço, unidade e mercado são obrigatórios' 
          })
        }

        const marketPrice = await prisma.marketPrice.create({
          data: {
            produto: produto.toUpperCase(),
            preco: parseFloat(preco),
            unidade,
            mercado,
            data: new Date(),
            fonte: fonte || 'Manual'
          }
        })

        res.status(201).json(marketPrice)
      } catch (error) {
        console.error('Erro ao criar preço:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
      break

    case 'PUT':
      try {
        const token = req.headers.authorization?.replace('Bearer ', '')
        if (token) {
          try {
            jwt.verify(token, process.env.JWT_SECRET)
          } catch (error) {
            return res.status(401).json({ error: 'Token inválido' })
          }
        }

        const { id, preco, fonte } = req.body

        if (!id || !preco) {
          return res.status(400).json({ 
            error: 'ID e preço são obrigatórios' 
          })
        }

        const marketPrice = await prisma.marketPrice.update({
          where: { id },
          data: {
            preco: parseFloat(preco),
            data: new Date(),
            fonte: fonte || 'Manual'
          }
        })

        res.status(200).json(marketPrice)
      } catch (error) {
        console.error('Erro ao atualizar preço:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}