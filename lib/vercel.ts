import { v4 as uuidv4 } from 'uuid'

export const deployToVercel = async (siteCode: string, projectName: string): Promise<string> => {
  try {
    console.log('=== Vercel Deployment Debug ===')
    console.log('Project Name:', projectName)
    console.log('Site Code Length:', siteCode.length)
    console.log('Site Code Preview (first 300 chars):', siteCode.substring(0, 300) + '...')
    console.log('Site Code Preview (last 200 chars):', '...' + siteCode.substring(siteCode.length - 200))
    
    // Clean up the generated code to remove markdown/code block delimiters
    const cleanedSiteCode = siteCode
      .replace(/```[a-z]*\n?/g, '') // Remove code block delimiters like ```ts or ```jsx
      .replace(/```/g, '')           // Remove any remaining backticks
      .trim();

    // Create the file structure for deployment using Pages Router (not App Router)
    const files = {
      'package.json': JSON.stringify({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          // Essential Next.js dependencies
          'next': '^14.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          
          // TypeScript dependencies
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          'typescript': '^5.0.0',
          
          // Styling dependencies
          'tailwindcss': '^3.3.0',
          'autoprefixer': '^10.0.1',
          'postcss': '^8.0.0',
          
          // Additional utility dependencies that might be needed
          'clsx': '^2.0.0',
          'class-variance-authority': '^0.7.0'
        }
      }, null, 2),
      
      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No 'output: export'!
};
module.exports = nextConfig;`,
      
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      
      'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true,
          skipLibCheck: true,
          strict: false, // More lenient for generated code
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
      }, null, 2),
      
      // Use Pages Router structure instead of App Router
      'styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles can go here */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`,
      
      'pages/_app.tsx': `import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}`,
      
      // Main page using Pages Router
      [`pages/agents/${projectName.replace(/[^a-zA-Z0-9_-]/g, '')}.tsx`]: cleanedSiteCode,
      
      // Add a simple API route to prevent build issues
      'pages/api/health.ts': `import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}`,
      
      // Add necessary Next.js files
      'next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/pages/building-your-application/configuring/typescript for more information.`,
      
      // Add a simple .gitignore
      '.gitignore': `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts`,
    }

    // Deploy to Vercel with proper configuration
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
          buildCommand: 'npm run build',
          devCommand: 'npm run dev',
          installCommand: 'npm install',
          outputDirectory: '.next',
        },
        target: 'production',
        // Add build environment variables if needed
        env: {
          NODE_ENV: 'production'
        }
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