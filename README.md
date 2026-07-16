# Barbearia Pikachu — Site + Painel Administrativo

Site institucional da Barbearia Pikachu (Januária‑MG) com um **painel administrativo em `/admin`**
para editar preços, planos de assinatura e ganhadores do sorteio mensal sem mexer em código.
Feito com **Vite** (HTML + CSS + JS puro, sem framework) e **Firebase** (Auth + Firestore + Storage).

---

## Índice

1. [Estrutura do projeto](#estrutura-do-projeto)
2. [Como funciona](#como-funciona)
3. [Passo a passo: criar o projeto no Firebase](#passo-a-passo-criar-o-projeto-no-firebase)
4. [Configurar o `.env`](#configurar-o-env)
5. [Regras de segurança (Firestore e Storage)](#regras-de-segurança-firestore-e-storage)
6. [Criar o usuário administrador](#criar-o-usuário-administrador)
7. [Rodando localmente](#rodando-localmente)
8. [Publicando no GitHub](#publicando-no-github)
9. [Publicando na Vercel](#publicando-na-vercel)
10. [Usando o painel administrativo](#usando-o-painel-administrativo)
11. [Modelo de dados no Firestore](#modelo-de-dados-no-firestore)

---

## Estrutura do projeto

```
pikachu-vite/
├─ index.html                 # site público (entrada)
├─ admin/
│  └─ index.html              # painel administrativo (entrada, rota /admin)
├─ src/
│  ├─ main.js                 # lógica do site público (lê dados do Firestore em tempo real)
│  ├─ style.css                # visual do site público
│  ├─ data/
│  │  └─ defaultData.js        # dados padrão (fallback + seed inicial)
│  ├─ services/
│  │  ├─ firebase.js           # inicialização do Firebase (lê o .env)
│  │  ├─ auth.js                # login/logout/observador de sessão
│  │  └─ data.js                # leitura/escrita de preços, planos e ganhadores
│  ├─ utils/
│  │  └─ currency.js            # máscara de valores em reais
│  └─ admin/
│     ├─ admin.js               # entrada do painel (decide Login x Dashboard)
│     ├─ admin.css              # visual do painel
│     ├─ ui.js                   # toasts, modal de confirmação, loading
│     ├─ pages/
│     │  ├─ Login.js
│     │  └─ Dashboard.js
│     └─ components/
│        ├─ AdminLayout.js       # sidebar + header + troca de telas
│        ├─ Sidebar.js
│        ├─ Header.js
│        ├─ PriceTable.js        # editor da tabela de preços
│        ├─ PlanEditor.js        # editor dos planos
│        └─ WinnerEditor.js      # editor dos ganhadores (com upload de foto)
├─ public/img/                  # logo e fotos da equipe (estáticas)
├─ .env.example
├─ vite.config.js                # build com duas entradas: site + admin
├─ vercel.json                   # rota limpa /admin
└─ package.json
```

## Como funciona

- O **site público** (`index.html` / `src/main.js`) lê preços, planos e ganhadores do **Firestore
  em tempo real** (`onSnapshot`). Qualquer alteração salva no painel aparece no site sozinha, sem
  precisar dar deploy de novo.
- O **painel** (`/admin`) é protegido por **Firebase Authentication**: sem login válido, a pessoa
  só vê a tela de login — nunca o conteúdo do dashboard.
- Se o Firebase **não estiver configurado** (sem `.env`), o site continua funcionando normalmente,
  mostrando os dados padrão de `src/data/defaultData.js` (mas o painel fica bloqueado, avisando
  que precisa configurar).

---

## Passo a passo: criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e clique em
   **"Adicionar projeto"**. Dê um nome (ex.: `barbearia-pikachu`) e conclua a criação.

2. **Ative o Authentication:**
   - Menu lateral → **Build → Authentication → Get started**.
   - Na aba **Sign-in method**, ative o provedor **E-mail/senha**.

3. **Ative o Firestore:**
   - Menu lateral → **Build → Firestore Database → Create database**.
   - Escolha o modo **produção** (vamos configurar as regras manualmente, veja abaixo).
   - Escolha a região mais próxima (ex.: `southamerica-east1` para o Brasil).

4. **Ative o Storage** (para as fotos dos ganhadores):
   - Menu lateral → **Build → Storage → Get started**.
   - Também em modo produção, mesma região do Firestore.

5. **Pegue as chaves do app:**
   - Menu lateral → ⚙️ **Configurações do projeto** → aba **Geral**.
   - Em **"Seus apps"**, clique no ícone **`</>`** (Web) para criar um app da Web.
   - Dê um apelido (ex.: `site`) e clique em **Registrar app**.
   - Copie o objeto `firebaseConfig` que aparece — você vai usar no próximo passo.

---

## Configurar o `.env`

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e preencha com os valores do `firebaseConfig` que você copiou:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=barbearia-pikachu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=barbearia-pikachu
VITE_FIREBASE_STORAGE_BUCKET=barbearia-pikachu.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

O `.env` **nunca** deve ser commitado (já está no `.gitignore`). Na Vercel, essas mesmas
variáveis são configuradas pelo painel do site (veja a seção de deploy).

---

## Regras de segurança (Firestore e Storage)

Por padrão o Firestore/Storage em modo produção bloqueia tudo. Precisamos liberar **leitura
pública** (para o site funcionar) e **escrita apenas para quem estiver logado** (o painel admin).

### Firestore

No console: **Firestore Database → Regras**, substitua pelo conteúdo abaixo e clique em **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage

No console: **Storage → Regras**, substitua e publique:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Essas regras dizem: **qualquer pessoa pode ler** (para o site carregar os dados), mas **só quem
tiver feito login** (o admin) pode escrever.

---

## Criar o usuário administrador

O painel usa um "usuário" (ex.: `Igorpikachu`) só como apelido — por baixo, o Firebase Auth exige
um e-mail, que é montado automaticamente assim:

```
Igorpikachu  →  igorpikachu@barbeariapikachu.admin
```

Para criar esse usuário:

1. No console: **Authentication → Users → Add user**.
2. **E-mail:** `igorpikachu@barbeariapikachu.admin` (minúsculo, sem espaços, exatamente assim).
3. **Senha:** `0987654` (ou outra senha forte de sua escolha — só ajuste no login depois).
4. Clique em **Add user**.

Pronto — no painel (`/admin`), o login será:
- **Usuário:** `Igorpikachu`
- **Senha:** `0987654`

> Quer trocar a senha depois? Faça isso direto no console do Firebase
> (**Authentication → Users → ⋮ → Reset password**) ou peça para a pessoa usar "Esqueci minha
> senha" caso você queira adicionar esse fluxo futuramente.

> Quer adicionar mais de um administrador? Repita o passo acima com outro nome de usuário
> (ex.: `maria` → `maria@barbeariapikachu.admin`).

---

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

- Site público: `http://localhost:5173/`
- Painel admin: `http://localhost:5173/admin/`

## Gerando o build de produção

```bash
npm run build
npm run preview   # confere o build antes de publicar
```

Os arquivos finais vão para `dist/` (site em `dist/index.html`, painel em `dist/admin/index.html`).

---

## Publicando no GitHub

```bash
git init
git add .
git commit -m "Site + painel administrativo Barbearia Pikachu"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/barbearia-pikachu.git
git push -u origin main
```

O arquivo `.env` **não vai junto** (está no `.gitignore`) — isso é o esperado e o correto.

---

## Publicando na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importe o repositório do GitHub.
2. A Vercel detecta o Vite automaticamente (o `vercel.json` já deixa isso explícito).
3. **Antes de clicar em Deploy**, adicione as variáveis de ambiente em
   **Environment Variables** (mesmos nomes e valores do seu `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Clique em **Deploy**.
5. Depois do primeiro deploy, adicione o domínio da Vercel (ex.: `seusite.vercel.app`) na lista de
   domínios autorizados do Firebase: **Authentication → Settings → Authorized domains → Add domain**
   — sem isso o login no painel falha em produção.

O site fica em `https://seusite.vercel.app/` e o painel em `https://seusite.vercel.app/admin`.

---

## Usando o painel administrativo

- **Dashboard:** visão geral com totais de serviços, planos e ganhadores. Na primeira vez que
  configurar o Firebase, use o botão **"Carregar dados padrão no Firestore"** para popular o banco
  com os preços/planos atuais do site (só funciona se as coleções ainda estiverem vazias).
- **Tabela de Preços:** duas abas (Pikachu / Equipe). Edite nome, observação, "a partir de" e
  preço de cada serviço e combo. Pode adicionar ou remover linhas. Clique em **Salvar alterações**
  para publicar no site.
- **Planos:** cada card mostra um plano. **Editar** abre um formulário completo (nome, dias
  válidos, itens inclusos, tags de bônus, valores, se é destaque e a ordem no carrossel). **+ Novo
  plano** cria um do zero. **Excluir** pede confirmação antes de remover.
- **Ganhadores do Sorteio:** o "Pódio atual" mostra os três lugares (Top 1/2/3) — clique em
  **Editar**/**Definir ganhador** para escolher a foto (com pré-visualização), nome e data. Abaixo
  fica o histórico completo, com busca por nome e ordenação por data; dá para reaproveitar um
  ganhador antigo promovendo-o de volta ao pódio, ou excluir de vez.

Todas as telas mostram um **toast** de sucesso/erro, uma **animação de carregamento** durante o
salvamento, e pedem **confirmação** antes de qualquer exclusão.

---

## Modelo de dados no Firestore

Caso queira editar os dados diretamente pelo console do Firebase:

**Coleção `prices`** — dois documentos de ID fixo `pikachu` e `equipe`, cada um com:
```json
{
  "services": [{ "id": "barba", "name": "Barba", "note": "", "price": "35,00", "from": false }],
  "combos": [{ "id": "combo-1", "name": "Cabelo + barba", "price": "69,00" }]
}
```

**Coleção `plans`** — um documento por plano:
```json
{
  "order": 1,
  "eyebrow": "Assinatura",
  "name": "Cabelo",
  "day": "Quarta-feira",
  "included": ["4 cortes de cabelo no mês"],
  "bonusTags": ["🎁 Participação em sorteios mensais"],
  "oldPrice": "140,00",
  "newPrice": "109,90",
  "featured": false,
  "badge": ""
}
```

**Coleção `winners`** — um documento por ganhador (histórico completo; só quem tem `position`
1, 2 ou 3 aparece no pódio do site):
```json
{
  "name": "Natan Christian",
  "photoUrl": "https://firebasestorage.googleapis.com/...",
  "photoPath": "winners/123-foto.jpg",
  "date": "2026-07-01",
  "position": 1
}
```
