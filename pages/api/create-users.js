import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verificar se os usuários já existem
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['bento@fazenda.com', 'nilson@fazenda.com']
        }
      }
    })

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Usuários já existem',
        existing: existingUsers.map(u => u.email)
      })
    }

    // Criar usuários
    const users = [
      {
        email: 'bento@fazenda.com',
        name: 'Bento (Dono)',
        password: await bcrypt.hash('bento123', 10),
        role: 'OWNER'
      },
      {
        email: 'nilson@fazenda.com', 
        name: 'Nilson (Gerente)',
        password: await bcrypt.hash('nilson123', 10),
        role: 'MANAGER'
      }
    ]

    const createdUsers = await Promise.all(
      users.map(user => prisma.user.create({ data: user }))
    )

    res.status(201).json({
      message: 'Usuários criados com sucesso',
      users: createdUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role
      })),
      credentials: [
        { email: 'bento@fazenda.com', password: 'bento123', role: 'Dono' },
        { email: 'nilson@fazenda.com', password: 'nilson123', role: 'Gerente' }
      ]
    })
  } catch (error) {
    console.error('Erro ao criar usuários:', error)
    res.status(500).json({ message: 'Erro ao criar usuários' })
  }
}