# 🚀 Setup ZapData Simplificado

Guia completo para configurar e rodar o ZapData localmente.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Editor de código (VS Code recomendado)

---

## 🏁 Passo a Passo (10 minutos)

### 1️⃣ Instalar Dependências

```bash
cd zapdata-simples
npm install
```

---

### 2️⃣ Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name:** zapdata
   - **Database Password:** Anote esta senha!
   - **Region:** Escolha a mais próxima
5. Aguarde ~2 minutos (criação do projeto)

---

### 3️⃣ Configurar Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de </> na barra lateral)
2. Clique em "New query"
3. Copie TODO o conteúdo do arquivo `supabase-setup.sql`
4. Cole no editor
5. Clique em "Run" (ou F5)
6. ✅ Você deve ver "Success. No rows returned"

---

### 4️⃣ Obter Credenciais do Supabase

1. No dashboard, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (parecido com: `https://xxxxx.supabase.co`)
   - **anon public** key (string longa começando com `eyJ...`)

---

### 5️⃣ Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo `.env` (sem .example):

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

2. Abra o arquivo `.env` e cole suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Substitua pelos valores REAIS do passo anterior!

---

### 6️⃣ Rodar o Projeto

```bash
npm run dev
```

Você verá algo como:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 7️⃣ Acessar e Testar

1. Abra o navegador em: **http://localhost:5173**
2. Clique em "Criar conta"
3. Preencha:
   - Email (pode ser qualquer email válido)
   - Senha (mínimo 6 caracteres)
4. Clique em "Criar Conta"
5. ✅ Você deve receber um email de confirmação do Supabase

**⚠️ IMPORTANTE:** Para confirmar o email:
- Opção 1: Clique no link do email
- Opção 2: No Supabase → **Authentication** → **Users** → Clique no usuário → "Confirm email"

6. Faça login e comece a usar!

---

## 🎯 Testando as Funcionalidades

### Adicionar Produto
1. No dashboard, clique em "Adicionar Produto"
2. Digite um nome (ex: "Curso de Marketing")
3. Clique em "Salvar"

### Adicionar Métricas
1. Clique no card do produto
2. Preencha:
   - Data
   - Investido (quanto gastou em tráfego)
   - Leads (quantos leads gerou)
   - Qnt Pix (quantas vendas fez)
   - Pix Total (quanto faturou)
3. Veja os cálculos automáticos:
   - CPL
   - % Conversão
   - Resultado (verde = lucro, vermelho = prejuízo)
   - ROAS
4. Clique em "Salvar Métrica"

---

## 🔍 Verificando se Está Funcionando

### No Supabase
1. Vá em **Table Editor**
2. Você deve ver as tabelas:
   - `products`
   - `product_metrics`
3. Clique em cada uma para ver os dados

### No Projeto
- ✅ Login funciona
- ✅ Criar conta funciona
- ✅ Produtos aparecem no dashboard
- ✅ Métricas são salvas
- ✅ Cálculos aparecem corretos

---

## 🐛 Problemas Comuns

### ❌ "Supabase URL e Anon Key são obrigatórios"
**Solução:** Verifique se o arquivo `.env` existe e tem as credenciais corretas.

### ❌ "Failed to fetch" ou "Network error"
**Solução:**
1. Verifique se o Supabase URL está correto
2. Verifique sua conexão com internet
3. Tente recarregar a página

### ❌ "Invalid login credentials"
**Solução:**
1. Confirme o email (veja passo 7)
2. Ou crie uma nova conta

### ❌ "Row Level Security" error
**Solução:** Execute novamente o `supabase-setup.sql` no SQL Editor

### ❌ Nada aparece ao clicar em "Adicionar Produto"
**Solução:**
1. Abra o console do navegador (F12)
2. Veja se há erros
3. Verifique se executou o SQL corretamente

---

## 📦 Estrutura do Projeto

```
zapdata-simples/
├── src/
│   ├── components/        # Componentes UI (Button, Input, etc)
│   ├── contexts/          # AuthContext (autenticação)
│   ├── lib/               # Supabase client + utils
│   ├── pages/             # Páginas (Login, Dashboard)
│   ├── App.jsx            # Rotas principais
│   ├── main.jsx           # Entry point
│   └── index.css          # Estilos globais
├── supabase-setup.sql     # SQL para configurar tabelas
├── .env                   # Suas credenciais (NÃO COMMITAR)
├── .env.example           # Template
├── package.json
└── SETUP.md               # Este arquivo
```

---

## 🚀 Deploy (Depois de Tudo Funcionando)

### Deploy no Vercel (Recomendado)

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Configure as variáveis de ambiente na Vercel:
   - Dashboard da Vercel → Seu projeto → Settings → Environment Variables
   - Adicione:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. Deploy para produção:
```bash
vercel --prod
```

---

## 🔒 Segurança

### O que está protegido:
- ✅ Row Level Security (RLS) habilitado
- ✅ Cada usuário vê apenas seus dados
- ✅ Autenticação com Supabase Auth
- ✅ API keys não expostas no código

### Boas práticas:
- ❌ NUNCA commite o arquivo `.env`
- ✅ Use .gitignore (já configurado)
- ✅ Nunca compartilhe suas keys
- ✅ Em produção, configure as variáveis no painel da Vercel

---

## 🆘 Precisa de Ajuda?

### Documentação
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)

### Verificar Logs
```bash
# No terminal onde rodou npm run dev
# Veja se há erros

# No navegador
# Pressione F12 → Console
```

### Resetar Tudo
Se algo der muito errado:

```bash
# 1. Deletar node_modules
rm -rf node_modules

# 2. Reinstalar
npm install

# 3. No Supabase, deletar as tabelas e recriar
# SQL Editor → Execute:
DROP TABLE IF EXISTS product_metrics CASCADE;
DROP TABLE IF EXISTS products CASCADE;

# 4. Execute novamente o supabase-setup.sql
```

---

## ✅ Checklist Final

Antes de usar, confirme:

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto criado no Supabase
- [ ] SQL executado no Supabase
- [ ] Arquivo `.env` criado com credenciais
- [ ] `npm run dev` rodando sem erros
- [ ] Consegue acessar `http://localhost:5173`
- [ ] Consegue criar conta
- [ ] Email confirmado
- [ ] Consegue fazer login
- [ ] Consegue adicionar produto

---

## 🎉 Pronto!

Agora você tem o ZapData rodando localmente!

**Próximos passos:**
1. Use normalmente para gerenciar suas métricas
2. Quando estiver pronto, faça o deploy
3. Customize conforme necessário

**Boa sorte! 🚀**
