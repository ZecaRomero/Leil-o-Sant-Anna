// Mock data para desenvolvimento
export const mockAnimals = [
  {
    id: 1,
    serie: 'CJCJ',
    rg: '123456',
    sexo: 'Macho',
    raca: 'Nelore',
    dataNascimento: '2023-01-15',
    meses: 11,
    situacao: 'Ativo',
    custoTotal: 2500.00,
    valorVenda: null,
    valorReal: null,
    pai: 'CJCJ 100001',
    mae: 'BENT 200001',
    avoMaterno: 'CJCJ 100002',
    receptora: 'RPT 300001',
    isFiv: true,
    custos: [
      { id: 1, tipo: 'Nascimento', valor: 150.00, data: '2023-01-15', observacoes: 'Parto normal' },
      { id: 2, tipo: 'DNA', subtipo: 'Paternidade', valor: 40.00, data: '2023-01-20', observacoes: 'FIV' },
      { id: 3, tipo: 'DNA', subtipo: 'Genômica', valor: 80.00, data: '2023-01-20', observacoes: 'FIV' },
      { id: 4, tipo: 'Alimentação', subtipo: 'Ração', valor: 1200.00, data: '2023-12-01', observacoes: 'Ração concentrada' },
      { id: 5, tipo: 'Medicamentos', subtipo: 'Vacinas', valor: 45.00, data: '2023-03-15', observacoes: 'Vacina aftosa' },
      { id: 6, tipo: 'Veterinários', subtipo: 'Andrológico', valor: 120.00, data: '2023-10-10', observacoes: 'Exame reprodutivo' }
    ]
  },
  {
    id: 2,
    serie: 'RPT',
    rg: '300001',
    sexo: 'Fêmea',
    raca: 'Receptora',
    dataNascimento: null,
    meses: 30,
    situacao: 'Ativo',
    custoTotal: 1800.00,
    valorVenda: null,
    valorReal: null,
    custos: [
      { id: 7, tipo: 'Aquisição', valor: 1500.00, data: '2022-06-01', observacoes: 'Compra de receptora', fornecedor: 'Fazenda São João' },
      { id: 8, tipo: 'Alimentação', subtipo: 'Sal mineral', valor: 200.00, data: '2023-12-01', observacoes: 'Suplementação' },
      { id: 9, tipo: 'Medicamentos', subtipo: 'Preventivos', valor: 100.00, data: '2023-08-15', observacoes: 'Vermífugo e vitaminas' }
    ]
  },
  {
    id: 3,
    serie: 'BENT',
    rg: '200001',
    sexo: 'Fêmea',
    raca: 'Brahman',
    dataNascimento: '2020-03-10',
    meses: 45,
    situacao: 'Vendido',
    custoTotal: 3200.00,
    valorVenda: 4500.00,
    valorReal: 1300.00,
    custos: [
      { id: 10, tipo: 'Nascimento', valor: 200.00, data: '2020-03-10', observacoes: 'Parto assistido' },
      { id: 11, tipo: 'Alimentação', subtipo: 'Ração', valor: 2000.00, data: '2023-12-01', observacoes: 'Alimentação completa' },
      { id: 12, tipo: 'Veterinários', subtipo: 'Diagnóstico de Prenhez', valor: 80.00, data: '2023-05-15', observacoes: 'Ultrassom' },
      { id: 13, tipo: 'Saída', valor: -4500.00, data: '2023-11-20', observacoes: 'Venda para reprodução', destino: 'Fazenda Santa Maria' }
    ]
  },
  {
    id: 4,
    serie: 'RPT',
    rg: '12524',
    sexo: 'Fêmea',
    raca: 'Receptora',
    dataNascimento: null,
    meses: 30,
    situacao: 'Ativo',
    custoTotal: 7000.00,
    valorVenda: null,
    valorReal: null,
    custos: [
      { id: 14, tipo: 'Aquisição', valor: 6500.00, data: '2023-08-15', observacoes: 'Compra de receptora premium', fornecedor: 'Fazenda Elite' },
      { id: 15, tipo: 'Medicamentos', subtipo: 'Vacinas', valor: 300.00, data: '2023-09-01', observacoes: 'Protocolo completo de vacinação' },
      { id: 16, tipo: 'Alimentação', subtipo: 'Ração', valor: 200.00, data: '2023-12-01', observacoes: 'Ração especial' }
    ]
  },
  {
    id: 5,
    serie: 'CJCG',
    rg: '456789',
    sexo: 'Macho',
    raca: 'Gir',
    dataNascimento: '2022-05-20',
    meses: 19,
    situacao: 'Ativo',
    custoTotal: 1800.00,
    valorVenda: null,
    valorReal: null,
    custos: [
      { id: 17, tipo: 'Nascimento', valor: 180.00, data: '2022-05-20', observacoes: 'Parto normal' },
      { id: 18, tipo: 'Alimentação', subtipo: 'Ração', valor: 1200.00, data: '2023-12-01', observacoes: 'Ração de crescimento' },
      { id: 19, tipo: 'Medicamentos', subtipo: 'Vacinas', valor: 120.00, data: '2022-06-15', observacoes: 'Vacinas obrigatórias' },
      { id: 20, tipo: 'Veterinários', subtipo: 'Andrológico', valor: 300.00, data: '2023-11-10', observacoes: 'Exame reprodutivo completo' }
    ]
  }
]

export const racasPorSerie = {
  'RPT': 'Receptora',
  'BENT': 'Brahman',
  'CJCJ': 'Nelore',
  'CJCG': 'Gir'
}

export const tiposCusto = [
  'Aquisição',
  'Nascimento', 
  'Alimentação',
  'DNA',
  'Medicamentos',
  'Veterinários',
  'Mão de Obra Proporcional',
  'Frete / Transporte',
  'Manejo',
  'Infraestrutura',
  'Reprodução',
  'Saída',
  'Outros'
]

export const subtiposCusto = {
  'Alimentação': [
    'Ração Concentrada', 
    'Ração Creep Feeding', 
    'Silagem', 
    'Sal Mineral', 
    'Sal Proteinado',
    'Suplemento Vitamínico',
    'Pastagem (Sementes)',
    'Feno'
  ],
  'DNA': [
    'Paternidade', 
    'Genômica',
    'Teste de Parentesco',
    'Análise Genética Completa'
  ],
  'Medicamentos': [
    'Vacinas Obrigatórias',
    'Vacinas Opcionais', 
    'Vermífugos',
    'Antibióticos',
    'Anti-inflamatórios',
    'Vitaminas e Minerais',
    'Carrapaticidas',
    'Brincos e Identificação',
    'Outros Preventivos'
  ],
  'Veterinários': [
    'T.E Embrião', 
    'Andrológico', 
    'Diagnóstico de Prenhez',
    'Inseminação Artificial',
    'Consulta Veterinária',
    'Cirurgias',
    'Exames Laboratoriais',
    'Ultrassonografia'
  ],
  'Manejo': [
    'Castração',
    'Descorna',
    'Marcação/Tatuagem',
    'Pesagem',
    'Apartação',
    'Embarque/Desembarque'
  ],
  'Infraestrutura': [
    'Cercas e Divisões',
    'Bebedouros',
    'Cochos',
    'Currais',
    'Mangueiras',
    'Balança'
  ],
  'Reprodução': [
    'Sêmen',
    'Embriões',
    'Sincronização',
    'Hormônios',
    'Material Descartável IA'
  ]
}

// Custos sugeridos por ERA (idade em meses)
export const custosPorERA = {
  machos: {
    'ERA 0/3': [
      { tipo: 'Nascimento', subtipo: '', valor: 150, obrigatorio: true, descricao: 'Custo do parto e primeiros cuidados' },
      { tipo: 'Medicamentos', subtipo: 'Brincos e Identificação', valor: 15, obrigatorio: true, descricao: 'Identificação do animal' },
      { tipo: 'DNA', subtipo: 'Paternidade', valor: 40, obrigatorio: false, descricao: 'Confirmação de paternidade (FIV)' },
      { tipo: 'Medicamentos', subtipo: 'Vitaminas e Minerais', valor: 25, obrigatorio: false, descricao: 'Suplementação inicial' }
    ],
    'ERA 4/8': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 36.90, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Creep Feeding', valor: 1.50, obrigatorio: false, descricao: 'Ração especial para bezerros (por dia)' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso (300g/dia)' },
      { tipo: 'Medicamentos', subtipo: 'Vermífugos', valor: 18, obrigatorio: true, descricao: 'Controle parasitário' }
    ],
    'ERA 9/12': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 36.90, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Creep Feeding', valor: 1.50, obrigatorio: false, descricao: 'Ração especial (por dia)' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Manejo', subtipo: 'Castração', valor: 45, obrigatorio: false, descricao: 'Castração se necessário' }
    ],
    'ERA 10/24': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 89.10, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Veterinários', subtipo: 'Andrológico', valor: 120, obrigatorio: false, descricao: 'Exame reprodutivo' }
    ],
    'ERA 25/36': [
      { tipo: 'Manejo', subtipo: 'Casquear somente animais para venda', valor: null, obrigatorio: false, descricao: 'Casqueamento se for para venda' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Veterinários', subtipo: 'Andrológico', valor: 120, obrigatorio: false, descricao: 'Exame reprodutivo anual' }
    ],
    'ERA ACIMA 36': [
      { tipo: 'Manejo', subtipo: 'Casquear somente animais para venda', valor: null, obrigatorio: false, descricao: 'Casqueamento se for para venda' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Veterinários', subtipo: 'Andrológico', valor: 120, obrigatorio: false, descricao: 'Exame reprodutivo anual' }
    ]
  },
  femeas: {
    'ERA 0/3': [
      { tipo: 'Nascimento', subtipo: '', valor: 150, obrigatorio: true, descricao: 'Custo do parto e primeiros cuidados' },
      { tipo: 'Medicamentos', subtipo: 'Brincos e Identificação', valor: 15, obrigatorio: true, descricao: 'Identificação do animal' },
      { tipo: 'DNA', subtipo: 'Paternidade', valor: 40, obrigatorio: false, descricao: 'Confirmação de paternidade (FIV)' },
      { tipo: 'Medicamentos', subtipo: 'Vitaminas e Minerais', valor: 25, obrigatorio: false, descricao: 'Suplementação inicial' }
    ],
    'ERA 4/8': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 36.90, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Creep Feeding', valor: 1.50, obrigatorio: false, descricao: 'Ração especial para bezerros (por dia)' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Medicamentos', subtipo: 'Vermífugos', valor: 18, obrigatorio: true, descricao: 'Controle parasitário' },
      { tipo: 'Medicamentos', subtipo: 'Vacinas Opcionais', valor: null, obrigatorio: false, descricao: 'Vacina B3 se necessário' }
    ],
    'ERA 9/12': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 36.90, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Medicamentos', subtipo: 'Vermífugos', valor: 18, obrigatorio: true, descricao: 'Controle parasitário' }
    ],
    'ERA 10/24': [
      { tipo: 'Medicamentos', subtipo: 'Vacinas Obrigatórias', valor: 89.10, obrigatorio: true, descricao: 'Controle ABCZ RGD' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Reprodução', subtipo: 'Inseminação', valor: null, obrigatorio: false, descricao: 'Inseminação artificial' }
    ],
    'ERA 25/36': [
      { tipo: 'Manejo', subtipo: 'Casquear somente animais para venda', valor: null, obrigatorio: false, descricao: 'Casqueamento se for para venda' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Veterinários', subtipo: 'Diagnóstico de Prenhez', valor: 80, obrigatorio: false, descricao: 'Diagnóstico de gestação' }
    ],
    'ERA ACIMA 36': [
      { tipo: 'Manejo', subtipo: 'Casquear somente animais para venda', valor: null, obrigatorio: false, descricao: 'Casqueamento se for para venda' },
      { tipo: 'Alimentação', subtipo: 'Ração Concentrada', valor: null, obrigatorio: false, descricao: 'Calcular por peso' },
      { tipo: 'Veterinários', subtipo: 'Diagnóstico de Prenhez', valor: 80, obrigatorio: false, descricao: 'Diagnóstico de gestação' }
    ]
  }
}

// Preços de referência para cálculos automáticos
export const precosReferencia = {
  racaoKg: 1.20,
  salMineralKg: 3.50,
  salProteinadoKg: 4.20,
  consumoDiarioRacao: 0.025, // 2.5% do peso corporal
  consumoDiarioSalMineral: 0.08, // 80g por dia
  pesoMedioMachosPorIdade: {
    3: 120, 6: 180, 9: 240, 12: 300, 18: 420, 24: 520, 36: 650
  },
  pesoMedioFemeasPorIdade: {
    3: 100, 6: 150, 9: 200, 12: 250, 18: 350, 24: 420, 36: 500
  }
}

// Sugestões de preços de mercado (valores podem ser atualizados)
export const sugestoesPrecosReferencia = {
  'Alimentação': {
    'Ração Concentrada': { min: 1.00, max: 1.50, medio: 1.20, unidade: 'kg' },
    'Ração Creep Feeding': { min: 1.80, max: 2.20, medio: 2.00, unidade: 'kg' },
    'Sal Mineral': { min: 3.00, max: 4.00, medio: 3.50, unidade: 'kg' },
    'Sal Proteinado': { min: 3.80, max: 4.60, medio: 4.20, unidade: 'kg' },
    'Silagem': { min: 0.15, max: 0.25, medio: 0.20, unidade: 'kg' },
    'Feno': { min: 0.40, max: 0.60, medio: 0.50, unidade: 'kg' }
  },
  'Medicamentos': {
    'Vacinas Obrigatórias': { min: 30.00, max: 45.00, medio: 36.90, unidade: 'dose' },
    'Vacinas Opcionais': { min: 15.00, max: 30.00, medio: 22.50, unidade: 'dose' },
    'Vermífugos': { min: 12.00, max: 25.00, medio: 18.00, unidade: 'dose' },
    'Antibióticos': { min: 25.00, max: 80.00, medio: 50.00, unidade: 'tratamento' },
    'Vitaminas e Minerais': { min: 15.00, max: 35.00, medio: 25.00, unidade: 'dose' },
    'Carrapaticidas': { min: 20.00, max: 40.00, medio: 30.00, unidade: 'aplicação' }
  },
  'Veterinários': {
    'Consulta Veterinária': { min: 80.00, max: 150.00, medio: 120.00, unidade: 'consulta' },
    'Andrológico': { min: 100.00, max: 180.00, medio: 120.00, unidade: 'exame' },
    'Diagnóstico de Prenhez': { min: 60.00, max: 100.00, medio: 80.00, unidade: 'exame' },
    'Inseminação Artificial': { min: 40.00, max: 80.00, medio: 60.00, unidade: 'procedimento' },
    'Ultrassonografia': { min: 80.00, max: 120.00, medio: 100.00, unidade: 'exame' }
  },
  'DNA': {
    'Paternidade': { min: 35.00, max: 50.00, medio: 40.00, unidade: 'teste' },
    'Genômica': { min: 70.00, max: 100.00, medio: 80.00, unidade: 'teste' },
    'Análise Genética Completa': { min: 150.00, max: 250.00, medio: 200.00, unidade: 'teste' }
  },
  'Manejo': {
    'Castração': { min: 35.00, max: 60.00, medio: 45.00, unidade: 'procedimento' },
    'Descorna': { min: 25.00, max: 40.00, medio: 30.00, unidade: 'procedimento' },
    'Marcação/Tatuagem': { min: 15.00, max: 25.00, medio: 20.00, unidade: 'procedimento' },
    'Casquear somente animais para venda': { min: 30.00, max: 50.00, medio: 40.00, unidade: 'procedimento' }
  }
}

// Alertas e recomendações inteligentes
export const alertasInteligentes = {
  'ERA 0/3': {
    obrigatorios: ['Nascimento', 'Brincos e Identificação'],
    recomendados: ['DNA - Paternidade', 'Vitaminas e Minerais'],
    alertas: [
      'Registrar nascimento nos primeiros 3 dias',
      'Identificar animal até 30 dias',
      'Considerar teste de paternidade para FIV'
    ]
  },
  'ERA 4/8': {
    obrigatorios: ['Vacinas Obrigatórias', 'Vermífugos'],
    recomendados: ['Ração Creep Feeding', 'Controle parasitário'],
    alertas: [
      'Período crítico para vacinação',
      'Iniciar suplementação alimentar',
      'Monitorar ganho de peso'
    ]
  },
  'ERA 9/12': {
    obrigatorios: ['Vacinas Obrigatórias'],
    recomendados: ['Ração Concentrada', 'Castração (se necessário)'],
    alertas: [
      'Avaliar necessidade de castração',
      'Intensificar alimentação',
      'Preparar para desmama'
    ]
  },
  'ERA 10/24': {
    obrigatorios: ['Vacinas Obrigatórias'],
    recomendados: ['Exame Andrológico (machos)', 'Inseminação (fêmeas)'],
    alertas: [
      'Período reprodutivo - avaliar aptidão',
      'Machos: exame andrológico obrigatório',
      'Fêmeas: considerar primeira cobertura'
    ]
  },
  'ERA 25/36': {
    obrigatorios: [],
    recomendados: ['Casqueamento para venda', 'Diagnóstico de prenhez'],
    alertas: [
      'Animal em idade produtiva',
      'Avaliar potencial de venda',
      'Manter controle reprodutivo'
    ]
  },
  'ERA ACIMA 36': {
    obrigatorios: [],
    recomendados: ['Manutenção reprodutiva', 'Avaliação comercial'],
    alertas: [
      'Animal maduro - foco na produtividade',
      'Avaliar retorno do investimento',
      'Considerar renovação do rebanho'
    ]
  }
}

// Calculadoras auxiliares
export const calculadoras = {
  // Calcular consumo de ração baseado no peso
  consumoRacao: (peso, percentual = 2.5) => {
    return (peso * percentual / 100).toFixed(2)
  },
  
  // Calcular custo mensal de alimentação
  custoMensalAlimentacao: (peso, precoKg = 1.20, percentual = 2.5) => {
    const consumoDiario = peso * percentual / 100
    return (consumoDiario * precoKg * 30).toFixed(2)
  },
  
  // Calcular ROI (Retorno sobre Investimento)
  calcularROI: (valorVenda, custoTotal) => {
    if (!valorVenda || custoTotal === 0) return 0
    return (((valorVenda - custoTotal) / custoTotal) * 100).toFixed(2)
  },
  
  // Calcular custo por kg de peso vivo
  custoPorKg: (custoTotal, pesoAtual) => {
    if (pesoAtual === 0) return 0
    return (custoTotal / pesoAtual).toFixed(2)
  }
}

export const situacoes = ['Ativo', 'Vendido', 'Morto', 'Doado']

export const usuarios = [
  { id: 1, nome: 'Zeca', role: 'Desenvolvedor', permissoes: ['all'] },
  { id: 2, nome: 'Bento', role: 'Dono', permissoes: ['reports', 'financial'] },
  { id: 3, nome: 'Nilson', role: 'Gerente', permissoes: ['reports', 'financial', 'management'] },
  { id: 4, nome: 'Adelso', role: 'Capataz', permissoes: ['birth', 'death', 'entry', 'exit', 'reports_view'] }
]