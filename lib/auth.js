import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  return user
}

export function withAuth(handler) {
  return async (req, res) => {
    const user = await authenticateUser(req)
    
    if (!user) {
      return res.status(401).json({ message: 'Token inválido ou expirado' })
    }

    req.user = user
    return handler(req, res)
  }
}