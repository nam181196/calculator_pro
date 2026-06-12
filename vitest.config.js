import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Dùng Node environment + tự tạo JSDOM trong test helper
    // để có toàn quyền kiểm soát runScripts: 'dangerously'
    environment: 'node',
    include:     ['tests/unit/**/*.test.js'],
    // Không dùng globals — import rõ ràng từ 'vitest'
    globals:     false,
  },
})
