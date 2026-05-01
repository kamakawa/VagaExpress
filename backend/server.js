require('dotenv').config();

const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve imagens dos hotéis
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

const {
  DB_HOST    = 'localhost',
  DB_USER    = 'root',
  DB_PASSWORD = '',
  DB_NAME    = 'vagaexpress',
  JWT_SECRET = 'vagaexpress_jwt_secret_CHANGE_ME',
  PORT       = 3000
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME,
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows]   = await conn.execute('SELECT DATABASE() AS db');
    const [tables] = await conn.execute('SHOW TABLES');
    console.log(`✅ Conectado ao banco: ${rows[0].db} | Tabelas: ${tables.length}`);
    conn.release();
  } catch (err) {
    console.error('❌ Erro MySQL:', err.message);
    console.error('   Verifique DB_PASSWORD no .env');
  }
})();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token não enviado' });
  const token = header.split(' ')[1];
  if (!token)  return res.status(401).json({ message: 'Token mal formatado' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

/* ── REGISTRO ──────────────────────────────────────────── */
app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ message: 'Preencha todos os campos' });
    if (senha.length < 6)
      return res.status(400).json({ message: 'Senha precisa ter ao menos 6 caracteres' });

    const hash = await bcrypt.hash(senha, 10);
    const [r] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome.trim(), email.toLowerCase().trim(), hash]
    );
    res.status(201).json({ message: 'Usuário criado com sucesso', userId: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Este e-mail já está cadastrado' });
    console.error(err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

/* ── LOGIN ─────────────────────────────────────────────── */
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ message: 'Preencha e-mail e senha' });

    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(senha, user.senha)))
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });

    const token = jwt.sign(
      { userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

/* ── HOTÉIS ────────────────────────────────────────────── */
app.get('/api/hoteis', async (req, res) => {
  try {
    const { cidade, ordenar } = req.query;
    let sql = 'SELECT * FROM hoteis';
    const params = [];

    if (cidade) { sql += ' WHERE cidade = ?'; params.push(cidade); }

    if      (ordenar === 'preco')    sql += ' ORDER BY preco ASC';
    else if (ordenar === 'avaliacao') sql += ' ORDER BY estrelas DESC';
    else                              sql += ' ORDER BY id ASC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar hotéis' });
  }
});

/* ── DISPONIBILIDADE (público — datas ocupadas do hotel) ── */
app.get('/api/hoteis/:id/disponibilidade', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT checkin, checkout FROM reservas WHERE hotel_id = ?',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar disponibilidade' });
  }
});

/* ── RESERVAS — LISTAR ─────────────────────────────────── */
app.get('/api/reservas', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.id, r.hotel_id, r.checkin, r.checkout, r.quartos,
             h.nome AS hotel_nome, h.cidade AS hotel_cidade,
             h.preco AS hotel_preco, h.imagem AS hotel_imagem,
             h.estrelas AS hotel_estrelas
      FROM reservas r
      JOIN hoteis h ON r.hotel_id = h.id
      WHERE r.usuario_id = ?
      ORDER BY r.id DESC
    `, [req.user.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar reservas' });
  }
});

/* ── RESERVAS — CRIAR ──────────────────────────────────── */
app.post('/api/reservas', auth, async (req, res) => {
  try {
    const { hotel_id, checkin, checkout, quartos = 1 } = req.body;
    if (!hotel_id || !checkin || !checkout)
      return res.status(400).json({ message: 'hotel_id, checkin e checkout são obrigatórios' });
    if (checkout <= checkin)
      return res.status(400).json({ message: 'Check-out deve ser depois do check-in' });

    const [hotel] = await pool.execute('SELECT id FROM hoteis WHERE id = ?', [hotel_id]);
    if (!hotel.length)
      return res.status(404).json({ message: 'Hotel não encontrado' });

    const [conflito] = await pool.execute(
      'SELECT id FROM reservas WHERE hotel_id = ? AND NOT (checkout <= ? OR checkin >= ?)',
      [hotel_id, checkin, checkout]
    );
    if (conflito.length)
      return res.status(400).json({ message: 'Hotel já reservado para esse período' });

    const [result] = await pool.execute(
      'INSERT INTO reservas (usuario_id, hotel_id, checkin, checkout, quartos) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, hotel_id, checkin, checkout, quartos]
    );
    res.status(201).json({ message: 'Reserva criada com sucesso', reservaId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar reserva' });
  }
});

/* ── RESERVAS — CANCELAR ───────────────────────────────── */
app.delete('/api/reservas/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM reservas WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.userId]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Reserva não encontrada' });

    await pool.execute('DELETE FROM reservas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cancelar reserva' });
  }
});

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
