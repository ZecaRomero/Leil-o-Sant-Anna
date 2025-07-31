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

    const { period = '30', format = 'xlsx' } = req.query
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

    if (format === 'xlsx') {
      return exportToExcel(res, sales, period)
    } else if (format === 'pdf') {
      return exportToPDF(res, sales, period)
    } else if (format === 'csv') {
      return exportToCSV(res, sales, period)
    } else {
      return res.status(400).json({ error: 'Formato não suportado' })
    }

  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

function exportToCSV(res, sales, period) {
  const csvHeaders = [
    'Data da Venda',
    'Animal (Série/RG)',
    'Raça',
    'Sexo',
    'Comprador',
    'Documento',
    'Telefone',
    'Valor da Venda',
    'Custo Total',
    'Lucro',
    'ROI (%)',
    'Forma de Pagamento',
    'Comissão',
    'Taxas',
    'Observações'
  ].join(',')

  const csvRows = sales.map(sale => {
    const totalCost = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

    return [
      new Date(sale.dataVenda).toLocaleDateString('pt-BR'),
      `${sale.animal.serie || ''} ${sale.animal.rg || ''}`.trim(),
      sale.animal.raca || '',
      sale.animal.sexo || '',
      sale.comprador || '',
      sale.documento || '',
      sale.telefone || '',
      sale.valor.toFixed(2),
      totalCost.toFixed(2),
      profit.toFixed(2),
      roi.toFixed(2),
      sale.formaPagamento || '',
      (sale.comissao || 0).toFixed(2),
      (sale.taxas || 0).toFixed(2),
      sale.observacoes || ''
    ].map(field => `"${field}"`).join(',')
  })

  const csvContent = [csvHeaders, ...csvRows].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="relatorio-vendas-${period}dias.csv"`)
  res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'))
  
  return res.status(200).send('\ufeff' + csvContent) // BOM para UTF-8
}

function exportToExcel(res, sales, period) {
  // Simulação de exportação Excel - em produção usar biblioteca como 'exceljs'
  const data = sales.map(sale => {
    const totalCost = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

    return {
      'Data da Venda': new Date(sale.dataVenda).toLocaleDateString('pt-BR'),
      'Animal': `${sale.animal.serie || ''} ${sale.animal.rg || ''}`.trim(),
      'Raça': sale.animal.raca || '',
      'Sexo': sale.animal.sexo || '',
      'Comprador': sale.comprador || '',
      'Documento': sale.documento || '',
      'Telefone': sale.telefone || '',
      'Valor da Venda': sale.valor,
      'Custo Total': totalCost,
      'Lucro': profit,
      'ROI (%)': roi,
      'Forma de Pagamento': sale.formaPagamento || '',
      'Comissão': sale.comissao || 0,
      'Taxas': sale.taxas || 0,
      'Observações': sale.observacoes || ''
    }
  })

  // Por enquanto, retornar JSON que seria convertido para Excel
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="relatorio-vendas-${period}dias.json"`)
  
  return res.status(200).json({
    title: `Relatório de Vendas - ${period} dias`,
    generatedAt: new Date(),
    data: data,
    summary: {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.valor, 0),
      period: `${period} dias`
    }
  })
}

function exportToPDF(res, sales, period) {
  // Simulação de exportação PDF - em produção usar biblioteca como 'puppeteer' ou 'pdfkit'
  const htmlContent = generatePDFHTML(sales, period)
  
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Disposition', `attachment; filename="relatorio-vendas-${period}dias.html"`)
  
  return res.status(200).send(htmlContent)
}

function generatePDFHTML(sales, period) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.valor, 0)
  const totalAnimals = sales.length

  let tableRows = ''
  sales.forEach(sale => {
    const totalCost = sale.animal.costs
      .filter(cost => cost.tipo !== 'VENDA')
      .reduce((sum, cost) => sum + cost.valor, 0)
    
    const profit = sale.valor - totalCost - (sale.comissao || 0) - (sale.taxas || 0)
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

    tableRows += `
      <tr>
        <td>${new Date(sale.dataVenda).toLocaleDateString('pt-BR')}</td>
        <td>${sale.animal.serie || ''} ${sale.animal.rg || ''}</td>
        <td>${sale.animal.raca || ''}</td>
        <td>${sale.comprador || ''}</td>
        <td>R$ ${sale.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>${roi.toFixed(1)}%</td>
      </tr>
    `
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Vendas - ${period} dias</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🐄 Beef Sync - Relatório de Vendas</h1>
            <h2>Período: ${period} dias</h2>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="summary">
            <h3>📊 Resumo Executivo</h3>
            <p><strong>Total de Animais Vendidos:</strong> ${totalAnimals}</p>
            <p><strong>Receita Total:</strong> R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><strong>Ticket Médio:</strong> R$ ${(totalRevenue / totalAnimals || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Animal</th>
                    <th>Raça</th>
                    <th>Comprador</th>
                    <th>Valor Venda</th>
                    <th>Custo Total</th>
                    <th>Lucro</th>
                    <th>ROI</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema Beef Sync</p>
            <p>Para mais informações, acesse o dashboard completo</p>
        </div>
    </body>
    </html>
  `
}