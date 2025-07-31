import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('=== CRIANDO VENDA ===');
    console.log('Dados recebidos:', req.body);
    
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

    // Usando o userId correto do banco
    const userId = 'cmdqdvq8n0000h9l829787qv8'

    // Verificar se o animal existe
    const animal = await prisma.animal.findUnique({
      where: { id: animalId }
    })

    if (!animal) {
      console.error('Animal não encontrado:', animalId);
      return res.status(404).json({ message: 'Animal não encontrado' })
    }
    
    console.log('Animal encontrado:', animal.brinco);

    // Verificar se o evento existe
    if (saleEventId) {
      const event = await prisma.saleEvent.findUnique({
        where: { id: saleEventId }
      });
      
      if (!event) {
        console.error('Evento não encontrado:', saleEventId);
        return res.status(404).json({ message: 'Evento não encontrado' });
      }
      
      console.log('Evento encontrado:', event.nome);
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
        comprador: comprador || '',
        documento: documento || '',
        telefone: telefone || '',
        endereco: endereco || '',
        formaPagamento: formaPagamento || 'PIX',
        observacoes: observacoes || '',
        comissao: comissaoValor,
        taxas: taxasValor,
        valorLiquido,
        saleEventId
      }
    })

    res.status(201).json(sale)
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    res.status(500).json({ 
      message: 'Erro ao criar venda: ' + error.message
    })
  }
}