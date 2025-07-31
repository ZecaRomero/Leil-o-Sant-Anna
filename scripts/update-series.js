const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateAnimalSeries() {
  console.log('Iniciando atualização das séries dos animais...')

  try {
    // Buscar todos os animais que não têm série definida
    const animals = await prisma.animal.findMany({
      where: {
        OR: [
          { serie: null },
          { serie: '' }
        ]
      }
    })

    console.log(`Encontrados ${animals.length} animais sem série definida`)

    let updated = 0

    for (const animal of animals) {
      let serie = 'UNKN' // Padrão se não conseguir extrair

      // Tentar extrair a série do brinco
      if (animal.brinco) {
        const match = animal.brinco.match(/^([A-Z]+)/)
        if (match) {
          serie = match[1]
        }
      }

      // Atualizar o animal com a série extraída
      await prisma.animal.update({
        where: { id: animal.id },
        data: { serie: serie }
      })

      console.log(`Animal ${animal.brinco} atualizado com série: ${serie}`)
      updated++
    }

    console.log(`✅ ${updated} animais atualizados com sucesso!`)

  } catch (error) {
    console.error('Erro ao atualizar séries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
updateAnimalSeries()
  .catch(console.error)
