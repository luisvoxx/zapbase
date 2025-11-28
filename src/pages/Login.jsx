import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({ email: '', password: '' })
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast.success('Login realizado com sucesso!')
        navigate('/')
      } else {
        await signUp(formData.email, formData.password)
        toast.success('Conta criada com sucesso! Verifique seu email.')
        navigate('/')
      }
    } catch (error) {
      const errorMessage = error.message || `Erro ao ${isLogin ? 'fazer login' : 'criar conta'}`

      // Tratar erros específicos
      if (errorMessage.includes('already registered') || errorMessage.includes('já cadastrado')) {
        setErrors({ ...errors, email: 'Este email já está cadastrado. Faça login ou use outro email.' })
        toast.error('Email já cadastrado')
      } else if (errorMessage.includes('Invalid login credentials')) {
        setErrors({ ...errors, email: 'Email ou senha incorretos' })
        toast.error('Email ou senha incorretos')
      } else if (errorMessage.includes('Password should be at least')) {
        setErrors({ ...errors, password: 'A senha deve ter pelo menos 6 caracteres' })
        toast.error('Senha muito curta')
      } else if (errorMessage.includes('Invalid email')) {
        setErrors({ ...errors, email: 'Email inválido' })
        toast.error('Email inválido')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text text-transparent mb-2">
            ZapBase
          </h1>
          <p className="text-text-secondary">Gerencie suas métricas de vendas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Login' : 'Criar Conta'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-text-secondary">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setErrors({ ...errors, email: '' })
                  }}
                  required
                  disabled={loading}
                  className={errors.email ? 'border-accent-red focus:border-accent-red' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-accent-red font-semibold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-text-secondary">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      setErrors({ ...errors, password: '' })
                    }}
                    required
                    disabled={loading}
                    className={errors.password ? 'border-accent-red focus:border-accent-red' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-accent-red font-semibold">{errors.password}</p>
                )}
                {!isLogin && !errors.password && (
                  <p className="text-xs text-text-muted">Mínimo de 6 caracteres</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center text-sm text-text-secondary">
                {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-accent-green hover:underline font-semibold"
                >
                  {isLogin ? 'Criar conta' : 'Fazer login'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
