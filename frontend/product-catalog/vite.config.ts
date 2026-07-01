mkdir -p frontend/product-catalog
cat > frontend/product-catalog/vite.config.ts <<'TS'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/product-catlog/',
  plugins: [react()],
})
TS
