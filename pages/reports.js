import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { mockAnimals } from "../services/mockData";
import BreedAnalysis from "../components/reports/BreedAnalysis";
import MonthlyReport from "../components/reports/MonthlyReport";
import RecommendationReports from "../components/reports/RecommendationReports";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

export default function Reports({ darkMode, toggleDarkMode }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedPeriod, setSelectedPeriod] = useState(currentYear.toString());
  const [selectedReport, setSelectedReport] = useState("overview");

  // Gerar lista de anos dinamicamente (últimos 10 anos + próximos 2)
  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear + 2; year >= currentYear - 10; year--) {
      years.push(year.toString());
    }
    return years;
  };

  // Dados para relatórios
  const totalAnimais = mockAnimals.length;
  const animaisPorRaca = mockAnimals.reduce((acc, animal) => {
    acc[animal.raca] = (acc[animal.raca] || 0) + 1;
    return acc;
  }, {});

  const animaisPorIdade = {
    "Bezerro (0-3 meses)": mockAnimals.filter((a) => a.meses <= 3).length,
    "Bezerro maior (4-8 meses)": mockAnimals.filter(
      (a) => a.meses >= 4 && a.meses <= 8
    ).length,
    "Desmama (9-12 meses)": mockAnimals.filter(
      (a) => a.meses >= 9 && a.meses <= 12
    ).length,
    "Garrote (12-24 meses)": mockAnimals.filter(
      (a) => a.meses >= 12 && a.meses <= 24
    ).length,
    "Garrote Senior (25-36 meses)": mockAnimals.filter(
      (a) => a.meses >= 25 && a.meses <= 36
    ).length,
    "Adulto (36+ meses)": mockAnimals.filter((a) => a.meses > 36).length,
  };

  const custoPorTipo = mockAnimals.reduce((acc, animal) => {
    animal.custos.forEach((custo) => {
      if (custo.valor > 0) {
        acc[custo.tipo] = (acc[custo.tipo] || 0) + custo.valor;
      }
    });
    return acc;
  }, {});

  const movimentacoesMensais = {
    "Jan/23": { nascimentos: 0, vendas: 1, mortes: 0, receita: 4500 },
    "Fev/23": { nascimentos: 1, vendas: 0, mortes: 0, receita: 0 },
    "Mar/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Abr/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Mai/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Jun/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Jul/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Ago/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Set/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Out/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Nov/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
    "Dez/23": { nascimentos: 0, vendas: 0, mortes: 0, receita: 0 },
  };

  const relatorios = [
    {
      id: "overview",
      name: "📊 Visão Geral",
      icon: ChartBarIcon,
      description: "Resumo geral do rebanho",
    },
    {
      id: "financial",
      name: "💰 Relatório Financeiro",
      icon: CurrencyDollarIcon,
      description: "Custos, receitas e rentabilidade",
    },
    {
      id: "recommendations",
      name: "🎯 Recomendações IA",
      icon: ArrowTrendingUpIcon,
      description: "Vender, Manter ou Melhorar",
    },
    {
      id: "breeds",
      name: "🐄 Análise por Raça",
      icon: DocumentChartBarIcon,
      description: "Performance comparativa entre raças",
    },
    {
      id: "monthly",
      name: "📅 Relatório Mensal",
      icon: CalendarIcon,
      description: "Análise mensal detalhada",
    },
    {
      id: "movements",
      name: "📈 Movimentações",
      icon: ArrowTrendingDownIcon,
      description: "Entradas e saídas mensais",
    },
  ];

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => router.push('/animals')}
          className="card p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
            {totalAnimais}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Total de Animais
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            👆 Clique para ver todos
          </div>
        </div>
        <div 
          onClick={() => router.push('/animals?filter=Ativo')}
          className="card p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
            {mockAnimals.filter((a) => a.situacao === "Ativo").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            Animais Ativos
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            👆 Clique para filtrar ativos
          </div>
        </div>
        <div 
          onClick={() => router.push('/animals?filter=Vendido')}
          className="card p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform">
            {mockAnimals.filter((a) => a.situacao === "Vendido").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            Animais Vendidos
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            👆 Clique para ver vendidos
          </div>
        </div>
        <div 
          onClick={() => router.push('/animals?filter=Morto')}
          className="card p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform">
            {mockAnimals.filter((a) => a.situacao === "Morto").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            Óbitos
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            👆 Clique para ver óbitos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Raça
          </h3>
          <div className="space-y-3">
            {Object.entries(animaisPorRaca).map(([raca, quantidade]) => (
              <div key={raca} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {raca}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(quantidade / totalAnimais) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Idade
          </h3>
          <div className="space-y-3">
            {Object.entries(animaisPorIdade).map(([categoria, quantidade]) => (
              <div
                key={categoria}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {categoria}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          totalAnimais > 0
                            ? (quantidade / totalAnimais) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <ArrowTrendingDownIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            R${" "}
            {mockAnimals
              .reduce((acc, a) => acc + a.custoTotal, 0)
              .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total de Custos
          </div>
        </div>
        <div className="card p-6 text-center">
          <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            R${" "}
            {mockAnimals
              .filter((a) => a.valorVenda)
              .reduce((acc, a) => acc + a.valorVenda, 0)
              .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total de Receitas
          </div>
        </div>
        <div className="card p-6 text-center">
          <CurrencyDollarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            R${" "}
            {mockAnimals
              .filter((a) => a.valorReal !== null)
              .reduce((acc, a) => acc + a.valorReal, 0)
              .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Resultado Líquido
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Custos por Categoria
        </h3>
        <div className="space-y-3">
          {Object.entries(custoPorTipo).map(([tipo, valor]) => (
            <div key={tipo} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {tipo}
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (valor / Math.max(...Object.values(custoPorTipo))) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[80px] text-right">
                  R${" "}
                  {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Análise Individual por Animal
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Animal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Custo Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAnimals.map((animal) => {
                const roi = animal.valorVenda
                  ? ((animal.valorVenda - animal.custoTotal) /
                      animal.custoTotal) *
                    100
                  : null;
                return (
                  <tr key={animal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {animal.serie} {animal.rg}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      R${" "}
                      {animal.custoTotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {animal.valorVenda
                        ? `R$ ${animal.valorVenda.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {animal.valorReal !== null ? (
                        <span
                          className={
                            animal.valorReal >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          R${" "}
                          {animal.valorReal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {roi !== null ? (
                        <span
                          className={
                            roi >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {roi.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMovementsReport = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Movimentações Mensais - {selectedPeriod}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Nascimentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Mortes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(movimentacoesMensais).map(([mes, dados]) => (
                <tr key={mes}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {mes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    {dados.nascimentos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                    {dados.vendas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    {dados.mortes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    R${" "}
                    {dados.receita.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notas Fiscais de Entrada
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  NF 001/2022
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fazenda São João
                </div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                R$ 1.500,00
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notas Fiscais de Saída
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  NF 002/2023
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fazenda Santa Maria
                </div>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                R$ 4.500,00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentReport = () => {
    switch (selectedReport) {
      case "financial":
        return renderFinancialReport();
      case "movements":
        return renderMovementsReport();
      case "recommendations":
        return <RecommendationReports />;
      case "breeds":
        return <BreedAnalysis />;
      case "monthly":
        return <MonthlyReport />;
      default:
        return renderOverviewReport();
    }
  };

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Relatórios e Gráficos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análises detalhadas do rebanho e performance financeira
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field min-w-[140px] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400"
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>
                  📅 {year}
                </option>
              ))}
              <option value="todos">📊 Todos os Anos</option>
            </select>
          </div>
        </div>

        {/* Menu de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {relatorios.map((relatorio) => (
            <button
              key={relatorio.id}
              onClick={() => setSelectedReport(relatorio.id)}
              className={`card p-4 text-left transition-colors ${
                selectedReport === relatorio.id
                  ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <relatorio.icon
                className={`h-8 w-8 mb-3 ${
                  selectedReport === relatorio.id
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-400"
                }`}
              />
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {relatorio.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {relatorio.description}
              </p>
            </button>
          ))}
        </div>

        {/* Conteúdo do Relatório */}
        {renderCurrentReport()}
      </div>
    </Layout>
  );
}
