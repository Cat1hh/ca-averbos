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

- Este projeto usa uma função serverless Express (`api/[...all].js`) e `serverless-http`.
- Garanta que seu banco MySQL aceite conexões do ambiente Vercel (use um serviço cloud como PlanetScale, ClearDB ou um host com IPs acessíveis).
- Para testes locais instale o Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Se quiser, posso criar scripts adicionais, configurar CI ou testar `vercel dev` localmente para você.
