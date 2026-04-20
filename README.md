# Vaga Express - Sistema de Reservas de Hotéis 🏨

O **Vaga Express** é a minha primeira aplicação **Fullstack**, desenvolvida para facilitar a reserva de hospedagens no estado do Paraná. O projeto simula um ecossistema completo de reservas, permitindo que usuários pesquisem hotéis por cidade, visualizem detalhes, criem contas e gerenciem suas reservas de forma segura.

Este projeto marca o início da minha jornada integrando tecnologias de Frontend, Backend e Banco de Dados.

---

## 🚀 Tecnologias Utilizadas

Para a construção deste projeto, utilizei as seguintes tecnologias:

### Frontend
<div style="display: inline_block">
  <img align="center" alt="HTML5" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg">
  <img align="center" alt="CSS3" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg">
  <img align="center" alt="JS" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg">
</div>

### Backend & Database
<div style="display: inline_block">
  <img align="center" alt="NodeJS" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg">
  <img align="center" alt="Express" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg">
  <img align="center" alt="SQLite" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sqlite/sqlite-original.svg">
  <img align="center" alt="MySQL" height="40" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg">
</div>

---

## 📋 Funcionalidades Principais

* **Autenticação Segura:** Sistema de login e registro de usuários com criptografia de senhas via `bcrypt`.
* **Gestão de Sessão:** Uso de **JSON Web Tokens (JWT)** para proteger rotas e manter o usuário conectado.
* **Busca e Filtros:** Filtragem dinâmica de hotéis por cidade e ordenação por preço ou avaliação.
* **Reserva em Tempo Real:** Verificação de disponibilidade para evitar conflitos de datas no mesmo hotel.
* **Persistência de Dados:** Histórico de reservas vinculado ao perfil do usuário.
* **Dual-Database Support:** O backend está preparado para rodar tanto com **SQLite** quanto com **MySQL**.

---

## 🛠️ Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/kamakawa/vaga-express.git](https://github.com/kamakawa/VagaExpress.git)
    ```

2.  **Instale as dependências:**
    ```bash
    cd vagaexpress-backend
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione:
    ```env
    PORT=3000
    JWT_SECRET=sua_chave_secreta_aqui
    ```

4.  **Inicie o servidor (Modo SQLite):**
    ```bash
    npm run dev
    ```

5.  **Acesse a aplicação:**
    Abra o arquivo `index.html` no seu navegador (recomenda-se usar a extensão *Live Server* do VS Code).

---


## 🤝 Contato

Desenvolvido por **Eric Kamakawa** *Estudante de Engenharia de Computação - UTFPR*


---
