// Formatação de moeda
export function formatCurrency(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue || 0)
}

// Formatação de porcentagem
export function formatPercentage(value) {
  return `${(value || 0).toFixed(2)}%`
}

// Formatação de ROAS
export function formatROAS(value) {
  return `${(value || 0).toFixed(2)}x`
}

// Formatação de data (DD/MM)
export function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

// Formatação de data completa (DD/MM/YYYY)
export function formatFullDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Cálculo de CPL (Custo por Lead)
export function calculateCPL(investido, leads) {
  if (leads === 0) return 0
  return investido / leads
}

// Cálculo de Taxa de Conversão
export function calculateConversionRate(qntPix, leads) {
  if (leads === 0) return 0
  return (qntPix / leads) * 100
}

// Cálculo de Resultado
export function calculateResultado(pixTotal, investido) {
  return pixTotal - investido
}

// Cálculo de ROAS
export function calculateROAS(pixTotal, investido) {
  if (investido === 0) return 0
  return pixTotal / investido
}

// Cálculo de Ticket Médio
export function calculateTicketMedio(pixTotal, qntPix) {
  if (qntPix === 0) return 0
  return pixTotal / qntPix
}

// Cor do resultado (verde/vermelho)
export function getResultColor(value) {
  return value >= 0 ? 'text-accent-green' : 'text-accent-red'
}

// Classe CSS helper
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
