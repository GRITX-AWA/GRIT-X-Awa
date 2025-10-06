import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: APIRoute = async () => {
  let envFileContent = 'Unable to read';
  try {
    const envPath = join(process.cwd(), '.env');
    envFileContent = readFileSync(envPath, 'utf8')
      .split('\n')
      .map(line => line.startsWith('OPENAI_API_KEY=') ? 'OPENAI_API_KEY=sk-proj-...[REDACTED]' : line)
      .join('\n');
  } catch (e) {
    envFileContent = `Error reading .env: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }

  const envVars = {
    'import.meta.env.OPENAI_API_KEY': import.meta.env.OPENAI_API_KEY ? `Found (${import.meta.env.OPENAI_API_KEY.substring(0, 15)}... length: ${import.meta.env.OPENAI_API_KEY.length})` : 'Not found',
    'import.meta.env keys': Object.keys(import.meta.env).filter(k => !k.startsWith('_')),
    'process.cwd()': process.cwd(),
    '.env file content': envFileContent,
  };

  return new Response(
    JSON.stringify(envVars, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
