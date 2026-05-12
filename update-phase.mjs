import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'caca_verbos'
});

(async () => {
  const conn = await pool.getConnection();
  
  // Atualizar o usuário mais recente para current_phase = 2
  const [result] = await conn.query(
    'UPDATE users SET current_phase = 2 WHERE email = ? LIMIT 1',
    ['test-f2-1778527150494@teste.com']
  );
  
  console.log('Updated:', result.affectedRows, 'rows');
  
  // Verificar
  const [rows] = await conn.query(
    'SELECT email, current_phase FROM users WHERE email = ?',
    ['test-f2-1778527150494@teste.com']
  );
  
  if (rows[0]) {
    console.log('User:', rows[0].email, '=> phase', rows[0].current_phase);
  }
  
  await conn.release();
  process.exit(0);
})();
