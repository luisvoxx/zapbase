import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Input } from '@/components/Input'
import { UserMenu } from '@/components/UserMenu'
import { ArrowLeft, Loader2, TrendingUp, DollarSign, BarChart as BarChartIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export function Analytics() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast.error('Erro ao carregar produtos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  const handleAnalyze = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto')
      return
    }

    setAnalyzing(true)

    try {
      // Buscar métricas dos produtos selecionados
      let query = supabase
        .from('product_metrics')
        .select('*, products!inner(id, name)')
        .in('product_id', selectedProducts)

      if (startDate) {
        query = query.gte('metric_date', startDate)
      }
      if (endDate) {
        query = query.lte('metric_date', endDate)
      }

      const { data: metricsData, error } = await query.order('metric_date')

      if (error) throw error

      // DEBUG: Log dos dados retornados
      console.log('=== DEBUG ANALISADOR ===')
      console.log('Produtos selecionados:', selectedProducts)
      console.log('Período:', { startDate, endDate })
      console.log('Total de métricas retornadas:', metricsData?.length || 0)
      console.log('Métricas por produto:')
      const metricsByProduct = {}
      metricsData?.forEach((m) => {
        const pName = m.products?.name || 'Unknown'
        metricsByProduct[pName] = (metricsByProduct[pName] || 0) + 1
      })
      console.log(metricsByProduct)
      console.log('Primeiras 3 métricas:', metricsData?.slice(0, 3))
      console.log('========================')

      // Processar dados
      const analysis = processAnalysisData(metricsData)
      setAnalysisData(analysis)
    } catch (error) {
      toast.error('Erro ao gerar análise: ' + error.message)
      console.error('Erro no Analisador:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const processAnalysisData = (metricsData) => {
    // Calcular totais gerais
    const totalInvestido = metricsData.reduce((sum, m) => sum + parseFloat(m.investido || 0), 0)
    const totalLeads = metricsData.reduce((sum, m) => sum + (m.leads || 0), 0)
    const totalVendas = metricsData.reduce((sum, m) => sum + (m.qnt_pix || 0), 0)
    const totalFaturamento = metricsData.reduce((sum, m) => sum + parseFloat(m.pix_total || 0), 0)
    const cplMedio = totalLeads > 0 ? totalInvestido / totalLeads : 0
    const taxaConversaoMedia = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0
    const roasMedio = totalInvestido > 0 ? totalFaturamento / totalInvestido : 0
    const resultado = totalFaturamento - totalInvestido

    // Calcular por produto
    const productMap = {}
    metricsData.forEach((metric) => {
      const productId = metric.product_id
      const productName = metric.products.name

      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: productName,
          investido: 0,
          leads: 0,
          vendas: 0,
          faturamento: 0,
        }
      }

      productMap[productId].investido += parseFloat(metric.investido || 0)
      productMap[productId].leads += metric.leads || 0
      productMap[productId].vendas += metric.qnt_pix || 0
      productMap[productId].faturamento += parseFloat(metric.pix_total || 0)
    })

    const productStats = Object.values(productMap).map((p) => ({
      ...p,
      cpl: p.leads > 0 ? p.investido / p.leads : 0,
      taxaConversao: p.leads > 0 ? (p.vendas / p.leads) * 100 : 0,
      roas: p.investido > 0 ? p.faturamento / p.investido : 0,
      resultado: p.faturamento - p.investido,
    }))

    // Preparar dados para gráficos
    // Gráfico 1: Taxa de Conversão por Data
    const dateMap = {}
    metricsData.forEach((metric) => {
      const date = formatDate(metric.metric_date)
      const productName = metric.products.name

      if (!dateMap[date]) {
        dateMap[date] = { date }
      }

      const leads = metric.leads || 0
      const vendas = metric.qnt_pix || 0
      const taxaConv = leads > 0 ? (vendas / leads) * 100 : 0

      if (!dateMap[date][productName]) {
        dateMap[date][productName] = []
      }
      dateMap[date][productName].push(taxaConv)
    })

    const conversionChartData = Object.values(dateMap).map((entry) => {
      const result = { date: entry.date }
      Object.keys(entry).forEach((key) => {
        if (key !== 'date') {
          const values = entry[key]
          result[key] = values.reduce((a, b) => a + b, 0) / values.length
        }
      })
      return result
    })

    // Gráfico 2: CPL por Data
    const cplDateMap = {}
    metricsData.forEach((metric) => {
      const date = formatDate(metric.metric_date)
      const productName = metric.products.name

      if (!cplDateMap[date]) {
        cplDateMap[date] = { date }
      }

      const leads = metric.leads || 0
      const investido = parseFloat(metric.investido || 0)
      const cpl = leads > 0 ? investido / leads : 0

      if (!cplDateMap[date][productName]) {
        cplDateMap[date][productName] = []
      }
      cplDateMap[date][productName].push(cpl)
    })

    const cplChartData = Object.values(cplDateMap).map((entry) => {
      const result = { date: entry.date }
      Object.keys(entry).forEach((key) => {
        if (key !== 'date') {
          const values = entry[key]
          result[key] = values.reduce((a, b) => a + b, 0) / values.length
        }
      })
      return result
    })

    return {
      summary: {
        totalInvestido,
        totalLeads,
        totalVendas,
        totalFaturamento,
        cplMedio,
        taxaConversaoMedia,
        roasMedio,
        resultado,
      },
      productStats,
      charts: {
        conversion: conversionChartData,
        cpl: cplChartData,
      },
      productNames: [...new Set(metricsData.map((m) => m.products.name))],
    }
  }

  const COLORS = ['#00FF41', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-accent-green" />
              Analisador de Métricas
            </h2>
            <p className="text-text-secondary mt-1">
              Análise comparativa de produtos e períodos
            </p>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção de Produtos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-text-secondary font-semibold">
                    Selecione os Produtos
                  </label>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    {selectedProducts.length === products.length
                      ? 'Desmarcar Todos'
                      : 'Selecionar Todos'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border-primary hover:bg-bg-secondary/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 rounded border-border-primary text-accent-green focus:ring-accent-green focus:ring-offset-0"
                      />
                      <span className="text-sm text-text-primary">{product.name}</span>
                    </label>
                  ))}
                </div>
                {products.length === 0 && (
                  <p className="text-text-muted text-sm">Nenhum produto cadastrado</p>
                )}
              </div>

              {/* Período */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="text-sm text-text-secondary block mb-2">
                    Data Início
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="text-sm text-text-secondary block mb-2">
                    Data Fim
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || selectedProducts.length === 0}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando Análise...
                  </>
                ) : (
                  <>
                    <BarChartIcon className="h-4 w-4" />
                    Gerar Análise
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados da Análise */}
          {analysisData && (
            <div className="space-y-6">
              {/* Cards de Resumo Geral */}
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-4">Resumo Geral</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-muted">Total Investido</p>
                          <p className="text-2xl font-bold text-text-primary">
                            {formatCurrency(analysisData.summary.totalInvestido)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-accent-red opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-text-muted">Total Leads</p>
                        <p className="text-2xl font-bold text-text-primary">
                          {analysisData.summary.totalLeads}
                        </p>
                        <p className="text-xs text-[#3B82F6] mt-1">
                          CPL: {formatCurrency(analysisData.summary.cplMedio)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-text-muted">Taxa de Conversão Média</p>
                        <p className="text-2xl font-bold text-[#A855F7]">
                          {analysisData.summary.taxaConversaoMedia.toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-text-muted">Total Vendas</p>
                        <p className="text-2xl font-bold text-text-primary">
                          {analysisData.summary.totalVendas}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          Faturamento: {formatCurrency(analysisData.summary.totalFaturamento)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-text-muted">ROAS Médio</p>
                        <p className="text-2xl font-bold text-text-primary">
                          {analysisData.summary.roasMedio.toFixed(2)}x
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-text-muted">Resultado Total</p>
                        <p
                          className={`text-2xl font-bold ${
                            analysisData.summary.resultado >= 0
                              ? 'text-accent-green'
                              : 'text-accent-red'
                          }`}
                        >
                          {formatCurrency(analysisData.summary.resultado)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tabela por Produto */}
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-4">Por Produto</h3>
                <div className="overflow-x-auto rounded-lg border border-border-primary">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg-secondary border-b border-border-primary">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Produto
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Investimento
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Leads
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          CPL
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Taxa Conv.
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Vendas
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          Faturamento
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                          ROAS
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Resultado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.productStats.map((product, index) => (
                        <tr
                          key={product.id}
                          className={`border-b border-border-primary ${
                            index % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary/20'
                          }`}
                        >
                          <td className="px-4 py-2 text-text-primary font-medium border-r border-border-primary">
                            {product.name}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(product.investido)}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {product.leads}
                          </td>
                          <td className="px-4 py-2 text-right text-[#3B82F6] font-semibold border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(product.cpl)}
                          </td>
                          <td className="px-4 py-2 text-right text-[#A855F7] font-semibold border-r border-border-primary">
                            {product.taxaConversao.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {product.vendas}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(product.faturamento)}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {product.roas.toFixed(2)}x
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-bold whitespace-nowrap ${
                              product.resultado >= 0 ? 'text-accent-green' : 'text-accent-red'
                            }`}
                          >
                            {formatCurrency(product.resultado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráficos */}
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-4">Análise Visual</h3>
                <div className="grid gap-6">
                  {/* Gráfico 1: Taxa de Conversão */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Taxa de Conversão por Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analysisData.charts.conversion}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A1A1A',
                              border: '1px solid #2A2A2A',
                              borderRadius: '8px',
                            }}
                            formatter={(value) => `${value.toFixed(1)}%`}
                          />
                          <Legend />
                          {analysisData.productNames.map((name, index) => (
                            <Line
                              key={name}
                              type="monotone"
                              dataKey={name}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length] }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico 2: CPL por Período */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CPL por Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analysisData.charts.cpl}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A1A1A',
                              border: '1px solid #2A2A2A',
                              borderRadius: '8px',
                            }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Legend />
                          {analysisData.productNames.map((name, index) => (
                            <Line
                              key={name}
                              type="monotone"
                              dataKey={name}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length] }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
