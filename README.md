# Agent Builder

A web application that allows users to describe AI agents and automatically generates custom web interfaces for them using NeuralSeek, OpenAI, and Vercel.

## Features

- **Agent Creation**: Describe your AI agent and let NeuralSeek's "Create-agent" build it
- **Dynamic UI Generation**: OpenAI GPT-4 generates custom Next.js interfaces based on agent specifications
- **Instant Deployment**: Automatically deploys to Vercel with a unique URL
- **Project Tracking**: Stores project data in Supabase for future reference
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Services**: NeuralSeek API, OpenAI GPT-4
- **Deployment**: Vercel
- **Database**: Supabase
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account with API token
- Supabase account with database
- NeuralSeek account with API key
- OpenAI API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# NeuralSeek Configuration
NEURALSEEK_API_KEY=your_neuralseek_api_key_here
NEURALSEEK_INSTANCE=your_neuralseek_instance_name

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agent-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

Create a `projects` table in your Supabase database with the following schema:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  agent_json JSONB NOT NULL,
  vercel_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

1. **Describe Your Agent**: Enter a detailed description of what you want your AI agent to do
2. **Build**: Click "Build Now" to start the agent creation process
3. **Wait**: The system will:
   - Create the agent using NeuralSeek
   - Generate a custom UI using OpenAI
   - Deploy to Vercel
   - Store the project data
4. **Access**: Get a unique URL to your deployed agent interface

## API Endpoints

### POST /api/create-agent

Creates a new agent and deploys it to Vercel.

**Request Body:**
```json
{
  "description": "A customer support agent that helps with product inquiries",
  "projectName": "Customer Support Agent"
}
```

**Response:**
```json
{
  "success": true,
  "deploymentUrl": "https://your-agent.vercel.app",
  "agentJson": { /* agent configuration */ },
  "agentName": "Customer Support Agent",
  "improvedPrompt": "Enhanced description...",
  "projectId": "uuid-here"
}
```

## Project Structure

```
agent-builder/
├── lib/
│   ├── neuralseek.ts    # NeuralSeek API integration
│   ├── openai.ts        # OpenAI API integration
│   ├── vercel.ts        # Vercel deployment
│   └── supabase.ts      # Supabase client and utilities
├── pages/
│   ├── api/
│   │   └── create-agent.ts  # API route for agent creation
│   ├── _app.tsx         # App wrapper
│   └── index.tsx        # Home page
├── styles/
│   └── globals.css      # Global styles with Tailwind
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

The application can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 