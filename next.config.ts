/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Это отключит попытки сервера собрать страницу заранее без переменных окружения
  output: 'standalone', 
}

module.exports = nextConfig


