const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOW_CLEAR_USERS = process.env.ALLOW_CLEAR_USERS === 'true' || process.env.NODE_ENV !== 'production';

if (!JWT_SECRET) {
  console.error('JWT_SECRET não definido. Defina a chave em .env e reinicie o servidor.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

const validateRegistration = ({ nome, email, senha }) => {
  if (!nome || !email || !senha) {
    return 'nome, email e senha são obrigatórios';
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    return 'Email inválido';
  }
  if (typeof senha !== 'string' || senha.length < 6) {
    return 'Senha deve ter ao menos 6 caracteres';
  }
  return null;
};

const validateLogin = ({ email, senha }) => {
  if (!email || !senha) {
    return 'email e senha são obrigatórios';
  }
  return null;
};

const handleServerError = (res, error, message = 'Erro interno do servidor') => {
  console.error(message, error);
  return res.status(500).json({ message });
};

// Conexão SQLite
const db = new sqlite3.Database('./vagaexpress.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('Conectado ao SQLite!');
    db.run('PRAGMA foreign_keys = ON');
    initDatabase();
  }
});

// Inicializar tabelas
function initDatabase() {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      telefone TEXT,
      verificado INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de hotéis
    db.run(`CREATE TABLE IF NOT EXISTS hoteis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cidade TEXT NOT NULL,
      estrelas INTEGER CHECK (estrelas >= 1 AND estrelas <= 5),
      preco REAL NOT NULL,
      descricao TEXT,
      imagem TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de reservas
    db.run(`CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      hotel_id INTEGER NOT NULL,
      checkin DATE NOT NULL,
      checkout DATE NOT NULL,
      quartos INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pendente',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (hotel_id) REFERENCES hoteis(id)
    )`);

    // Inserir hotéis de exemplo
    db.get("SELECT COUNT(*) as count FROM hoteis", [], (err, row) => {
      const hoteis = [
        ['Hotel Centro Curitiba', 'Curitiba', 4, 150.00, 'Hotel confortável no centro da cidade', 'assets/hotel1.jpg'],
        ['Pousada Londrina', 'Londrina', 4, 120.00, 'Pousada acolhedora com café da manhã', 'assets/hotel2.jpg'],
        ['Hotel Maringá Plaza', 'Maringá', 4, 140.00, 'Hotel moderno com piscina', 'assets/hotel3.jpg'],
        ['Resort Foz do Iguaçu', 'Foz do Iguaçu', 5, 250.00, 'Resort luxuoso próximo às cataratas', 'assets/hotel4.jpg'],
        ['Hotel Cascavel', 'Cascavel', 3, 110.00, 'Hotel econômico com bom custo-benefício', 'assets/hotel5.jpg'],
        ['Pousada Ponta Grossa', 'Ponta Grossa', 4, 130.00, 'Pousada aconchegante no centro', 'assets/hotel6.jpg'],
        ['Hotel Apucarana', 'Apucarana', 3, 100.00, 'Hotel simples e confortável', 'assets/hotel7.jpg'],
        ['Hotel Paranavaí', 'Paranavaí', 4, 160.00, 'Hotel próximo ao lago', 'assets/hotel8.jpg'],
        ['Centro Hotel Curitiba 2', 'Curitiba', 4, 180.00, 'Hotel moderno perto do centro', 'assets/hotel9.jpg'],
        ['Pousada Londrina Norte', 'Londrina', 3, 115.00, 'Pousada charmosa na região norte', 'assets/hotel10.jpg'],
        ['Hotel Maringá Central', 'Maringá', 4, 155.00, 'Localização central e quartos confortáveis', 'assets/hotel11.jpg'],
        ['Eco Resort Foz', 'Foz do Iguaçu', 5, 220.00, 'Resort ecológico com vista para a natureza', 'assets/hotel12.jpg'],
        ['Hotel Cascavel Sul', 'Cascavel', 4, 125.00, 'Hotel completo com restaurante e academia', 'assets/hotel13.jpg'],
        ['Pousada Ponta Grossa Verde', 'Ponta Grossa', 3, 105.00, 'Pousada charmosa com áreas verdes', 'assets/hotel14.jpg'],
        ['Hotel Apucarana Plaza', 'Apucarana', 4, 170.00, 'Hotel elegante com piscina e café', 'assets/hotel15.jpg'],
        ['Hotel Paranavaí Lago', 'Paranavaí', 4, 145.00, 'Hotel à beira do lago com paisagens lindas', 'assets/hotel16.jpg']
      ];

      if (row.count < hoteis.length) {
        db.run('DELETE FROM hoteis');
        db.run("DELETE FROM sqlite_sequence WHERE name='hoteis'");

        const stmt = db.prepare("INSERT INTO hoteis (nome, cidade, estrelas, preco, descricao, imagem) VALUES (?, ?, ?, ?, ?, ?)");
        hoteis.forEach(hotel => stmt.run(hotel));
        stmt.finalize();
        console.log('Hotéis de exemplo inseridos!');
      }
    });
  });
}

// Rota de registro
app.post('/api/register', (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  // Verificar se usuário já existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    if (row) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Inserir usuário
      db.run(
        'INSERT INTO usuarios (nome, email, senha, telefone, verificado) VALUES (?, ?, ?, ?, ?)',
        [nome, email, hashedPassword, telefone, 0],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
          }

          // Registro simples sem confirmação por email
          res.status(201).json({ message: 'Usuário registrado com sucesso! Agora você pode fazer login.' });
        }
      );

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const validationError = validateLogin(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    try {
      const passwordMatch = await bcrypt.compare(senha, user.senha);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      const token = jwt.sign({ userId: user.id, nome: user.nome }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Login realizado!', token, user: { id: user.id, nome: user.nome, email: user.email } });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota protegida de exemplo
app.get('/api/reservas', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.checkin, r.checkout, r.quartos, r.status,
             h.nome AS hotel_nome, h.cidade AS hotel_cidade, h.preco AS hotel_preco,
             h.imagem AS hotel_imagem
      FROM reservas r
      JOIN hoteis h ON r.hotel_id = h.id
      WHERE r.usuario_id = ?
      ORDER BY r.criado_em DESC
    `;
    const [rows] = await pool.execute(query, [req.user.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar reservas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para listar hotéis
app.get('/api/hoteis', (req, res) => {
  const { cidade, minPreco, maxPreco, estrelas } = req.query;
  let query = 'SELECT * FROM hoteis WHERE 1=1';
  const params = [];

  if (cidade) {
    query += ' AND cidade LIKE ? COLLATE NOCASE';
    params.push(`%${cidade}%`);
  }

  if (minPreco) {
    query += ' AND preco >= ?';
    params.push(Number(minPreco));
  }

  if (maxPreco) {
    query += ' AND preco <= ?';
    params.push(Number(maxPreco));
  }

  if (estrelas) {
    query += ' AND estrelas = ?';
    params.push(Number(estrelas));
  }

  query += ' ORDER BY nome';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// Rota para criar reserva
app.post('/api/reservas', authenticateToken, (req, res) => {
  const { hotel_id, checkin, checkout, quartos } = req.body;

  if (!hotel_id || !checkin || !checkout) {
    return res.status(400).json({ message: 'Dados da reserva incompletos' });
  }

  const checkinStr = typeof checkin === 'string' ? checkin.split('T')[0] : checkin;
  const checkoutStr = typeof checkout === 'string' ? checkout.split('T')[0] : checkout;
  const checkinDate = new Date(checkinStr);
  const checkoutDate = new Date(checkoutStr);
  if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime()) || checkoutDate <= checkinDate) {
    return res.status(400).json({ message: 'As datas informadas são inválidas' });
  }

  const quartosInt = Number(quartos) || 1;
  if (quartos !== undefined && (!Number.isInteger(quartosInt) || quartosInt < 1)) {
    return res.status(400).json({ message: 'Informe a quantidade de quartos válida' });
  }

  db.get('SELECT id FROM hoteis WHERE id = ?', [hotel_id], (err, hotel) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel não encontrado' });
    }

    db.get(
      `SELECT * FROM reservas
       WHERE hotel_id = ?
         AND status != 'cancelada'
         AND NOT (checkout <= ? OR checkin >= ?)`,
      [hotel_id, checkinStr, checkoutStr],
      (err, conflito) => {
        if (err) {
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }

        if (conflito) {
          return res.status(400).json({ message: 'Já existe reserva nesse período' });
        }

        db.run(
          'INSERT INTO reservas (usuario_id, hotel_id, checkin, checkout, quartos) VALUES (?, ?, ?, ?, ?)',
          [req.user.userId, hotel_id, checkinStr, checkoutStr, quartosInt],
          function(err) {
            if (err) {
              console.error('Erro ao criar reserva:', err);
              return res.status(500).json({ message: 'Erro ao criar reserva' });
            }
            res.status(201).json({ message: 'Reserva realizada com sucesso!', reservaId: this.lastID });
          }
        );
      }
    );
  });
});

// Rota para listar reservas do usuário
app.get('/api/reservas', authenticateToken, (req, res) => {
  const query = `
    SELECT r.id, r.checkin, r.checkout, r.quartos, r.status,
           h.nome AS hotel_nome, h.cidade AS hotel_cidade, h.preco AS hotel_preco
    FROM reservas r
    JOIN hoteis h ON r.hotel_id = h.id
    WHERE r.usuario_id = ?
    ORDER BY r.criado_em DESC
  `;

  db.all(query, [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// Rota de limpeza de dados de usuários e reservas
app.post('/api/clear-users', authenticateToken, (req, res) => {
  if (!ALLOW_CLEAR_USERS) {
    return res.status(403).json({ message: 'Rota de limpeza de dados desabilitada neste ambiente' });
  }

  db.exec(
    `DELETE FROM reservas; DELETE FROM usuarios; DELETE FROM sqlite_sequence WHERE name='reservas'; DELETE FROM sqlite_sequence WHERE name='usuarios';`,
    (err) => {
      if (err) {
        console.error('Erro ao limpar dados:', err);
        return res.status(500).json({ message: 'Erro ao limpar dados' });
      }
      res.json({ message: 'Dados de usuários e reservas limpos com sucesso.' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});