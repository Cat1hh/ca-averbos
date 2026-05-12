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
  const [rows] = await conn.query('SELECT email, current_phase FROM users ORDER BY created_at DESC LIMIT 5');
  console.log('Últimos 5 usuários:');
  rows.forEach((u, i) => {
    console.log(`  ${i+1}. ${u.email} => phase ${u.current_phase}`);
  });
  await conn.release();
  process.exit(0);
})();
