import { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function MarketPriceManager({ isOpen, onClose }) {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingPrice, setEditingPrice] = useState(null)
  const [newPrice, setNewPrice] = useState({
    produto: '',
    preco: '',
    unidade: 'R$/arroba',
    mercado: 'CEPEA/ESALQ',
    fonte: 'Manual'
  })

  const produtos = [
    { value: 'GARROTE', label: 'Garrote' },
    { value: 'NOVILHA', label: 'Novilha' },
    { value: 'BOI_GORDO', label: 'Boi Gordo' },
    { value: 'VACA_GORDA', label: 'Vaca Gorda' },
    { value: 'BEZERRO_MACHO', label: 'Bezerro Macho' },
    { value: 'BEZERRA', label: 'Bezerra' }
  ]

  const unidades = [
    'R$/arroba',
    'R$/cabeça',
    'R$/kg'
  ]

  const mercados = [
    'CEPEA/ESALQ',
    'Mercado Regional',
    'B3',
    'Local'
  ]

  useEffect(() => {
    if (isOpen) {
      loadPrices()
    }
  }, [isOpen])

  const loadPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/market-prices')
      const data = await response.json()
      setPrices(data)
    } catch (error) {
      console.error('Erro ao carregar preços:', error)
      alert('Erro ao carregar preços')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrice = async () => {
    try {
      if (!newPrice.produto || !newPrice.preco) {
        alert('Produto e preço são obrigatórios')
        return
      }

      const response = await fetch('/api/market-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPrice)
      })

      if (response.ok) {
        setNewPrice({
          produto: '',
          preco: '',
          unidade: 'R$/arroba',
          mercado: 'CEPEA/ESALQ',
          fonte: 'Manual'
        })
        loadPrices()
        alert('Preço salvo com sucesso!')
      } else {
        alert('Erro ao salvar preço')
      }
    } catch (error) {
      console.error('Erro ao salvar preço:', error)
      alert('Erro ao salvar preço')
    }
  }

  const handleQuickUpdate = async () => {
    try {
      const quickPrices = [
        { produto: 'GARROTE', preco: 285, unidade: 'R$/arroba', mercado: 'Mercado Regional', fonte: 'Quick Update' },
        { produto: 'NOVILHA', preco: 265, unidade: 'R$/arroba', mercado: 'CEPEA/ESALQ', fonte: 'Quick Update' }
      ]

      const response = await fetch('/api/market-prices/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prices: quickPrices })
      })

      if (response.ok) {
        loadPrices()
        alert('Preços atualizados com sucesso!')
      } else {
        alert('Erro ao atualizar preços')
      }
    } catch (error) {
      console.error('Erro ao atualizar preços:', error)
      alert('Erro ao atualizar preços')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Gerenciar Preços de Mercado</h2>
              <p className="text-green-100">Atualize os preços reais do mercado</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleQuickUpdate}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Atualização Rápida
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Formulário para Novo Preço */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar/Atualizar Preço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produto *
                </label>
                <select
                  value={newPrice.produto}
                  onChange={(e) => setNewPrice({...newPrice, produto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="">Selecionar...</option>
                  {produtos.map(produto => (
                    <option key={produto.value} value={produto.value}>
                      {produto.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice.preco}
                  onChange={(e) => setNewPrice({...newPrice, preco: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unidade
                </label>
                <select
                  value={newPrice.unidade}
                  onChange={(e) => setNewPrice({...newPrice, unidade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                >
                  {unidades.map(unidade => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mercado
                </label>
                <select
                  value={newPrice.mercado}
                  onChange={(e) => setNewPrice({...newPrice, mercado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                >
                  {mercados.map(mercado => (
                    <option key={mercado} value={mercado}>
                      {mercado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSavePrice}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Salvar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Preços Atuais */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preços Atuais
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <div className="text-gray-600 dark:text-gray-400">Carregando preços...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Produto</th>
                      <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Preço</th>
                      <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Unidade</th>
                      <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Mercado</th>
                      <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Fonte</th>
                      <th className="text-center p-4 font-semibold text-gray-900 dark:text-white">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((price) => (
                      <tr key={price.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {price.produto}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-bold text-green-600 dark:text-green-400">
                            R$ {price.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                          {price.unidade}
                        </td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                          {price.mercado}
                        </td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                          {price.fonte}
                        </td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                          {new Date(price.data).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}