import ExcelJS from 'exceljs'

export const exportToExcel = async (data, filename = 'beef_sync_export') => {
  try {
    // Criar um novo workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Animais')

    // Definir as colunas com cabeçalhos
    worksheet.columns = [
      { header: 'ID', key: 'ID', width: 8 },
      { header: 'Série', key: 'Série', width: 10 },
      { header: 'RG', key: 'RG', width: 10 },
      { header: 'Sexo', key: 'Sexo', width: 10 },
      { header: 'Raça', key: 'Raça', width: 12 },
      { header: 'Data Nascimento', key: 'Data Nascimento', width: 15 },
      { header: 'Idade (meses)', key: 'Idade (meses)', width: 12 },
      { header: 'Situação', key: 'Situação', width: 12 },
      { header: 'Custo Total (R$)', key: 'Custo Total (R$)', width: 15 },
      { header: 'Valor Venda (R$)', key: 'Valor Venda (R$)', width: 15 },
      { header: 'Valor Real (R$)', key: 'Valor Real (R$)', width: 15 },
      { header: 'Pai', key: 'Pai', width: 12 },
      { header: 'Mãe', key: 'Mãe', width: 12 },
      { header: 'Avô Materno', key: 'Avô Materno', width: 12 },
      { header: 'Receptora', key: 'Receptora', width: 12 },
      { header: 'É FIV', key: 'É FIV', width: 8 },
      { header: 'Qtd Custos', key: 'Qtd Custos', width: 10 }
    ]

    // Adicionar os dados
    data.forEach(row => {
      worksheet.addRow(row)
    })

    // Estilizar o cabeçalho (linha 1)
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Azul
      }
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // Branco
        bold: true
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Estilizar todas as células de dados
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Pular o cabeçalho
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    })

    // Gerar o buffer do arquivo
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Criar um blob e fazer download
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    return false
  }
}

export const formatAnimalDataForExport = (animals) => {
  return animals.map(animal => ({
    'ID': animal.id,
    'Série': animal.serie,
    'RG': animal.rg,
    'Sexo': animal.sexo,
    'Raça': animal.raca,
    'Data Nascimento': animal.dataNascimento || 'N/A',
    'Idade (meses)': animal.meses,
    'Situação': animal.situacao,
    'Custo Total (R$)': animal.custoTotal.toFixed(2),
    'Valor Venda (R$)': animal.valorVenda ? animal.valorVenda.toFixed(2) : 'N/A',
    'Valor Real (R$)': animal.valorReal !== null ? animal.valorReal.toFixed(2) : 'N/A',
    'Pai': animal.pai || 'N/A',
    'Mãe': animal.mae || 'N/A',
    'Avô Materno': animal.avoMaterno || 'N/A',
    'Receptora': animal.receptora || 'N/A',
    'É FIV': animal.isFiv ? 'Sim' : 'Não',
    'Qtd Custos': animal.custos ? animal.custos.length : 0
  }))
}

export const exportCostsToExcel = async (animals, filename = 'beef_sync_custos') => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Custos')

    worksheet.columns = [
      { header: 'Animal ID', key: 'Animal ID', width: 10 },
      { header: 'Animal', key: 'Animal', width: 15 },
      { header: 'Raça', key: 'Raça', width: 12 },
      { header: 'Tipo Custo', key: 'Tipo Custo', width: 15 },
      { header: 'Subtipo', key: 'Subtipo', width: 12 },
      { header: 'Valor (R$)', key: 'Valor (R$)', width: 12 },
      { header: 'Data', key: 'Data', width: 12 },
      { header: 'Observações', key: 'Observações', width: 20 },
      { header: 'Fornecedor', key: 'Fornecedor', width: 15 },
      { header: 'Destino', key: 'Destino', width: 15 }
    ]

    const costsData = []
    animals.forEach(animal => {
      if (animal.custos && animal.custos.length > 0) {
        animal.custos.forEach(custo => {
          costsData.push({
            'Animal ID': animal.id,
            'Animal': `${animal.serie} ${animal.rg}`,
            'Raça': animal.raca,
            'Tipo Custo': custo.tipo,
            'Subtipo': custo.subtipo || 'N/A',
            'Valor (R$)': custo.valor.toFixed(2),
            'Data': custo.data,
            'Observações': custo.observacoes || 'N/A',
            'Fornecedor': custo.fornecedor || 'N/A',
            'Destino': custo.destino || 'N/A'
          })
        })
      }
    })

    costsData.forEach(row => {
      worksheet.addRow(row)
    })

    // Aplicar formatação
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      }
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Erro ao exportar custos para Excel:', error)
    return false
  }
}

export const exportReportToExcel = async (reportData, filename = 'beef_sync_relatorio') => {
  try {
    const workbook = new ExcelJS.Workbook()
    
    // Aba 1: Resumo Geral
    const resumoSheet = workbook.addWorksheet('Resumo')
    resumoSheet.columns = [
      { header: 'Indicador', key: 'Indicador', width: 20 },
      { header: 'Valor', key: 'Valor', width: 15 }
    ]

    const resumoData = [
      { 'Indicador': 'Total de Animais', 'Valor': reportData.totalAnimais },
      { 'Indicador': 'Animais Ativos', 'Valor': reportData.animaisAtivos },
      { 'Indicador': 'Animais Vendidos', 'Valor': reportData.animaisVendidos },
      { 'Indicador': 'Custo Total (R$)', 'Valor': reportData.custoTotal.toFixed(2) },
      { 'Indicador': 'Receita Total (R$)', 'Valor': reportData.receitaTotal.toFixed(2) },
      { 'Indicador': 'Lucro Total (R$)', 'Valor': reportData.lucroTotal.toFixed(2) }
    ]

    resumoData.forEach(row => {
      resumoSheet.addRow(row)
    })

    // Aplicar formatação ao resumo
    const resumoHeaderRow = resumoSheet.getRow(1)
    resumoHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      }
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    resumoSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Erro ao exportar relatório para Excel:', error)
    return false
  }
}