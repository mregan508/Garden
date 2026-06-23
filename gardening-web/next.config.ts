import type { NextConfig } from 'next';
import path from 'path';

const basePath = '/garden';

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  transpilePackages: ['@gardening/shared'],
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
