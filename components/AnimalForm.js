import { useState, useEffect } from "react";
import { racasPorSerie, situacoes } from "../services/mockData";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function AnimalForm({ animal, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    serie: "",
    rg: "",
    sexo: "",
    raca: "",
    dataNascimento: "",
    meses: 0,
    situacao: "Ativo",
    pai: "",
    mae: "",
    avoMaterno: "",
    receptora: "",
    isFiv: false,
    tipoCobertura: "",
    valorVenda: "",
    observacoes: "",
  });

  const [showNascimentoModal, setShowNascimentoModal] = useState(false);
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (animal) {
      setFormData({
        ...animal,
        dataNascimento: animal.dataNascimento || "",
        valorVenda: animal.valorVenda || "",
        observacoes: animal.observacoes || "",
      });
    } else {
      setFormData({
        serie: "",
        rg: "",
        sexo: "",
        raca: "",
        dataNascimento: "",
        meses: 0,
        situacao: "Ativo",
        pai: "",
        mae: "",
        avoMaterno: "",
        receptora: "",
        isFiv: false,
        valorVenda: "",
        observacoes: "",
      });
    }
  }, [animal]);

  const handleSerieChange = (serie) => {
    const newFormData = { ...formData, serie };

    // Auto-completar raça baseada na série
    if (racasPorSerie[serie]) {
      newFormData.raca = racasPorSerie[serie];
    }

    // Regras específicas para RPT
    if (serie === "RPT") {
      newFormData.sexo = "Fêmea";
      newFormData.raca = "Receptora";
      newFormData.meses = 30;
      newFormData.dataNascimento = "";
    }

    setFormData(newFormData);
  };

  const handleRgBlur = () => {
    // Se for CJCJ, abrir modal de nascimento
    if (formData.serie === "CJCJ" && formData.rg && !animal) {
      setShowNascimentoModal(true);
    }
    // Se for RPT (Receptora), abrir modal de compra
    if (formData.serie === "RPT" && formData.rg && !animal) {
      setShowCompraModal(true);
    }
  };

  const calculateMeses = (dataNascimento) => {
    if (!dataNascimento) return 0;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - nascimento);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const handleDateChange = (date) => {
    const meses = calculateMeses(date);
    setFormData({ ...formData, dataNascimento: date, meses });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serie) newErrors.serie = "Série é obrigatória";
    if (!formData.rg) newErrors.rg = "RG é obrigatório";
    if (formData.rg.length > 6)
      newErrors.rg = "RG deve ter no máximo 6 dígitos";
    if (!formData.sexo) newErrors.sexo = "Sexo é obrigatório";
    if (!formData.raca) newErrors.raca = "Raça é obrigatória";
    if (!formData.situacao) newErrors.situacao = "Situação é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {animal ? "Editar Animal" : "Novo Animal"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Série */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Série *
              </label>
              <select
                value={formData.serie}
                onChange={(e) => handleSerieChange(e.target.value)}
                className={`input-field ${
                  errors.serie ? "border-red-500" : ""
                }`}
              >
                <option value="">Selecione...</option>
                <option value="RPT">RPT</option>
                <option value="BENT">BENT</option>
                <option value="CJCJ">CJCJ</option>
                <option value="CJCG">CJCG</option>
              </select>
              {errors.serie && (
                <p className="text-red-500 text-xs mt-1">{errors.serie}</p>
              )}
            </div>

            {/* RG */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                RG *
              </label>
              <input
                type="number"
                value={formData.rg}
                onChange={(e) =>
                  setFormData({ ...formData, rg: e.target.value })
                }
                onBlur={handleRgBlur}
                maxLength={6}
                className={`input-field ${errors.rg ? "border-red-500" : ""}`}
                placeholder="Até 6 dígitos"
              />
              {errors.rg && (
                <p className="text-red-500 text-xs mt-1">{errors.rg}</p>
              )}
            </div>
          </div>

          {/* Sexo - Cards coloridos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sexo *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sexo: "Macho" })}
                disabled={formData.serie === "RPT"}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  formData.sexo === "Macho"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                } ${
                  formData.serie === "RPT"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                🐂 Macho
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sexo: "Fêmea" })}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  formData.sexo === "Fêmea"
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-pink-300"
                }`}
              >
                🐄 Fêmea
              </button>
            </div>
            {errors.sexo && (
              <p className="text-red-500 text-xs mt-1">{errors.sexo}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raça */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Raça *
              </label>
              <input
                type="text"
                value={formData.raca}
                onChange={(e) =>
                  setFormData({ ...formData, raca: e.target.value })
                }
                className={`input-field ${errors.raca ? "border-red-500" : ""}`}
                readOnly={formData.serie === "RPT"}
              />
              {errors.raca && (
                <p className="text-red-500 text-xs mt-1">{errors.raca}</p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleDateChange(e.target.value)}
                className="input-field"
                disabled={formData.serie === "RPT"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meses
              </label>
              <input
                type="number"
                value={formData.meses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meses: parseInt(e.target.value) || 0,
                  })
                }
                className="input-field"
                readOnly={formData.serie === "RPT"}
              />
            </div>

            {/* Situação - Cards coloridos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {situacoes.map((situacao) => (
                  <button
                    key={situacao}
                    type="button"
                    onClick={() => setFormData({ ...formData, situacao })}
                    className={`p-2 rounded-lg border-2 text-sm transition-colors ${
                      formData.situacao === situacao
                        ? situacao === "Ativo"
                          ? "border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : situacao === "Vendido"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : situacao === "Morto"
                          ? "border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : "border-orange-500 bg-orange-500 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {situacao}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Valor da Venda - só aparece se situação for Vendido */}
          {formData.situacao === "Vendido" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor da Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorVenda}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    valorVenda: parseFloat(e.target.value) || 0,
                  })
                }
                className="input-field"
                placeholder="0,00"
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {animal ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Nascimento para CJCJ */}
      {showNascimentoModal && (
        <NascimentoModal
          isOpen={showNascimentoModal}
          onClose={() => setShowNascimentoModal(false)}
          onSave={(dadosNascimento) => {
            setFormData({ ...formData, ...dadosNascimento });
            setShowNascimentoModal(false);
          }}
        />
      )}

      {/* Modal de Compra para RPT */}
      {showCompraModal && (
        <CompraModal
          isOpen={showCompraModal}
          onClose={() => setShowCompraModal(false)}
          onSave={(dadosCompra) => {
            setFormData({ ...formData, ...dadosCompra });
            setShowCompraModal(false);
          }}
        />
      )}
    </div>
  );
}

// Modal específico para dados de nascimento CJCJ
function NascimentoModal({ isOpen, onClose, onSave }) {
  const [dados, setDados] = useState({
    dataEntrada: "",
    pai: "",
    mae: "",
    avoMaterno: "",
    receptora: "",
    isFiv: false,
    pesoNascimento: "",
    observacoes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dados);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }}>
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dados de Nascimento - CJCJ
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Entrada
              </label>
              <input
                type="date"
                value={dados.dataEntrada}
                onChange={(e) =>
                  setDados({ ...dados, dataEntrada: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Peso Nascimento (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={dados.pesoNascimento}
                onChange={(e) =>
                  setDados({ ...dados, pesoNascimento: e.target.value })
                }
                className="input-field"
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pai
              </label>
              <input
                type="text"
                value={dados.pai}
                onChange={(e) => setDados({ ...dados, pai: e.target.value })}
                className="input-field"
                placeholder="Ex: CJCJ 100001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mãe Biológica
              </label>
              <input
                type="text"
                value={dados.mae}
                onChange={(e) => setDados({ ...dados, mae: e.target.value })}
                className="input-field"
                placeholder="Ex: BENT 200001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avô Materno
              </label>
              <input
                type="text"
                value={dados.avoMaterno}
                onChange={(e) =>
                  setDados({ ...dados, avoMaterno: e.target.value })
                }
                className="input-field"
                placeholder="Ex: CJCJ 100002"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Receptora
              </label>
              <input
                type="text"
                value={dados.receptora}
                onChange={(e) =>
                  setDados({ ...dados, receptora: e.target.value })
                }
                className="input-field"
                placeholder="Ex: RPT 300001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Cobertura
            </label>
            <select
              value={dados.tipoCobertura}
              onChange={(e) => setDados({ ...dados, tipoCobertura: e.target.value })}
              className="input-field"
            >
              <option value="">Selecione o tipo</option>
              <option value="FIV">FIV (Fertilização in Vitro)</option>
              <option value="IA">IA (Inseminação Artificial)</option>
              <option value="MONTA_NATURAL">Monta Natural</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dados.isFiv}
                onChange={(e) =>
                  setDados({ ...dados, isFiv: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                É FIV (adicionar DNA: Paternidade R$ 40 + Genômica R$ 80)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={dados.observacoes}
              onChange={(e) =>
                setDados({ ...dados, observacoes: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Observações sobre o nascimento..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal específico para dados de compra RPT (Receptora)
function CompraModal({ isOpen, onClose, onSave }) {
  const [dados, setDados] = useState({
    dataCompra: new Date().toISOString().split("T")[0],
    valorCompra: "",
    fornecedor: "",
    notaFiscal: "",
    pesoCompra: "",
    idadeCompra: "",
    condicaoCorporal: "",
    observacoes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dados);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }}>
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dados de Compra - Receptora (RPT)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data da Compra *
              </label>
              <input
                type="date"
                value={dados.dataCompra}
                onChange={(e) =>
                  setDados({ ...dados, dataCompra: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor da Compra (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.valorCompra}
                onChange={(e) =>
                  setDados({ ...dados, valorCompra: e.target.value })
                }
                className="input-field"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fornecedor *
              </label>
              <input
                type="text"
                value={dados.fornecedor}
                onChange={(e) =>
                  setDados({ ...dados, fornecedor: e.target.value })
                }
                className="input-field"
                placeholder="Nome do fornecedor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nota Fiscal
              </label>
              <input
                type="text"
                value={dados.notaFiscal}
                onChange={(e) =>
                  setDados({ ...dados, notaFiscal: e.target.value })
                }
                className="input-field"
                placeholder="Número da NF"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Peso na Compra (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={dados.pesoCompra}
                onChange={(e) =>
                  setDados({ ...dados, pesoCompra: e.target.value })
                }
                className="input-field"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Idade na Compra (meses)
              </label>
              <input
                type="number"
                value={dados.idadeCompra}
                onChange={(e) =>
                  setDados({ ...dados, idadeCompra: e.target.value })
                }
                className="input-field"
                placeholder="Ex: 24"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condição Corporal
            </label>
            <select
              value={dados.condicaoCorporal}
              onChange={(e) =>
                setDados({ ...dados, condicaoCorporal: e.target.value })
              }
              className="input-field"
            >
              <option value="">Selecione...</option>
              <option value="1">1 - Muito Magra</option>
              <option value="2">2 - Magra</option>
              <option value="3">3 - Moderada</option>
              <option value="4">4 - Boa</option>
              <option value="5">5 - Gorda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={dados.observacoes}
              onChange={(e) =>
                setDados({ ...dados, observacoes: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Observações sobre a compra, histórico reprodutivo, etc..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Informação Importante
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Automaticamente será criado um custo de "Aquisição" com o valor da
              compra informado. Receptoras são utilizadas para FIV (Fertilização
              In Vitro) e têm idade padrão de 30 meses.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Dados de Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
