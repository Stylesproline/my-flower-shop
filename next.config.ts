/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Игнорировать ошибки типов при сборке (для быстрого запуска)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорировать ошибки линтера
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

