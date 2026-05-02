import app from './app';
import { env } from './config/env';
import { pool } from './config/database';
import fs from 'fs';

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✓ Database connected');

    if (!fs.existsSync(env.uploadDir)) {
      fs.mkdirSync(env.uploadDir, { recursive: true, mode: 0o750 });
    }

    app.listen(env.port, () => {
      console.log(`✓ PronA Analyzer server running on port ${env.port}`);
      console.log(`  Environment: ${env.nodeEnv}`);
      console.log(`  AI analysis: ${env.anthropicApiKey ? 'Claude AI enabled' : 'Mock mode (set ANTHROPIC_API_KEY to enable AI)'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing gracefully...');
  await pool.end();
  process.exit(0);
});

start();
