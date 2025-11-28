import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Input } from '@/components/Input'
import { ArrowLeft, Plus, Loader2, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    metric_date: format(new Date(), 'yyyy-MM-dd'),
    investido: '',
    leads: '',
    qnt_pix: '',
    pix_total: '',
  })

  // Calculated values
  const [calculated, setCalculated] = useState({
    custoLead: 0,
    roas: 0,
  })

  useEffect(() => {
    fetchProductAndMetrics()
  }, [productId])

  useEffect(() => {
    // Calcular valores automáticos quando os campos mudarem
    const investido = parseFloat(formData.investido) || 0
    const leads = parseInt(formData.leads) || 0
    const pixTotal = parseFloat(formData.pix_total) || 0

    const custoLead = leads > 0 ? investido / leads : 0
    const roas = investido > 0 ? pixTotal / investido : 0

    setCalculated({ custoLead, roas })
  }, [formData.investido, formData.leads, formData.pix_total])

  const fetchProductAndMetrics = async () => {
    try {
      // Buscar produto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single()

      if (productError) throw productError
      if (!productData) {
        toast.error('Produto não encontrado')
        navigate('/')
        return
      }

      setProduct(productData)

      // Buscar métricas
      const { data: metricsData, error: metricsError } = await supabase
        .from('product_metrics')
        .select('*')
        .eq('product_id', productId)
        .order('metric_date', { ascending: false })

      if (metricsError) throw metricsError

      setMetrics(metricsData || [])
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const metricData = {
        product_id: parseInt(productId),
        metric_date: formData.metric_date,
        investido: parseFloat(formData.investido) || 0,
        leads: parseInt(formData.leads) || 0,
        qnt_pix: parseInt(formData.qnt_pix) || 0,
        pix_total: parseFloat(formData.pix_total) || 0,
      }

      const { error } = await supabase
        .from('product_metrics')
        .upsert(metricData, {
          onConflict: 'product_id,metric_date',
        })

      if (error) throw error

      toast.success('Métrica salva com sucesso!')
      setShowAddModal(false)
      setFormData({
        metric_date: format(new Date(), 'yyyy-MM-dd'),
        investido: '',
        leads: '',
        qnt_pix: '',
        pix_total: '',
      })
      await fetchProductAndMetrics()
    } catch (error) {
      toast.error('Erro ao salvar métrica: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const calculateMetricTotals = () => {
    const totalInvestido = metrics.reduce(
      (sum, m) => sum + parseFloat(m.investido || 0),
      0
    )
    const totalLeads = metrics.reduce((sum, m) => sum + (m.leads || 0), 0)
    const totalVendas = metrics.reduce((sum, m) => sum + (m.qnt_pix || 0), 0)
    const totalFaturamento = metrics.reduce(
      (sum, m) => sum + parseFloat(m.pix_total || 0),
      0
    )

    const custoLeadMedio = totalLeads > 0 ? totalInvestido / totalLeads : 0
    const roasTotal = totalInvestido > 0 ? totalFaturamento / totalInvestido : 0
    const resultado = totalFaturamento - totalInvestido

    return {
      totalInvestido,
      totalLeads,
      totalVendas,
      totalFaturamento,
      custoLeadMedio,
      roasTotal,
      resultado,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
      </div>
    )
  }

  const totals = calculateMetricTotals()

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                {product?.name}
              </h2>
              <p className="text-text-secondary mt-1">
                Métricas de desempenho do produto
              </p>
            </div>

            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Adicionar Métrica
            </Button>
          </div>

          {/* Cards de Totais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Total Investido</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatCurrency(totals.totalInvestido)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-accent-red opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Total Leads</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {totals.totalLeads}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      CPL Médio: {formatCurrency(totals.custoLeadMedio)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent-cyan opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Total Vendas</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {totals.totalVendas}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Faturamento: {formatCurrency(totals.totalFaturamento)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-accent-green opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-text-muted">ROAS</p>
                  <p className="text-2xl font-bold text-accent-green">
                    {totals.roasTotal.toFixed(2)}x
                  </p>
                  <p
                    className={`text-xs font-semibold mt-1 ${
                      totals.resultado >= 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {totals.resultado >= 0 ? '+' : ''}
                    {formatCurrency(totals.resultado)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Métricas - Estilo Google Sheets */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary">
              Histórico de Métricas
            </h3>

            {metrics.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-text-secondary text-center">
                    Nenhuma métrica cadastrada ainda
                  </p>
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">
                    <Plus className="h-4 w-4" />
                    Adicionar Primeira Métrica
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-primary">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-secondary border-b border-border-primary">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                        Data
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
                        Qtd Vendas
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-primary">
                        Valor Vendas
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
                    {metrics.map((metric, index) => {
                      const custoLead =
                        metric.leads > 0 ? metric.investido / metric.leads : 0
                      const taxaConversao =
                        metric.leads > 0 ? (metric.qnt_pix / metric.leads) * 100 : 0
                      const roas =
                        metric.investido > 0 ? metric.pix_total / metric.investido : 0
                      const resultado = metric.pix_total - metric.investido

                      return (
                        <tr
                          key={metric.id}
                          className={`border-b border-border-primary transition-colors hover:bg-bg-secondary/30 ${
                            index % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary/20'
                          }`}
                        >
                          <td className="px-4 py-2 text-text-primary font-medium border-r border-border-primary whitespace-nowrap">
                            {format(new Date(metric.metric_date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(metric.investido)}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {metric.leads}
                          </td>
                          <td className="px-4 py-2 text-right text-[#3B82F6] font-semibold border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(custoLead)}
                          </td>
                          <td className="px-4 py-2 text-right text-[#A855F7] font-semibold border-r border-border-primary">
                            {taxaConversao.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {metric.qnt_pix}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary whitespace-nowrap">
                            {formatCurrency(metric.pix_total)}
                          </td>
                          <td className="px-4 py-2 text-right text-text-primary font-medium border-r border-border-primary">
                            {roas.toFixed(2)}x
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-bold whitespace-nowrap ${
                              resultado >= 0 ? 'text-accent-green' : 'text-accent-red'
                            }`}
                          >
                            {formatCurrency(resultado)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Adicionar Métrica */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Adicionar Métrica</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="metric_date" className="text-sm text-text-secondary">
                    Data
                  </label>
                  <Input
                    id="metric_date"
                    type="date"
                    value={formData.metric_date}
                    onChange={(e) => handleInputChange('metric_date', e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="investido" className="text-sm text-text-secondary">
                      Investimento (R$)
                    </label>
                    <Input
                      id="investido"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.investido}
                      onChange={(e) => handleInputChange('investido', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="leads" className="text-sm text-text-secondary">
                      Leads (quantidade)
                    </label>
                    <Input
                      id="leads"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.leads}
                      onChange={(e) => handleInputChange('leads', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="qnt_pix" className="text-sm text-text-secondary">
                      Quantidade de Vendas (PIX)
                    </label>
                    <Input
                      id="qnt_pix"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.qnt_pix}
                      onChange={(e) => handleInputChange('qnt_pix', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pix_total" className="text-sm text-text-secondary">
                      Valor das Vendas (R$)
                    </label>
                    <Input
                      id="pix_total"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.pix_total}
                      onChange={(e) => handleInputChange('pix_total', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Cálculos Automáticos */}
                <div className="p-4 rounded-lg bg-bg-primary border border-border-primary space-y-2">
                  <p className="text-sm font-semibold text-text-primary">
                    Cálculos Automáticos:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Custo por Lead: </span>
                      <span className="font-semibold text-accent-cyan">
                        {formatCurrency(calculated.custoLead)}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">ROAS: </span>
                      <span className="font-semibold text-accent-green">
                        {calculated.roas.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      setFormData({
                        metric_date: format(new Date(), 'yyyy-MM-dd'),
                        investido: '',
                        leads: '',
                        qnt_pix: '',
                        pix_total: '',
                      })
                    }}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Métrica'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
