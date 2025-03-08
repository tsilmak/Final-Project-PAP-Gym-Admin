# Sonder Hub - Painel Administrativo
main.d2ixoe9qkxovtj.amplifyapp.com/

## Visão Geral
O Painel administrativo, Sonder Hub é uma plataforma web desenvolvida para a gestão eficiente de um ginásio fícticio, proporciona ferramentas administrativas completas para o gerenciamento de clientes, planos de treino, pagamentos e muito mais.

## Tecnologias Utilizadas
O painel administrativo foi desenvolvido utilizando as seguintes tecnologias:

- **Linguagens de Programação**: JavaScript
- **Frameworks e Bibliotecas**:
  - React (Front-end)
  - Express.js (Back-end)
  - Redux RTK para gerenciamento de estado
  - Prisma ORM para interação com banco de dados
  - Material UI para a interface do usuário
- **Banco de Dados**: PostgreSQL
- **Ambiente de Desenvolvimento Back-end**:
  - Node.js

## Funcionalidades
O painel administrativo do Sonder Hub inclui:

- **Gestão de Clientes**: Cadastro, edição e remoção de clientes.
- **Gestão de Planos e Aulas**: Configuração e gerenciamento de planos de treino e aulas.
- **Gestão de Equipamentos e Exercícios**: Controle sobre os equipamentos disponíveis no ginásio.
- **Publicação de Conteúdo**: Criação e edição de blogs informativos.
- **Administração de Pagamentos**: Processamento e controle de assinaturas e pagamentos.
- **Interação com Clientes**: Mensagens personalizadas e suporte ao cliente.

## Instalação e Configuração
Para visualizar o painel administrativo localmente, siga os seguintes passos:

1. Clone o repositório:
   ```sh
   git clone https://github.com/tsilmak/Final-Project-PAP-Gym-Admin.git
   cd Final-Project-PAP-Gym-Admin
   ```
2. Instale as dependências no cliente e no back-end:
   ```sh
   cd client
   npm i

   cd server
   npm i
   ```
3. Configure as variáveis de ambiente no servidor seguindo o exemplo `.env.example`:
   ```env
   
    # Configurações do Banco de Dados
    DATABASE_URL=postgresql://USER:PASSWD@localhost:5432/sonderhub
    PRISMA_DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DB?schema=public"

    # Configurações do Servidor
    PORT=8002
    NODE_ENV="development"

    # Segurança e Autenticação
    JWT_SECRET=sua_chave_secreta
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    SECRET=your_secret_key

    # Configurações de E-mail para envio de senhas
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password

    # Configurações do Cloudinary (para upload de arquivos)
    CLOUD_NAME=your_cloud_name
    API_KEY=your_api_key
    API_SECRET=your_api_secret
    UPLOAD_FOLDER_PRESET=your_upload_preset
    CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

    # Configurações de CORS (Cross-Origin Resource Sharing)
    CORS_ORIGIN=http://localhost:5173
   
   ```
4. Configure as variáveis de ambiente no cliente seguindo o exemplo `.env.example`:
   ```env
   
   # Base URL for the API
    REACT_APP_BASE_URL=http://localhost:8000

    # Cloudinary upload URL
    CLOUDINARY_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload

    # Upload folder preset for Cloudinary
    UPLOAD_FOLDER_PRESET=your-folder-preset

    # Disable source map generation for production
    GENERATE_SOURCEMAP=false

   ```
4. Execute o servidor na pasta (back-end) e o cliente na pasta (cliente):
   ```sh
   cd client
   npm run dev

   cd server
   npm run dev
   ```
5. O painel administrativo estará disponível em `http://localhost:3000`

