// API service for animal data management
class AnimalDataManager {
  constructor() {
    this.baseURL = '/api'
    this.token = null
    this.listeners = []
  }

  // Set authentication token
  setToken(token) {
    this.token = token
  }

  // Get headers with auth
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    return headers
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro na requisição')
    }
    return response.json()
  }

  // Listener management
  addListener(callback) {
    this.listeners.push(callback)
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data))
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await this.handleResponse(response)
    this.setToken(data.token)

    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('beef_sync_token', data.token)
      localStorage.setItem('beef_sync_user', JSON.stringify(data.user))
    }

    return data
  }

  async register(email, password, name) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    return this.handleResponse(response)
  }

  // Load token from localStorage
  loadToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('beef_sync_token')
      if (token) {
        this.setToken(token)
        return token
      }
    }
    return null
  }

  // Save token to localStorage
  saveToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('beef_sync_token', token)
      this.setToken(token)
    }
  }

  // Logout and clear token
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('beef_sync_token')
      localStorage.removeItem('beef_sync_user')
    }
    this.token = null
  }

  // Animals API
  async getAllAnimals() {
    const response = await fetch(`${this.baseURL}/animals`, {
      headers: this.getHeaders()
    })
    const animals = await this.handleResponse(response)
    this.notifyListeners(animals)
    return animals
  }

  async getAnimalById(id) {
    const response = await fetch(`${this.baseURL}/animals/${id}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async addAnimal(animalData) {
    const response = await fetch(`${this.baseURL}/animals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(animalData)
    })
    const newAnimal = await this.handleResponse(response)

    // Refresh animals list
    this.getAllAnimals()

    return newAnimal
  }

  async updateAnimal(id, updates) {
    const response = await fetch(`${this.baseURL}/animals/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    })
    const updatedAnimal = await this.handleResponse(response)

    // Refresh animals list
    this.getAllAnimals()

    return updatedAnimal
  }

  async deleteAnimal(id) {
    const response = await fetch(`${this.baseURL}/animals/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    const result = await this.handleResponse(response)

    // Refresh animals list
    this.getAllAnimals()

    return result
  }

  // Gestations API
  async getAllGestations() {
    const response = await fetch(`${this.baseURL}/gestations`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async addGestation(gestationData) {
    const response = await fetch(`${this.baseURL}/gestations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(gestationData)
    })
    return this.handleResponse(response)
  }

  async updateGestation(id, updates) {
    const response = await fetch(`${this.baseURL}/gestations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    })
    return this.handleResponse(response)
  }

  // Costs API
  async getCosts(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseURL}/costs?${params}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async addCost(costData) {
    const response = await fetch(`${this.baseURL}/costs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(costData)
    })
    return this.handleResponse(response)
  }

  // Add cost to specific animal
  async addCustoToAnimal(animalId, novoCusto) {
    const costData = {
      ...novoCusto,
      animalId,
      data: novoCusto.data || new Date().toISOString()
    }
    return this.addCost(costData)
  }

  // Weights API
  async addWeight(weightData) {
    const response = await fetch(`${this.baseURL}/weights`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(weightData)
    })
    return this.handleResponse(response)
  }

  // Alerts API
  async getAlerts(status = null) {
    const params = status ? `?status=${status}` : ''
    const response = await fetch(`${this.baseURL}/alerts${params}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async addAlert(alertData) {
    const response = await fetch(`${this.baseURL}/alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(alertData)
    })
    return this.handleResponse(response)
  }

  async updateAlert(id, updates) {
    const response = await fetch(`${this.baseURL}/alerts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    })
    return this.handleResponse(response)
  }

  // Dashboard API
  async getDashboardStats() {
    const response = await fetch(`${this.baseURL}/dashboard/stats`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  // Legacy methods for compatibility
  async getStatistics() {
    try {
      return await this.getDashboardStats()
    } catch (error) {
      console.error('Error getting statistics:', error)
      return {
        totalAnimals: 0,
        totalGestations: 0,
        pendingAlerts: 0,
        monthlyCosts: 0,
        animalsByCategory: [],
        costsByType: [],
        upcomingBirths: []
      }
    }
  }

  // Register birth with full data
  async registrarNascimento(dadosGestacao, dadosNascimento) {
    try {
      // Create the new animal
      const animalData = {
        brinco: dadosNascimento.rg || dadosNascimento.tatuagem,
        nome: dadosNascimento.nome || null,
        raca: this.getRacaBySerie(dadosNascimento.serie),
        sexo: dadosNascimento.sexo,
        dataNasc: dadosNascimento.dataNascimento,
        peso: parseFloat(dadosNascimento.peso),
        categoria: 'Bezerro',
        observacoes: `FIV - Pai: ${dadosGestacao.paiSerie} ${dadosGestacao.paiRg}, Mãe: ${dadosGestacao.maeSerie} ${dadosGestacao.maeRg}, Receptora: ${dadosGestacao.receptoraNome}`
      }

      const newAnimal = await this.addAnimal(animalData)

      // Add birth costs
      const custoReceptora = dadosGestacao.custoAcumulado * 0.3

      const costs = [
        {
          tipo: 'NASCIMENTO',
          descricao: `Nascimento ${dadosNascimento.tipoNascimento} - Peso: ${dadosNascimento.peso}kg`,
          valor: dadosNascimento.custoNascimento,
          data: dadosNascimento.dataNascimento,
          animalId: newAnimal.id,
          observacoes: dadosNascimento.observacoes
        },
        {
          tipo: 'EXAME',
          descricao: 'DNA - Paternidade + Genômica',
          valor: dadosNascimento.custoDNA,
          data: dadosNascimento.dataNascimento,
          animalId: newAnimal.id,
          observacoes: 'FIV - Confirmação paternidade e análise genômica'
        },
        {
          tipo: 'RECEPTORA',
          descricao: `Rateio receptora ${dadosGestacao.receptoraNome}`,
          valor: custoReceptora,
          data: dadosNascimento.dataNascimento,
          animalId: newAnimal.id,
          observacoes: `30% do custo total da receptora (R$ ${dadosGestacao.custoAcumulado.toFixed(2)})`
        }
      ]

      // Add all costs
      for (const cost of costs) {
        await this.addCost(cost)
      }

      return newAnimal
    } catch (error) {
      console.error('Error registering birth:', error)
      throw error
    }
  }

  // Register animal sale
  async registrarVenda(animalId, valorVenda, dataVenda, observacoes) {
    try {
      // Update animal status
      await this.updateAnimal(animalId, {
        status: 'VENDIDO'
      })

      // Add sale cost (negative value)
      await this.addCost({
        tipo: 'VENDA',
        descricao: 'Venda do animal',
        valor: -valorVenda,
        data: dataVenda,
        animalId,
        observacoes: observacoes || `Venda por R$ ${valorVenda.toFixed(2)}`
      })

      return { success: true }
    } catch (error) {
      console.error('Error registering sale:', error)
      throw error
    }
  }

  // Utility methods
  searchAnimals(animals, query) {
    const searchTerm = query.toLowerCase()
    return animals.filter(animal =>
      animal.brinco.toLowerCase().includes(searchTerm) ||
      (animal.nome && animal.nome.toLowerCase().includes(searchTerm)) ||
      (animal.raca && animal.raca.toLowerCase().includes(searchTerm))
    )
  }

  getAnimalsByCategory(animals, categoria) {
    return animals.filter(animal => animal.categoria === categoria)
  }

  getRacaBySerie(serie) {
    const racasPorSerie = {
      'CJCJ': 'Nelore',
      'BENT': 'Brahman',
      'CJCG': 'Gir',
      'RPT': 'Receptora'
    }
    return racasPorSerie[serie] || 'Nelore'
  }

  calcularIdadeEmMeses(dataNascimento) {
    if (!dataNascimento) return 0

    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    const diffTime = hoje - nascimento
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    return Math.floor(diffDays / 30)
  }

  // Export data
  async exportarDados() {
    try {
      const [animals, stats] = await Promise.all([
        this.getAllAnimals(),
        this.getStatistics()
      ])

      return {
        animals,
        statistics: stats,
        exportDate: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }
}

// Create singleton instance
const animalDataManager = new AnimalDataManager()

// Initialize token on load
if (typeof window !== 'undefined') {
  animalDataManager.loadToken()
}

export default animalDataManager
export { AnimalDataManager }
