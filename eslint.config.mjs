import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Downgrade rules that fire heavily in third-party template boilerplate.
  // BPA-specific code still follows these via code review; only the template
  // chart data, VectorMap, context, and demo app files trigger these at scale.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler memoization hints — template code uses manual memo; treat as warn
      'react-compiler/react-compiler': 'warn',
    },
  },
]

export default config
