
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import dbPool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || 'NOT SET';
    const hasDbUrl = dbUrl !== 'NOT SET';
    
    let dbStatus = 'Not tested';
    try {
      await dbPool.query('SELECT 1');
      dbStatus = 'OK';
    } catch (dbError) {
      dbStatus = `FAILED: ${dbError.message}`;
    }
    
    res.json({ 
      ok: hasDbUrl && dbStatus === 'OK', 
      database_url_configured: hasDbUrl,
      database_status: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      vercel: Boolean(process.env.VERCEL)
    });
  } catch (error) {
    console.error('[HEALTH] Unexpected error:', error);
    res.status(500).json({ ok: false, message: 'Erro ao verificar saúde da API.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    let name = sanitizeName(req.body.name);
    const email = normalizeEmail(req.body.email);
    const birthDate = req.body.birthDate ? String(req.body.birthDate) : null;
    const password = String(req.body.password || '');
    const avatar = String(req.body.avatar || '🦊').slice(0, 20);
    const profileColor = String(req.body.profileColor || '#f5a623').slice(0, 20);

    // Se não houver nome, usar um nome padrão
    if (!name || name.length === 0) {
      name = 'Jogador';
    }

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
      `INSERT INTO users (name, email, birth_date, password_hash, avatar, profile_color, current_phase)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [name, email, birthDate, passwordHash, avatar, profileColor]
    );

    return res.status(201).json({ message: 'Cadastro realizado com sucesso.' });
  } catch (error) {
    console.error('[REGISTER] Erro detalhado:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      hint: error.hint
    });
    const errorMessage = error.code === 'ER_DUP_ENTRY' 
      ? 'E-mail já cadastrado.'
      : error.message?.includes('DATABASE') 
      ? 'Erro de conexão com banco de dados.'
      : 'Erro interno no cadastro.';
    return res.status(500).json({ message: errorMessage });
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
    console.error('[LOGIN] Erro detalhado:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      hint: error.hint
    });
    const errorMessage = error.message?.includes('DATABASE')
      ? 'Erro de conexão com banco de dados.'
      : 'Erro interno no login.';
    return res.status(500).json({ message: errorMessage });
  }
});

// Atualizar perfil do usuário (nome, avatar, cor)
app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, avatar, profileColor } = req.body;

    // Validar dados
    const updates = {};
    if (name !== undefined && typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (avatar !== undefined && typeof avatar === 'string' && avatar.length > 0) {
      updates.avatar = avatar;
    }
    if (profileColor !== undefined && typeof profileColor === 'string' && profileColor.length > 0) {
      updates.profileColor = profileColor;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    // Montar query dinâmica
    const setClause = [];
    const values = [];
    
    if (updates.name) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.avatar) {
      setClause.push('avatar = ?');
      values.push(updates.avatar);
    }
    if (updates.profileColor) {
      setClause.push('profile_color = ?');
      values.push(updates.profileColor);
    }

    values.push(userId);

    await dbPool.execute(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return res.json({ message: 'Perfil atualizado com sucesso.', user: updates });
  } catch (error) {
    console.error('update profile error', error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

// Obter progresso de fases do usuário
app.get('/api/progression', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await dbPool.execute(
      'SELECT current_phase, bonus_lives, chest_claimed_at, achievements FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const achievements = user.achievements ? String(user.achievements).split('|').filter(Boolean) : [];

    return res.json({
      current_phase: Number(user.current_phase ?? 1),
      bonus_lives: Number(user.bonus_lives ?? 0),
      chest_claimed: Boolean(user.chest_claimed_at),
      achievements,
    });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return res.status(500).json({ message: 'Erro ao buscar progresso.' });
  }
});

// Avança o desbloqueio de fase após concluir uma missão
app.post('/api/progression/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const completedLevel = Number(req.body?.completedLevel);

    if (!Number.isInteger(completedLevel) || completedLevel < 1) {
      return res.status(400).json({ message: 'Level inválido.' });
    }

    const [rows] = await dbPool.execute(
      'SELECT current_phase, bonus_lives, chest_claimed_at, achievements FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const currentPhase = Number(user.current_phase ?? 1);
    const nextPhase = completedLevel === 1 ? 2 : completedLevel === 2 ? 3 : currentPhase;
    const updatedPhase = Math.max(currentPhase, nextPhase);

    await dbPool.execute(
      'UPDATE users SET current_phase = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedPhase, userId]
    );

    return res.json({
      current_phase: updatedPhase,
      bonus_lives: Number(user.bonus_lives || 0),
      chest_claimed: Boolean(user.chest_claimed_at),
      achievements: user.achievements ? String(user.achievements).split('|').filter(Boolean) : [],
    });
  } catch (error) {
    console.error('Erro ao avançar progresso:', error);
    return res.status(500).json({ message: 'Erro ao avançar progresso.' });
  }
});

// Abrir o baú da fase 3
app.post('/api/progression/chest/open', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await dbPool.execute(
      'SELECT current_phase, bonus_lives, chest_claimed_at, achievements FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (Number(user.current_phase ?? 1) < 3) {
      return res.status(403).json({ message: 'Baú ainda bloqueado.' });
    }

    if (user.chest_claimed_at) {
      return res.json({
        opened: false,
        bonus_lives: Number(user.bonus_lives || 0),
        achievements: user.achievements ? String(user.achievements).split('|').filter(Boolean) : [],
      });
    }

    const currentBonusLives = Number(user.bonus_lives || 0);
    const newBonusLives = currentBonusLives + 3;
    const achievements = user.achievements ? String(user.achievements).split('|').filter(Boolean) : [];
    if (!achievements.includes('Caçador Iniciante')) {
      achievements.push('Caçador Iniciante');
    }

    await dbPool.execute(
      'UPDATE users SET bonus_lives = ?, chest_claimed_at = CURRENT_TIMESTAMP, achievements = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newBonusLives, achievements.join('|'), userId]
    );

    return res.json({
      opened: true,
      bonus_lives: newBonusLives,
      reward: {
        bonus_lives: 3,
        achievement: 'Caçador Iniciante',
      },
      achievements,
    });
  } catch (error) {
    console.error('Erro ao abrir baú:', error);
    return res.status(500).json({ message: 'Erro ao abrir baú.' });
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
      SELECT 
        u.id, 
        u.name, 
        u.avatar, 
        COALESCE(SUM(s.points), 0) as total_points, 
        COALESCE(MAX(s.level), 0) as max_level, 
        COALESCE(SUM(COALESCE(s.verbs_completed, 0)), 0) as total_verbs
      FROM users u
      LEFT JOIN scores s ON u.id = s.user_id
      GROUP BY u.id, u.name, u.avatar
      HAVING SUM(s.points) > 0 OR SUM(s.points) IS NULL
      ORDER BY COALESCE(SUM(s.points), 0) DESC, COALESCE(SUM(COALESCE(s.verbs_completed, 0)), 0) DESC, COALESCE(MAX(s.level), 0) DESC, u.name ASC
      LIMIT 50
    `);
    
    console.log(`[RANKING] ✅ Retornando ${rows.length} registros do ranking`);
    rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.avatar} ${row.name}: ${row.total_points} pontos (Level ${row.max_level})`);
    });
    res.json({ ranking: rows });
  } catch (error) {
    console.error('[RANKING] Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking.' });
  }
});

// Obter streak do usuário
app.get('/api/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await dbPool.execute(
      'SELECT current_streak, longest_streak, last_played_date, last_played_at FROM streaks WHERE user_id = ? LIMIT 1',
      [userId]
    );

    // Buscar últimos 7 dias de play_logs (se a tabela existir)
    let logs = [];
    try {
      const [logsRows] = await dbPool.execute(
        `SELECT play_date, minutes_played FROM play_logs WHERE user_id = ? AND play_date >= CURRENT_DATE - INTERVAL '6 days' ORDER BY play_date DESC`,
        [userId]
      );
      logs = Array.isArray(logsRows) ? logsRows : [];
    } catch (err) {
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        console.warn('[STREAK] play_logs table missing; skipping play log fetch');
        logs = [];
      } else {
        throw err;
      }
    }

    const streakRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    res.json({
      current_streak: streakRow ? (streakRow.current_streak || 0) : 0,
      longest_streak: streakRow ? (streakRow.longest_streak || 0) : 0,
      last_played_date: streakRow ? streakRow.last_played_date : null,
      last_played_at: streakRow ? streakRow.last_played_at : null,
      play_logs: logs
    });
  } catch (error) {
    console.error('Erro ao buscar streak:', error);
    res.status(500).json({ message: 'Erro ao buscar streak.' });
  }
});

// Atualizar streak do usuário
app.post('/api/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const flawless = req.body?.flawless === true;
    const minutesPlayedRaw = req.body?.minutes_played;
    const minutesPlayed = Number.isFinite(Number(minutesPlayedRaw)) ? Math.max(0, Math.round(Number(minutesPlayedRaw))) : 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Sempre registrar minutos jogados (se fornecidos)
    if (minutesPlayed > 0) {
      try {
        // verificar se já existe log para hoje
        const [existingLog] = await dbPool.execute('SELECT id, minutes_played FROM play_logs WHERE user_id = ? AND play_date = ? LIMIT 1', [userId, today]);
        if (Array.isArray(existingLog) && existingLog.length > 0) {
          const log = existingLog[0];
          const newMinutes = (log.minutes_played || 0) + minutesPlayed;
          await dbPool.execute('UPDATE play_logs SET minutes_played = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newMinutes, log.id]);
        } else {
          await dbPool.execute('INSERT INTO play_logs (user_id, play_date, minutes_played) VALUES (?, ?, ?)', [userId, today, minutesPlayed]);
        }
      } catch (err) {
        if (err && err.code === 'ER_NO_SUCH_TABLE') {
          console.warn('[STREAK] play_logs table missing; skipping play log insert/update');
        } else {
          throw err;
        }
      }
    }

    // Verifica se usuário já tem streak registrado
    const [existing] = await dbPool.execute(
      'SELECT current_streak, longest_streak, last_played_date, last_played_at FROM streaks WHERE user_id = ? LIMIT 1',
      [userId]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      const streak = existing[0];
      const lastPlayedDate = streak.last_played_date || (streak.last_played_at ? new Date(streak.last_played_at).toISOString().split('T')[0] : null);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      let newStreak = streak.current_streak || 0;
      if (flawless) {
        if (lastPlayedDate === today) {
          newStreak = streak.current_streak || 1;
        } else if (lastPlayedDate === yesterdayDate) {
          newStreak = (streak.current_streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      } else {
        // Não alterar streak quando não for flawless
        newStreak = streak.current_streak || 0;
      }
      
      const newLongestStreak = Math.max(newStreak, streak.longest_streak);
      
      await dbPool.execute(
        'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_played_date = ?, last_played_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newStreak, newLongestStreak, today, now, userId]
      );

      // Retornar também os logs atualizados dos últimos 7 dias
      let logs = [];
      try {
        const [logsRows] = await dbPool.execute(
          `SELECT play_date, minutes_played FROM play_logs WHERE user_id = ? AND play_date >= CURRENT_DATE - INTERVAL '6 days' ORDER BY play_date DESC`,
          [userId]
        );
        logs = Array.isArray(logsRows) ? logsRows : [];
      } catch (err) {
        if (err && err.code === 'ER_NO_SUCH_TABLE') {
          console.warn('[STREAK] play_logs table missing; skipping play log fetch');
          logs = [];
        } else {
          throw err;
        }
      }

      res.json({ current_streak: newStreak, longest_streak: newLongestStreak, last_played_date: today, last_played_at: now, updated: lastPlayedDate !== today, play_logs: logs });
    } else {
      // Cria novo registro de streak
      await dbPool.execute(
        'INSERT INTO streaks (user_id, current_streak, longest_streak, last_played_date, last_played_at) VALUES (?, 1, 1, ?, ?)',
        [userId, today, now]
      );

      let logs = [];
      try {
        const [logsRows] = await dbPool.execute(
          `SELECT play_date, minutes_played FROM play_logs WHERE user_id = ? AND play_date >= CURRENT_DATE - INTERVAL '6 days' ORDER BY play_date DESC`,
          [userId]
        );
        logs = Array.isArray(logsRows) ? logsRows : [];
      } catch (err) {
        if (err && err.code === 'ER_NO_SUCH_TABLE') {
          console.warn('[STREAK] play_logs table missing; skipping play log fetch');
          logs = [];
        } else {
          throw err;
        }
      }

      res.json({ current_streak: 1, longest_streak: 1, last_played_date: today, last_played_at: now, updated: true, play_logs: logs });
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

// Verificar se nível já foi completado
app.get('/api/score/:level', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const level = Number(req.params.level);
    
    if (!Number.isInteger(level) || level < 1) {
      return res.status(400).json({ message: 'Level inválido.' });
    }
    
    const [rows] = await dbPool.execute(
      'SELECT points, verbs_completed FROM scores WHERE user_id = ? AND level = ? LIMIT 1',
      [userId, level]
    );
    
    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[SCORE CHECK] Nível ${level} já completado - Points: ${rows[0].points}`);
      res.json({ completed: true, previousPoints: rows[0].points, previousVerbsCompleted: rows[0].verbs_completed });
    } else {
      console.log(`[SCORE CHECK] Nível ${level} é primeira tentativa`);
      res.json({ completed: false });
    }
  } catch (error) {
    console.error('[SCORE CHECK] Erro ao verificar score:', error);
    res.status(500).json({ message: 'Erro ao verificar score.' });
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
    
    console.log(`[SCORE] Recebido: userId=${userId}, level=${level}, points=${points}, verbsCompleted=${verbsCompleted}`);
    
    if (!Number.isInteger(level) || !Number.isInteger(points)) {
      console.error('[SCORE] Dados inválidos:', { level, points });
      return res.status(400).json({ message: 'Dados inválidos. Level e points devem ser números inteiros.' });
    }
    
    const safeVerbsCompleted = Number.isInteger(verbsCompleted) && verbsCompleted >= 0 ? verbsCompleted : 0;
    
    // Verifica se já existe score para esse user e level
    let existing;
    try {
      [existing] = await dbPool.execute(
        'SELECT id, points as previousPoints FROM scores WHERE user_id = ? AND level = ? LIMIT 1',
        [userId, level]
      );
    } catch (queryError) {
      console.error('[SCORE] Falha ao consultar score existente:', queryError);
      return res.status(500).json({ message: `Erro ao consultar score existente: ${queryError.message}` });
    }
    
    let finalPoints = points;
    let isReplay = false;
    
    if (Array.isArray(existing) && existing.length > 0) {
      // É uma repetição - reduz para 50% dos pontos
      isReplay = true;
      finalPoints = Math.floor(points * 0.5);
      console.log(`[SCORE] 🔄 REPETIÇÃO DETECTADA! Reduzindo de ${points} para ${finalPoints} pontos`);
      
      // Acumula os pontos da mesma missão ao total já salvo
      const accumulatedPoints = existing[0].previousPoints + finalPoints;
      console.log(`[SCORE] Atualizando score. Pontos anteriores: ${existing[0].previousPoints}, Novos: ${finalPoints}, Total acumulado: ${accumulatedPoints}`);
      try {
        await dbPool.execute(
          'UPDATE scores SET points = ?, verbs_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND level = ?',
          [accumulatedPoints, safeVerbsCompleted, userId, level]
        );
      } catch (updateError) {
        console.error('[SCORE] Falha ao atualizar score:', updateError);
        return res.status(500).json({ message: `Erro ao atualizar score: ${updateError.message}` });
      }
    } else {
      // Insere novo score
      console.log(`[SCORE] ✅ Primeira vez no nível ${level}`);
      try {
        await dbPool.execute(
          'INSERT INTO scores (user_id, points, level, verbs_completed) VALUES (?, ?, ?, ?)',
          [userId, finalPoints, level, safeVerbsCompleted]
        );
      } catch (insertError) {
        console.error('[SCORE] Falha ao inserir score:', insertError);
        return res.status(500).json({ message: `Erro ao inserir score: ${insertError.message}` });
      }
    }
    
    console.log(`[SCORE] ✅ Sucesso ao salvar score para userId=${userId}, level=${level}`);
    return res.json({ 
      message: 'Pontuação salva com sucesso.',
      isReplay,
      pointsEarned: finalPoints,
      pointsReduction: isReplay ? Math.floor(points * 0.5) : 0,
      totalPoints: isReplay && Array.isArray(existing) && existing.length > 0
        ? existing[0].previousPoints + finalPoints
        : finalPoints
    });
  } catch (error) {
    console.error('[SCORE] ❌ Erro ao salvar pontuação:', error);
    return res.status(500).json({ message: 'Erro ao salvar pontuação. Tente novamente.' });
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

app.get('/verb.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'verb.html'));
});

app.get('/html/verb.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'verb.html'));
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
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'public' AND TABLE_NAME = 'scores' AND COLUMN_NAME = 'verbs_completed' LIMIT 1"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await dbPool.execute('ALTER TABLE scores ADD COLUMN verbs_completed INT NOT NULL DEFAULT 0');
    }
  } catch (error) {
    console.error('Erro ao garantir coluna verbs_completed:', error);
  }
}

async function ensureStreakColumns() {
  try {
    const [rows] = await dbPool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'public' AND TABLE_NAME = 'streaks' AND COLUMN_NAME = 'last_played_at' LIMIT 1"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await dbPool.execute('ALTER TABLE streaks ADD COLUMN last_played_at TIMESTAMP NULL');
      await dbPool.execute('UPDATE streaks SET last_played_at = last_played_date::timestamp WHERE last_played_at IS NULL AND last_played_date IS NOT NULL');
    }
  } catch (error) {
    console.error('Erro ao garantir coluna last_played_at:', error);
  }
}

async function ensureUserProgressColumns() {
  try {
    const checks = [
      { name: 'current_phase', ddl: 'ALTER TABLE users ADD COLUMN current_phase INT NOT NULL DEFAULT 0' },
      { name: 'bonus_lives', ddl: 'ALTER TABLE users ADD COLUMN bonus_lives INT NOT NULL DEFAULT 0' },
      { name: 'chest_claimed_at', ddl: 'ALTER TABLE users ADD COLUMN chest_claimed_at TIMESTAMP NULL' },
      { name: 'achievements', ddl: 'ALTER TABLE users ADD COLUMN achievements TEXT NULL' },
    ];

    for (const column of checks) {
      const [rows] = await dbPool.execute(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = \'public\' AND TABLE_NAME = "users" AND COLUMN_NAME = ? LIMIT 1',
        [column.name]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        await dbPool.execute(column.ddl);
      }
    }
  } catch (error) {
    console.error('Erro ao garantir colunas de progresso do usuário:', error);
  }
}

Promise.all([ensureScoresVerbsColumn(), ensureStreakColumns(), ensureUserProgressColumns()]).finally(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado em http://localhost:${PORT}`);
    });
  }
});

export default app;
