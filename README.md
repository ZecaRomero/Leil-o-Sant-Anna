# 🚀 Beef Sync - Sistema Inteligente de Gestão Bovina

Sistema web moderno e profissional para gestão de custo individual de bovinos com análises inteligentes, alertas automáticos e interface de última geração.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral do rebanho com estatísticas em tempo real
- Cards informativos com totais de animais, custos e receitas
- Distribuição por raça e categoria
- Alertas e próximos partos

### 🐄 Gestão de Animais
- Cadastro completo de animais com validações
- Sistema de busca e filtros avançados
- Controle de peso e histórico
- Gestão de gestações e nascimentos
- Tabela responsiva com ações completas

### 💰 Gestão de Custos
- Sistema completo de custos por animal
- Categorias: Alimentação, Veterinário, Medicamentos, etc.
- Cálculo automático do custo total
- Análise de ROI e rentabilidade
- Relatórios financeiros detalhados

### 🚨 Sistema de Alertas
- Alertas automáticos para vacinas
- Notificações de partos próximos
- Lembretes de pesagem
- Sistema de prioridades

### 📈 Relatórios e Análises
- Dashboard com estatísticas em tempo real
- Relatórios de custos por período
- Análise de performance do rebanho
- Exportação de dados

### 🔐 Sistema de Autenticação
- Login seguro com JWT
- Controle de acesso por usuário
- Sessões persistentes
- Registro de novos usuários

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT, bcryptjs
- **Charts**: Chart.js, React-ChartJS-2
- **Utils**: date-fns, jsPDF, XLSX

## 📦 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd beef-sync
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o ambiente
Edite o arquivo `.env` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/beef_sync?schema=public"

# JWT Secret
JWT_SECRET="sua-chave-secreta-jwt"

# App Settings
NEXTAUTH_SECRET="sua-chave-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o banco de dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular com dados iniciais
npm run db:seed
```

### 5. Inicie o servidor
```bash
npm run dev
```

Acesse http://localhost:3000

## 🔑 Credenciais Padrão

Após executar o seed:
- **Email**: zeca@beefsync.com
- **Senha**: zeca123

## 📜 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run db:setup` - Configurar banco
- `npm run db:migrate` - Executar migrações
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:seed` - Popular dados iniciais
- `npm run db:reset` - Resetar banco
- `npm run db:studio` - Abrir Prisma Studio

## 🏗️ Estrutura do Projeto

```
beef-sync/
├── components/          # Componentes React
│   ├── AnimalForm.js   # Formulário de animais
│   ├── CostManager.js  # Gerenciador de custos
│   ├── LoginForm.js    # Formulário de login
│   └── ...
├── pages/              # Páginas Next.js
│   ├── api/           # API Routes
│   │   ├── auth/      # Autenticação
│   │   ├── animals/   # Animais
│   │   ├── costs/     # Custos
│   │   └── ...
│   ├── index.js       # Dashboard
│   ├── animals.js     # Gestão de animais
│   └── ...
├── lib/               # Utilitários
│   ├── prisma.js      # Cliente Prisma
│   └── auth.js        # Middleware de auth
├── services/          # Serviços
│   └── animalDataManager.js
├── prisma/            # Schema do banco
│   └── schema.prisma
├── scripts/           # Scripts de setup
│   ├── setup-db.js
│   └── seed.js
└── styles/            # Estilos
    └── globals.css
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### Animais
- `GET /api/animals` - Listar animais
- `POST /api/animals` - Criar animal
- `GET /api/animals/[id]` - Obter animal
- `PUT /api/animals/[id]` - Atualizar animal
- `DELETE /api/animals/[id]` - Remover animal

### Gestações
- `GET /api/gestations` - Listar gestações
- `POST /api/gestations` - Criar gestação
- `PUT /api/gestations/[id]` - Atualizar gestação

### Custos
- `GET /api/costs` - Listar custos
- `POST /api/costs` - Criar custo

### Alertas
- `GET /api/alerts` - Listar alertas
- `POST /api/alerts` - Criar alerta
- `PUT /api/alerts/[id]` - Atualizar alerta

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas

## 🐮 Regras de Negócio

### Categorias de Animais
- **Matriz**: Fêmeas reprodutoras
- **Reprodutor**: Machos reprodutores
- **Bezerro**: Animais jovens
- **Novilho**: Machos em crescimento
- **Novilha**: Fêmeas em crescimento

### Tipos de Custos
- **ALIMENTACAO**: Ração, suplementos
- **VETERINARIO**: Consultas, procedimentos
- **MEDICAMENTO**: Vacinas, remédios
- **EXAME**: DNA, exames diversos
- **NASCIMENTO**: Custos de parto
- **RECEPTORA**: Custos de FIV

### Status de Animais
- **ATIVO**: Animal no rebanho
- **VENDIDO**: Animal vendido
- **MORTO**: Animal morto

## 📱 Responsividade

Sistema totalmente responsivo:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🔄 Próximas Implementações

- [ ] Upload de imagens dos animais
- [ ] Controle de estoque
- [ ] Mapa de piquetes
- [ ] Exportação avançada
- [ ] Aplicativo mobile
- [ ] Integração com APIs de mercado
- [ ] Sistema de backup automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para gestão eficiente de rebanhos bovinos.

---

**Beef Sync** - Transformando a gestão bovina com tecnologia moderna! 🚀
