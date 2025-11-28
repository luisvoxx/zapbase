# ZapData Simplificado

Versão simplificada do ZapData usando **Vite + React + Supabase**.

## 🚀 Início Rápido

### 1. Instalar
```bash
npm install
```

### 2. Configurar Supabase
- Crie projeto no [Supabase](https://supabase.com)
- Execute o `supabase-setup.sql` no SQL Editor
- Copie as credenciais para `.env`

### 3. Rodar
```bash
npm run dev
```

📖 **Guia Completo:** Veja [SETUP.md](SETUP.md)

---

## ✨ O Que Mudou da Versão Anterior?

### Antes (Next.js)
- ❌ Next.js complexo
- ❌ API Routes customizadas
- ❌ Prisma ORM
- ❌ JWT manual
- ❌ Middleware complexo

### Agora (Vite + Supabase)
- ✅ Vite simples e rápido
- ✅ Supabase cuida da API
- ✅ Supabase Database
- ✅ Supabase Auth automático
- ✅ Row Level Security nativo

---

## 🎯 Funcionalidades

- ✅ Login/Registro (Supabase Auth)
- ✅ Múltiplos usuários isolados
- ✅ CRUD de produtos
- ✅ Registro de métricas diárias
- ✅ Cálculos automáticos (CPL, ROAS, etc)
- ✅ Design futurista mantido
- ✅ Responsivo

---

## 📦 Stack

- **Frontend:** Vite + React 18
- **Autenticação:** Supabase Auth
- **Banco:** Supabase Database (PostgreSQL)
- **UI:** Tailwind CSS
- **Gráficos:** Recharts (pronto para adicionar)
- **Deploy:** Vercel

---

## 📁 Estrutura

```
zapdata-simples/
├── src/
│   ├── components/     # Button, Input, Card, Select
│   ├── contexts/       # AuthContext
│   ├── lib/            # supabase.js, utils.js
│   ├── pages/          # Login, Dashboard
│   └── App.jsx         # Rotas
├── supabase-setup.sql  # SQL para configurar
├── SETUP.md            # Guia completo
└── .env                # Suas credenciais
```

---

## 🔒 Segurança

- Row Level Security (RLS) habilitado
- Cada usuário acessa apenas seus dados
- Políticas configuradas automaticamente
- Anon key segura para usar no frontend

---

## 🚀 Deploy

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Configurar env vars na Vercel
# Dashboard → Settings → Environment Variables
# Adicionar:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# 4. Deploy produção
vercel --prod
```

---

## 🆘 Problemas?

Veja [SETUP.md](SETUP.md) - seção "Problemas Comuns"

---

## 📝 To-Do (Próximas Funcionalidades)

- [ ] Página de métricas do produto
- [ ] Dashboard analítico com gráficos
- [ ] Filtros de período
- [ ] Exportação de dados
- [ ] Edição de métricas
- [ ] Deletar produtos

---

**Versão:** 1.0.0 Simplificada
**Stack:** Vite + React + Supabase
