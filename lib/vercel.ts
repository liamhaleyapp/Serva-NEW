import { v4 as uuidv4 } from 'uuid'

export const deployToVercel = async (siteCode: string, projectName: string): Promise<string> => {
  try {
    const projectId = `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create the file structure for deployment
    const files = {
      'package.json': JSON.stringify({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          typescript: '^5.0.0',
          tailwindcss: '^3.3.0',
          autoprefixer: '^10.0.1',
          postcss: '^8.0.0',
        },
      }, null, 2),
      'next.config.js': `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
      `,
      'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
      `,
      'postcss.config.js': `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
      `,
      'app/globals.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;
      `,
      'app/layout.tsx': `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
      `,
      'app/page.tsx': siteCode,
    }

    // Deploy to Vercel
    const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        files: Object.entries(files).map(([file, data]) => ({
          file,
          data: typeof data === 'string' ? data : Buffer.from(data).toString('base64'),
        })),
        projectSettings: {
          framework: 'nextjs',
        },
      }),
    })

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text()
      throw new Error(`Vercel deployment failed: ${deployResponse.status} - ${errorText}`)
    }

    const deployment = await deployResponse.json()
    
    // Return the deployment URL
    return `https://${deployment.url}`
  } catch (error) {
    console.error('Error deploying to Vercel:', error)
    throw error
  }
} 