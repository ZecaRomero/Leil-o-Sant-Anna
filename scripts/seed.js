const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@beefsync.com' },
    update: {},
    create: {
      email: 'admin@beefsync.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Usuário admin criado:', adminUser.email)

  // Criar alguns animais de exemplo
  const animals = [
    {
      brinco: '001',
      nome: 'Mimosa',
      raca: 'Nelore',
      sexo: 'F',
      dataNasc: new Date('2020-03-15'),
      peso: 450,
      categoria: 'Matriz',
      userId: adminUser.id
    },
    {
      brinco: '002',
      nome: 'Touro Rex',
      raca: 'Angus',
      sexo: 'M',
      dataNasc: new Date('2019-01-20'),
      peso: 800,
      categoria: 'Reprodutor',
      userId: adminUser.id
    },
    {
      brinco: '003',
      nome: 'Bezerro 1',
      raca: 'Nelore',
      sexo: 'M',
      dataNasc: new Date('2023-05-10'),
      peso: 180,
      categoria: 'Bezerro',
      userId: adminUser.id
    }
  ]

  for (const animalData of animals) {
    const animal = await prisma.animal.upsert({
      where: { brinco: animalData.brinco },
      update: {},
      create: animalData
    })
    console.log('Animal criado:', animal.brinco, animal.nome)

    // Adicionar peso inicial
    await prisma.weight.create({
      data: {
        peso: animalData.peso,
        data: animalData.dataNasc,
        animalId: animal.id
      }
    })
  }

  // Criar alguns custos de exemplo
  const costs = [
    {
      tipo: 'ALIMENTACAO',
      descricao: 'Ração concentrada',
      valor: 150.00,
      data: new Date('2024-01-15'),
      categoria: 'Nutrição',
      userId: adminUser.id
    },
    {
      tipo: 'VETERINARIO',
      descricao: 'Consulta veterinária',
      valor: 80.00,
      data: new Date('2024-01-20'),
      categoria: 'Saúde',
      userId: adminUser.id
    },
    {
      tipo: 'MEDICAMENTO',
      descricao: 'Vacina contra febre aftosa',
      valor: 25.00,
      data: new Date('2024-01-25'),
      categoria: 'Prevenção',
      userId: adminUser.id
    }
  ]

  for (const costData of costs) {
    await prisma.cost.create({
      data: costData
    })
    console.log('Custo criado:', costData.descricao)
  }

  // Criar alguns alertas
  const alerts = [
    {
      tipo: 'VACINA',
      titulo: 'Vacinação pendente',
      descricao: 'Vacina contra brucelose para bezerras',
      data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      prioridade: 'ALTA',
      userId: adminUser.id
    },
    {
      tipo: 'PARTO',
      titulo: 'Parto previsto',
      descricao: 'Mimosa com parto previsto para próxima semana',
      data: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
      prioridade: 'MEDIA',
      userId: adminUser.id
    }
  ]

  for (const alertData of alerts) {
    await prisma.alert.create({
      data: alertData
    })
    console.log('Alerta criado:', alertData.titulo)
  }

  // Criar preços de mercado
  const marketPrices = [
    {
      produto: 'BOI_GORDO',
      preco: 280.50,
      unidade: 'KG',
      mercado: 'NACIONAL',
      data: new Date(),
      fonte: 'CEPEA'
    },
    {
      produto: 'BEZERRO',
      preco: 1800.00,
      unidade: 'CABECA',
      mercado: 'LOCAL',
      data: new Date(),
      fonte: 'Mercado Local'
    }
  ]

  for (const priceData of marketPrices) {
    await prisma.marketPrice.create({
      data: priceData
    })
    console.log('Preço criado:', priceData.produto, priceData.preco)
  }

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })