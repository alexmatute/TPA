/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
    { protocol: 'https', hostname: 'futureoffounders.com' },
    { protocol: 'https', hostname: 'i0.wp.com' },
    { protocol: 'https', hostname: 'i1.wp.com' },
    { protocol: 'https', hostname: 'i2.wp.com' },
    { protocol: 'https', hostname: 'secure.gravatar.com' },
    { protocol: 'https', hostname: '0.gravatar.com' },
    { protocol: 'https', hostname: '1.gravatar.com' },
    { protocol: 'https', hostname: '2.gravatar.com' },
    { protocol: 'http', hostname: 'localhost' },

    ],
  },
};

module.exports = nextConfig;
