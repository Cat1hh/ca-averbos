# Guia de Configuração no Vercel

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no painel do Vercel (Settings → Environment Variables):

### Obrigatórias
- **DATABASE_URL**: String de conexão PostgreSQL
  - Exemplo (Neon): `postgres://user:password@host.neon.tech/dbname`
  - Exemplo (Supabase): `postgresql://user:password@host.supabase.co:5432/postgres`
  
- **JWT_SECRET**: Uma string aleatória forte para assinar tokens JWT
  - Exemplo: `your-super-secret-key-change-this-in-production`

### Opcionais
- **DATABASE_SSL**: `false` para desabilitar SSL (default: `true`)
- **DB_POOL_MAX**: Máximo de conexões simultâneas (default: `10`)
- **NODE_ENV**: `production` (geralmente definido automaticamente)

## Passo a Passo

1. **Commit e Push** dos arquivos atualizados para seu repositório Git
2. **No painel do Vercel**:
   - Vá para Settings → Environment Variables
   - Adicione as variáveis acima
   - Escolha os ambientes (Production, Preview, Development) conforme necessário
3. **Reimplante**:
   - Clique em "Redeploy" ou faça um novo push
   - Verifique os logs em Deployments

## Testando a Conexão

Visite `https://seu-projeto.vercel.app/api/health` para verificar:
- Se `DATABASE_URL` está configurada
- Status da conexão com o banco de dados
- Se está rodando no Vercel

Resposta esperada:
```json
{
  "ok": true,
  "database_url_configured": true,
  "database_status": "OK",
  "environment": "production",
  "vercel": true
}
```

## Erro 500 em /api/auth/register?

Possíveis causas:
1. **DATABASE_URL não configurada** → Configure em Environment Variables
2. **Banco de dados inacessível** → Verifique se o host é acessível do Vercel (não usar localhost)
3. **Tabelas não existem** → Execute `schema.sql` no seu banco de dados
4. **Conexão SSL rejeitada** → Tente `DATABASE_SSL=false`

Verifique os logs do Vercel (Deployments → View Logs) para mensagens de erro detalhadas.

## Estrutura do Projeto

- `server.js` - Express app principal
- `api/[...all].js` - Handler Vercel (exporta o app com serverless-http)
- `db.js` - Pool de conexões PostgreSQL
- `vercel.json` - Configuração de routing

Mais informações: [Vercel Node.js Runtime](https://vercel.com/docs/functions/nodejs)
