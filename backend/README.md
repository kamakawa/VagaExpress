# Vaga Express - Backend

Backend para o sistema de reservas de hotéis Vaga Express, desenvolvido com Node.js, Express e SQLite/MySQL.

## 🚀 Instalação

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Edite o arquivo `.env` com suas configurações:
     - `JWT_SECRET`: uma chave secreta forte (ex: gere uma string aleatória)
     - `EMAIL_USER` e `EMAIL_PASS`: credenciais Gmail (opcional para desenvolvimento)
     - `EMAIL_DEV_MODE=true`: permite usar o backend sem SMTP e exibe o link de verificação na resposta

## 🗄️ Opções de Banco de Dados

### Opção 1: SQLite (Recomendado para desenvolvimento rápido)
- **Vantagens:** Não precisa instalar MySQL, banco de dados em arquivo único
- **Como usar:**
  ```bash
  npm start               # Usará SQLite por padrão
  npm run dev             # Usará SQLite em modo de desenvolvimento com nodemon
  ```

### Opção 2: MySQL (Para produção)
1. Instale MySQL Server ou XAMPP
2. Crie um banco chamado `vagaexpress`
3. Execute o script `database.sql` no MySQL
4. Configure as credenciais no `.env`:
   - `DB_PASSWORD`: sua senha do MySQL
5. Execute:
   ```bash
   npm start    # Produção
   npm run dev  # Desenvolvimento
   ```

## 📡 APIs Disponíveis

### Autenticação
- `POST /api/register` - Registrar novo usuário
- `POST /api/login` - Fazer login
- `GET /api/verify/:token` - Verificar email
- `GET /api/profile` - Perfil do usuário (autenticado)

### Hotéis
- `GET /api/hoteis` - Listar todos os hotéis

### Estrutura dos Dados

#### Registro de Usuário
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "(41) 99999-9999"
}
```

#### Login
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

## 🔧 Tecnologias Usadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3/MySQL2** - Banco de dados
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Tokens JWT
- **nodemailer** - Envio de emails
- **cors** - Cross-Origin Resource Sharing

## 📧 Configuração do Email

Para o envio de emails funcionar:
1. Use uma conta Gmail.
2. Ative a verificação em duas etapas.
3. Gere uma senha de app: https://myaccount.google.com/apppasswords
4. Use essa senha no `.env` (não a senha normal).

## 🗄️ Estrutura do Banco

O banco contém as tabelas:
- `usuarios` - Dados dos usuários
- `hoteis` - Informações dos hotéis
- `reservas` - Reservas realizadas

Para SQLite, as tabelas são criadas automaticamente. Para MySQL, execute o `database.sql`.
```

#### Login
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

## 🔧 Tecnologias Usadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver MySQL
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Tokens JWT
- **nodemailer** - Envio de emails
- **cors** - Cross-Origin Resource Sharing

## 📧 Configuração do Email

Para o envio de emails funcionar:
1. Use uma conta Gmail.
2. Ative a verificação em duas etapas.
3. Gere uma senha de app: https://myaccount.google.com/apppasswords
4. Use essa senha no `.env` (não a senha normal).

## 🗄️ Banco de Dados

O banco MySQL contém as tabelas:
- `usuarios` - Dados dos usuários
- `hoteis` - Informações dos hotéis
- `reservas` - Reservas realizadas

Execute o `database.sql` para criar tudo automaticamente.