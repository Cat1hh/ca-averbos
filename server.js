
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'caca_verbos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '200kb' }));
app.use('/api/auth/', authLimiter);

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

app.get('/api/health', async (_req, res) => {
  try {
    await dbPool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Banco indisponivel.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = sanitizeName(req.body.name);
    const email = normalizeEmail(req.body.email);
    const birthDate = req.body.birthDate ? String(req.body.birthDate) : null;
    const password = String(req.body.password || '');
    const avatar = String(req.body.avatar || '🦊').slice(0, 20);
    const profileColor = String(req.body.profileColor || '#f5a623').slice(0, 20);

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Nome invalido.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'E-mail invalido.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'A senha deve ter no minimo 8 caracteres.' });
    }

    const [existing] = await dbPool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ message: 'E-mail ja cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await dbPool.execute(
      `INSERT INTO users (name, email, birth_date, password_hash, avatar, profile_color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, birthDate, passwordHash, avatar, profileColor]
    );

    return res.status(201).json({ message: 'Cadastro realizado com sucesso.' });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Erro interno no cadastro.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!isValidEmail(email) || password.length === 0) {
      return res.status(400).json({ message: 'Credenciais invalidas.' });
    }

    const [rows] = await dbPool.execute(
      `SELECT id, name, email, password_hash, avatar, profile_color, failed_attempts, lock_until
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    const user = Array.isArray(rows) ? rows[0] : null;

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
    }

    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(423).json({ message: 'Conta temporariamente bloqueada. Tente mais tarde.' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      const failedAttempts = Number(user.failed_attempts || 0) + 1;
      const lockUntil = failedAttempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;

      await dbPool.execute(
        'UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?',
        [failedAttempts >= 5 ? 0 : failedAttempts, lockUntil, user.id]
      );

      return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
    }

    await dbPool.execute(
      'UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?',
      [user.id]
    );

    const token = createAccessToken(user);

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profileColor: user.profile_color,
      },
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'E-mail invalido.' });
    }

    const [rows] = await dbPool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = Array.isArray(rows) ? rows[0] : null;

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await dbPool.execute(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [user.id, tokenHash, expiresAt]
      );

      console.log('Password reset token (dev only):', rawToken);
    }

    return res.json({
      message: 'Se o e-mail existir, as instrucoes de recuperacao foram geradas.'
    });
  } catch (error) {
    console.error('forgot-password error', error);
    return res.status(500).json({ message: 'Erro interno na recuperacao de senha.' });
  }
});
app.get('/api/ranking', async (req, res) => {
  try {
    // Ranking por soma total de pontos em todos os níveis
    const [rows] = await dbPool.execute(`
      SELECT u.id, u.name, u.avatar, SUM(s.points) as total_points, MAX(s.level) as max_level, SUM(COALESCE(s.verbs_completed, 0)) as total_verbs
      FROM users u
      JOIN scores s ON u.id = s.user_id
      GROUP BY u.id, u.name, u.avatar
      ORDER BY total_points DESC, total_verbs DESC, max_level DESC, u.name ASC
      LIMIT 50
    `);
    res.json({ ranking: rows });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking.' });
  }
});

// Obter streak do usuário
app.get('/api/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await dbPool.execute(
      'SELECT current_streak, longest_streak, last_played_date FROM streaks WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ current_streak: 0, longest_streak: 0, last_played_date: null });
    }
  } catch (error) {
    console.error('Erro ao buscar streak:', error);
    res.status(500).json({ message: 'Erro ao buscar streak.' });
  }
});

// Atualizar streak do usuário
app.post('/api/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const today = new Date().toISOString().split('T')[0];
    
    // Verifica se usuário já tem streak registrado
    const [existing] = await dbPool.execute(
      'SELECT current_streak, longest_streak, last_played_date FROM streaks WHERE user_id = ? LIMIT 1',
      [userId]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      const streak = existing[0];
      const lastDate = streak.last_played_date ? new Date(streak.last_played_date).toISOString().split('T')[0] : null;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = streak.current_streak;
      if (lastDate !== today) {
        if (lastDate === yesterday) {
          newStreak = streak.current_streak + 1;
        } else {
          newStreak = 1;
        }
      }
      
      const newLongestStreak = Math.max(newStreak, streak.longest_streak);
      
      await dbPool.execute(
        'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_played_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newStreak, newLongestStreak, today, userId]
      );
      
      res.json({ current_streak: newStreak, longest_streak: newLongestStreak, last_played_date: today });
    } else {
      // Cria novo registro de streak
      await dbPool.execute(
        'INSERT INTO streaks (user_id, current_streak, longest_streak, last_played_date) VALUES (?, 1, 1, ?)',
        [userId, today]
      );
      
      res.json({ current_streak: 1, longest_streak: 1, last_played_date: today });
    }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error);
    res.status(500).json({ message: 'Erro ao atualizar streak.' });
  }
});

// Obter nível máximo do usuário
app.get('/api/user/level', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await dbPool.execute(
      'SELECT MAX(level) as max_level FROM scores WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const maxLevel = rows[0].max_level || 1;
      res.json({ max_level: maxLevel });
    } else {
      res.json({ max_level: 1 });
    }
  } catch (error) {
    console.error('Erro ao buscar nível do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar nível.' });
  }
});

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = user;
    next();
  });
}

// Salvar pontuação ao completar nível
app.post('/api/score', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { level, points, verbsCompleted = 0 } = req.body;
    if (!Number.isInteger(level) || !Number.isInteger(points)) {
      return res.status(400).json({ message: 'Dados inválidos.' });
    }
    const safeVerbsCompleted = Number.isInteger(verbsCompleted) && verbsCompleted >= 0 ? verbsCompleted : 0;
    // Verifica se já existe score para esse user e level
    const [existing] = await dbPool.execute(
      'SELECT id FROM scores WHERE user_id = ? AND level = ? LIMIT 1',
      [userId, level]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      // Atualiza se já existe
      await dbPool.execute(
        'UPDATE scores SET points = ?, verbs_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND level = ?',
        [points, safeVerbsCompleted, userId, level]
      );
    } else {
      // Insere novo score
      await dbPool.execute(
        'INSERT INTO scores (user_id, points, level, verbs_completed) VALUES (?, ?, ?, ?)',
        [userId, points, level, safeVerbsCompleted]
      );
    }
    return res.json({ message: 'Pontuação salva com sucesso.' });
  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
    return res.status(500).json({ message: 'Erro ao salvar pontuação.' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Função para verificar token optionally
function verifyTokenOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

// Serve HTML pages from public/html directory
app.get('/', verifyTokenOptional, (_req, res) => {
  if (_req.user) {
    // Usuário autenticado - vai para menu
    res.redirect('/menu');
  } else {
    // Usuário não autenticado - vai para login
    res.redirect('/login');
  }
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/index.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/cadastro', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'cadastro.html'));
});

app.get('/cadastro.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'cadastro.html'));
});

app.get('/menu', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'menu.html'));
});

app.get('/menu.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'menu.html'));
});

app.get('/fases', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'tela-fases.html'));
});

app.get('/tela-fases.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'tela-fases.html'));
});

// Serve phase pages
app.get('/fases/fase*.html', (req, res) => {
  const filename = req.path.split('/').pop();
  res.sendFile(path.join(__dirname, 'public', 'html', 'fases', filename));
});

// Serve phase assets (CSS, JS, images)
app.use('/fases/css', express.static(path.join(__dirname, 'public', 'html', 'fases', 'css')));
app.use('/fases/js', express.static(path.join(__dirname, 'public', 'html', 'fases', 'js')));
app.use('/fases', express.static(path.join(__dirname, 'public', 'html', 'fases')));

// Catch-all for SPA routing - only as fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

async function ensureScoresVerbsColumn() {
  try {
    const [rows] = await dbPool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'scores' AND COLUMN_NAME = 'verbs_completed' LIMIT 1"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await dbPool.execute('ALTER TABLE scores ADD COLUMN verbs_completed INT NOT NULL DEFAULT 0 AFTER points');
    }
  } catch (error) {
    console.error('Erro ao garantir coluna verbs_completed:', error);
  }
}

ensureScoresVerbsColumn().finally(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
  });
});
