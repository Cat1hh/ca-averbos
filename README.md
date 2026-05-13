# Caça Verbos — Deploy no Vercel

Instruções rápidas para hospedar este projeto no Vercel.

Passos essenciais

- Conecte este repositório GitHub ao Vercel (Dashboard → New Project → Import Git Repository).
- Em *Project Settings → Environment Variables* adicione as variáveis listadas em `.env.example` (veja abaixo).
- Deploy: use o botão **Deploy** no dashboard ou rode localmente para testes com `vercel dev` (requer Vercel CLI).

Variáveis de ambiente necessárias

Crie as variáveis no dashboard do Vercel (ou com `vercel env add`) com valores apropriados:

- `DB_HOST` — host do banco MySQL (ex: `us-east1-mysql.example.com`)
- `DB_PORT` — porta (ex: `3306`)
- `DB_USER` — usuário do banco
- `DB_PASSWORD` — senha do banco
- `DB_NAME` — nome do banco (ex: `caca_verbos`)
- `JWT_SECRET` — segredo para tokens JWT (mantenha forte e privado)

Observações importantes

- O site e a API são servidos pelo Express em `server.js`, com a função Vercel em `api/[...all].js` apontando para o mesmo app.
- Garanta que seu banco MySQL aceite conexões do ambiente Vercel. O Vercel não hospeda MySQL diretamente, então você precisa usar um serviço externo.
- Para testes locais instale o Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Checklist rápido no Vercel

1. Conecte o repositório `ca-averbos` ao projeto.
2. Defina `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `JWT_SECRET` em Environment Variables.
3. Faça o deploy e teste a rota `/api/health`.

Se quiser, posso criar scripts adicionais, configurar CI ou testar `vercel dev` localmente para você.
