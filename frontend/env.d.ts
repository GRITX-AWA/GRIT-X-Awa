/// <reference path="./.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}