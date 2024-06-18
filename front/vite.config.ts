import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {find: "components", replacement: "/src/components"},
      {find: "pages", replacement: "/src/pages"},
      {find: "hooks", replacement: "/src/hooks"},
      {find: "constant", replacement: "/src/constant"},
      {find: "firebaseApp", replacement: "/src/firebaseApp"},
      {find: "context", replacement: "/src/context"},
      {find: "atom", replacement: "/src/atom"}
    ]
  }
})
