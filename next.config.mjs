/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'madbax.org',
                port: '',
                pathname: '/wp-content/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/course-images/**',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors. This is a measure to fix deployment 
      // issues related to memory limits on Vercel.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
};

export default nextConfig;