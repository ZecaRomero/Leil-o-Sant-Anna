import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function SalesManager({
  isOpen,
  onClose,
  selectedAnimals = [],
  onSalesComplete,
}) {
  const [saleEvents, setSaleEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados do evento
  const [eventData, setEventData] = useState({
    nome: "",
    tipo: "VENDA_DIRETA",
    data: new Date().toISOString().split("T")[0],
    local: "",
    descricao: "",
    comissao: "",
    taxas: "",
    observacoes: "",
  });

  // Dados das vendas
  const [salesData, setSalesData] = useState([]);
  const [buyerData, setBuyerData] = useState({
    comprador: "",
    documento: "",
    telefone: "",
    endereco: "",
    formaPagamento: "PIX",
  });

  useEffect(() => {
    if (isOpen) {
      loadSaleEvents();
      initializeSalesData();
    }
  }, [isOpen, selectedAnimals]);

  const loadSaleEvents = async () => {
    try {
      const response = await fetch("/api/sale-events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("beef_sync_token")}`,
        },
      });
      const events = await response.json();
      setSaleEvents(events);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  const initializeSalesData = () => {
    const initialSales = selectedAnimals.map((animal) => ({
      animalId: animal.id,
      animal: animal,
      valor: "",
      observacoes: "",
    }));
    setSalesData(initialSales);
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sale-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("beef_sync_token")}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setSaleEvents([newEvent, ...saleEvents]);
        setSelectedEvent(newEvent.id);
        setShowNewEvent(false);
        setEventData({
          nome: "",
          tipo: "VENDA_DIRETA",
          data: new Date().toISOString().split("T")[0],
          local: "",
          descricao: "",
          comissao: "",
          taxas: "",
          observacoes: "",
        });
      }
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      alert("Erro ao criar evento de venda");
    } finally {
      setLoading(false);
    }
  };

  const handleSaleValueChange = (animalId, field, value) => {
    setSalesData((prev) =>
      prev.map((sale) =>
        sale.animalId === animalId ? { ...sale, [field]: value } : sale
      )
    );
  };

  const handleSubmitSales = async () => {
    try {
      // Validações
      const invalidSales = salesData.filter(
        (sale) => !sale.valor || parseFloat(sale.valor) <= 0
      );
      if (invalidSales.length > 0) {
        alert("Todos os animais devem ter um valor de venda válido");
        return;
      }

      if (!buyerData.comprador.trim()) {
        alert("Nome do comprador é obrigatório");
        return;
      }

      setLoading(true);

      // Preparar dados das vendas
      const vendas = salesData.map((sale) => ({
        animalId: sale.animalId,
        valor: parseFloat(sale.valor),
        dataVenda: new Date().toISOString(),
        comprador: buyerData.comprador,
        documento: buyerData.documento,
        telefone: buyerData.telefone,
        endereco: buyerData.endereco,
        formaPagamento: buyerData.formaPagamento,
        observacoes: sale.observacoes,
        saleEventId: selectedEvent || null,
        comissao: eventData.comissao ? parseFloat(eventData.comissao) : 0,
        taxas: eventData.taxas ? parseFloat(eventData.taxas) : 0,
      }));

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("beef_sync_token")}`,
        },
        body: JSON.stringify({ vendas }),
      });

      if (response.ok) {
        const result = await response.json();

        // Mostrar resumo da venda
        const totalBruto = vendas.reduce((sum, v) => sum + v.valor, 0);
        const totalComissao =
          (totalBruto * (parseFloat(eventData.comissao) || 0)) / 100;
        const totalTaxas = parseFloat(eventData.taxas) || 0;
        const totalLiquido = totalBruto - totalComissao - totalTaxas;

        const message =
          `✅ ${result.sales.length} vendas registradas com sucesso!\n\n` +
          `💰 Valor Bruto: R$ ${totalBruto.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}\n` +
          `💸 Comissão: R$ ${totalComissao.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}\n` +
          `📋 Taxas: R$ ${totalTaxas.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}\n` +
          `💵 Valor Líquido: R$ ${totalLiquido.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`;

        alert(message);
        onSalesComplete();
        onClose();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro ao registrar vendas:", error);
      alert("Erro ao registrar vendas");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalBruto = salesData.reduce(
      (sum, sale) => sum + (parseFloat(sale.valor) || 0),
      0
    );
    const totalComissao =
      (totalBruto * (parseFloat(eventData.comissao) || 0)) / 100;
    const totalTaxas = parseFloat(eventData.taxas) || 0;
    const totalLiquido = totalBruto - totalComissao - totalTaxas;

    return { totalBruto, totalComissao, totalTaxas, totalLiquido };
  };

  if (!isOpen) return null;

  const { totalBruto, totalComissao, totalTaxas, totalLiquido } =
    calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Sistema de Vendas
              </h2>
              <p className="text-green-100">
                {selectedAnimals.length} animais selecionados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Seleção/Criação de Evento */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Evento de Venda
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar Evento Existente
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Venda Direta (sem evento)</option>
                  {Array.isArray(saleEvents) &&
                    saleEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.nome} -{" "}
                        {new Date(event.data).toLocaleDateString("pt-BR")}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowNewEvent(!showNewEvent)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Evento
                </button>
              </div>
            </div>

            {/* Formulário de Novo Evento */}
            {showNewEvent && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Evento *
                    </label>
                    <input
                      type="text"
                      value={eventData.nome}
                      onChange={(e) =>
                        setEventData({ ...eventData, nome: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Ex: Leilão Janeiro 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={eventData.tipo}
                      onChange={(e) =>
                        setEventData({ ...eventData, tipo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                    >
                      <option value="LEILAO">Leilão</option>
                      <option value="VENDA_DIRETA">Venda Direta</option>
                      <option value="FEIRA">Feira</option>
                      <option value="EXPOSICAO">Exposição</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={eventData.data}
                      onChange={(e) =>
                        setEventData({ ...eventData, data: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Local
                    </label>
                    <input
                      type="text"
                      value={eventData.local}
                      onChange={(e) =>
                        setEventData({ ...eventData, local: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comissão (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={eventData.comissao}
                      onChange={(e) =>
                        setEventData({ ...eventData, comissao: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Taxas (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={eventData.taxas}
                      onChange={(e) =>
                        setEventData({ ...eventData, taxas: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewEvent(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={loading || !eventData.nome || !eventData.tipo}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Criando..." : "Criar Evento"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dados do Comprador */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Dados do Comprador
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  value={buyerData.comprador}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, comprador: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Nome do comprador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={buyerData.documento}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, documento: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={buyerData.telefone}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, telefone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={buyerData.endereco}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, endereco: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={buyerData.formaPagamento}
                  onChange={(e) =>
                    setBuyerData({
                      ...buyerData,
                      formaPagamento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARTAO">Cartão</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Animais para Venda */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Animais Selecionados ({selectedAnimals.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Animal
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Raça
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Sexo
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Custo Total
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Valor Venda *
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Lucro/Prejuízo
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale, index) => {
                    const animal = sale.animal;
                    const valor = parseFloat(sale.valor) || 0;
                    const lucro = valor - animal.custoTotal;
                    const roi =
                      animal.custoTotal > 0
                        ? (lucro / animal.custoTotal) * 100
                        : 0;

                    return (
                      <tr
                        key={animal.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="p-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {animal.serie} {animal.rg}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {animal.nome || "Sem nome"}
                          </div>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {animal.raca}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {animal.sexo}
                        </td>
                        <td className="p-3 text-red-600 dark:text-red-400 font-medium">
                          R${" "}
                          {animal.custoTotal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={sale.valor}
                            onChange={(e) =>
                              handleSaleValueChange(
                                animal.id,
                                "valor",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-3">
                          {valor > 0 && (
                            <div>
                              <div
                                className={`font-medium ${
                                  lucro >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                R${" "}
                                {lucro.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div
                                className={`text-xs ${
                                  roi >= 0
                                    ? "text-green-500 dark:text-green-400"
                                    : "text-red-500 dark:text-red-400"
                                }`}
                              >
                                ROI: {roi.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={sale.observacoes}
                            onChange={(e) =>
                              handleSaleValueChange(
                                animal.id,
                                "observacoes",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                            placeholder="Observações..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💰 Resumo Financeiro
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R${" "}
                  {totalBruto.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Valor Bruto
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  R${" "}
                  {totalComissao.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Comissão
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  R${" "}
                  {totalTaxas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Taxas
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    totalLiquido >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  R${" "}
                  {totalLiquido.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Valor Líquido
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              * Campos obrigatórios
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitSales}
                disabled={
                  loading ||
                  salesData.some(
                    (sale) => !sale.valor || parseFloat(sale.valor) <= 0
                  ) ||
                  !buyerData.comprador.trim()
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Registrar Vendas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
