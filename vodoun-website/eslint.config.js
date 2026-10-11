import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'app.js', 'server/**', 'scripts/**', 'public/api/**']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['app.js', 'server/**', 'scripts/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Ces règles sont trop strictes pour Three.js / canvas / GSAP :
      // Math.random() dans useMemo est parfaitement valide (seed de particules)
      // setState dans useEffect est un pattern courant et intentionnel ici
      // La mutation de buffers Three.js dans useFrame est le pattern standard R3F
      'react-hooks/purity':             'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs':                'off',
      'react-hooks/immutability':        'off',
    },
  },
])
