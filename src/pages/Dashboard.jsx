import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Input } from '@/components/Input'
import { UserMenu } from '@/components/UserMenu'
import { Plus, Search, Loader2, BarChart, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { format, subDays } from 'date-fns'

export function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editProductName, setEditProductName] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Filtros de período
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchProducts()
  }, [startDate, endDate])

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      // Query base para produtos
      let metricsQuery = supabase
        .from('product_metrics')
        .select('*')

      // Aplicar filtros de data se definidos
      if (startDate) {
        metricsQuery = metricsQuery.gte('metric_date', startDate)
      }
      if (endDate) {
        metricsQuery = metricsQuery.lte('metric_date', endDate)
      }

      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      // Buscar métricas filtradas
      const { data: metricsData, error: metricsError } = await metricsQuery

      if (metricsError) throw metricsError

      // Calcular agregados por produto
      const productsWithMetrics = productsData.map((product) => {
        const metrics = (metricsData || []).filter((m) => m.product_id === product.id)
        const totalLeads = metrics.reduce((sum, m) => sum + (m.leads || 0), 0)
        const totalVendas = metrics.reduce((sum, m) => sum + (m.qnt_pix || 0), 0)
        const totalInvestido = metrics.reduce(
          (sum, m) => sum + parseFloat(m.investido || 0),
          0
        )
        const totalFaturamento = metrics.reduce(
          (sum, m) => sum + parseFloat(m.pix_total || 0),
          0
        )
        const resultado = totalFaturamento - totalInvestido

        return {
          id: product.id,
          name: product.name,
          created_at: product.created_at,
          metrics_count: metrics.length,
          total_leads: totalLeads,
          total_vendas: totalVendas,
          total_faturamento: totalFaturamento,
          resultado_total: resultado,
        }
      })

      setProducts(productsWithMetrics)
      setFilteredProducts(productsWithMetrics)
    } catch (error) {
      toast.error('Erro ao carregar produtos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!newProductName.trim()) return

    setCreating(true)

    try {
      const { error } = await supabase
        .from('products')
        .insert([{ name: newProductName, user_id: user.id }])

      if (error) throw error

      toast.success('Produto criado com sucesso!')
      setShowAddModal(false)
      setNewProductName('')
      await fetchProducts()
    } catch (error) {
      toast.error('Erro ao criar produto: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    if (!editProductName.trim()) return

    setUpdating(true)

    try {
      const { error } = await supabase
        .from('products')
        .update({ name: editProductName })
        .eq('id', editingProduct.id)

      if (error) throw error

      toast.success('Produto atualizado com sucesso!')
      setEditingProduct(null)
      setEditProductName('')
      await fetchProducts()
    } catch (error) {
      toast.error('Erro ao atualizar produto: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id)

      if (error) throw error

      toast.success('Produto excluído com sucesso!')
      setDeletingProduct(null)
      await fetchProducts()
    } catch (error) {
      toast.error('Erro ao excluir produto: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

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
          <div className="flex items-center gap-3">
            <BarChart className="h-8 w-8 text-accent-green" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text text-transparent">
              ZapBase
            </h1>
          </div>

          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Meus Produtos</h2>
              <p className="text-text-secondary mt-1">
                Gerencie e acompanhe suas métricas de vendas
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/analytics')}>
                <TrendingUp className="h-4 w-4" />
                Analisador
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          </div>

          {/* Filtro de Período */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
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
                <div className="flex-1">
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate('')
                    setEndDate(format(new Date(), 'yyyy-MM-dd'))
                  }}
                >
                  Limpar Filtro
                </Button>
              </div>
              {(startDate || endDate !== format(new Date(), 'yyyy-MM-dd')) && (
                <p className="text-xs text-accent-cyan mt-3">
                  Exibindo métricas do período selecionado
                </p>
              )}
            </CardContent>
          </Card>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-text-secondary text-center">
                  {searchQuery
                    ? 'Nenhum produto encontrado'
                    : 'Nenhum produto cadastrado ainda'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Produto
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const investido = product.total_faturamento - product.resultado_total
                const cpl = product.total_leads > 0 ? investido / product.total_leads : 0
                const taxaConv = product.total_leads > 0 ? (product.total_vendas / product.total_leads) * 100 : 0

                return (
                  <Card
                    key={product.id}
                    className="relative hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-shadow cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}/metrics`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl hover:text-accent-green transition-colors flex-1">
                          {product.name}
                        </CardTitle>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingProduct(product)
                              setEditProductName(product.name)
                            }}
                            className="p-1.5 hover:bg-bg-primary rounded transition-colors text-text-muted hover:text-accent-cyan"
                            title="Editar produto"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingProduct(product)
                            }}
                            className="p-1.5 hover:bg-bg-primary rounded transition-colors text-text-muted hover:text-accent-red"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {product.metrics_count} métrica{product.metrics_count !== 1 ? 's' : ''}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-text-muted text-xs">Leads</div>
                          <div className="font-semibold text-text-primary">
                            {product.total_leads}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-muted text-xs">Vendas</div>
                          <div className="font-semibold text-text-primary">
                            {product.total_vendas}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-muted text-xs">CPL Médio</div>
                          <div className="font-semibold text-[#3B82F6]">
                            {formatCurrency(cpl)}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-muted text-xs">Taxa Conv.</div>
                          <div className="font-semibold text-[#A855F7]">
                            {taxaConv.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-primary">
                        <div className="text-text-muted text-xs">Faturamento</div>
                        <div className="font-bold text-text-primary">
                          {formatCurrency(product.total_faturamento)}
                        </div>
                      </div>

                      <div>
                        <div className="text-text-muted text-xs">Resultado</div>
                        <div
                          className={`font-bold text-lg ${
                            product.resultado_total >= 0
                              ? 'text-accent-green'
                              : 'text-accent-red'
                          }`}
                        >
                          {formatCurrency(product.resultado_total)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal Adicionar Produto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Adicionar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="productName" className="text-sm text-text-secondary">
                    Nome do Produto
                  </label>
                  <Input
                    id="productName"
                    placeholder="Ex: Curso de Marketing Digital"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    minLength={3}
                    maxLength={100}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      setNewProductName('')
                    }}
                    disabled={creating}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Editar Produto */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Editar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="editProductName" className="text-sm text-text-secondary">
                    Nome do Produto
                  </label>
                  <Input
                    id="editProductName"
                    placeholder="Nome do produto"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    minLength={3}
                    maxLength={100}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(null)
                      setEditProductName('')
                    }}
                    disabled={updating}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updating} className="flex-1">
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Excluir Produto */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Excluir Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-text-secondary">
                  Tem certeza que deseja excluir o produto{' '}
                  <span className="font-semibold text-text-primary">
                    {deletingProduct.name}
                  </span>
                  ?
                </p>
                <p className="text-sm text-accent-red">
                  Esta ação não pode ser desfeita. Todas as métricas associadas também serão
                  excluídas.
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeletingProduct(null)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteProduct}
                    disabled={deleting}
                    className="flex-1 bg-accent-red hover:bg-accent-red/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
