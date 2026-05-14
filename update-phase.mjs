import db from './db.js';

(async () => {
  // Atualizar o usuário mais recente para current_phase = 2
  const [result] = await db.execute(
    'UPDATE users SET current_phase = 2 WHERE email = ? LIMIT 1',
    ['test-f2-1778527150494@teste.com']
  );
  console.log('Updated:', result.rowCount, 'rows');
  
  // Verificar
  const [rows] = await db.query(
    'SELECT email, current_phase FROM users WHERE email = ?',
    ['test-f2-1778527150494@teste.com']
  );
  
  if (rows[0]) {
    console.log('User:', rows[0].email, '=> phase', rows[0].current_phase);
  }
  
  await db.close();
  process.exit(0);
})();
