# AI-Powered Notes App

A Next.js application that allows users to create, edit, and manage notes with AI-powered summarization capabilities.

## Features

- **User Authentication**: Sign up and login with email/password or Google
- **Note Management**: Create, edit, and delete notes
- **AI Summarization**: Generate concise summaries of your notes
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase for authentication and data storage
- **State Management**: React Query for server state management
- **AI Integration**: DeepSeek/Groq API for text summarization

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (Package Manager)
- Supabase account
- DeepSeek API key or Groq API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-notes-app.git
   cd ai-notes-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   # Or use GROQ_API_KEY instead
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Setup

1. Create a new project in Supabase
2. Run the SQL script in the Supabase SQL editor to create the necessary tables and policies:
   ```sql
   CREATE TABLE notes (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     summary TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
   );

   -- Set up row-level security
   ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to only see their own notes
   CREATE POLICY "Users can only see their own notes" ON notes
     FOR SELECT USING (auth.uid() = user_id);

   -- Create policy for users to insert their own notes
   CREATE POLICY "Users can insert their own notes" ON notes
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Create policy for users to update their own notes
   CREATE POLICY "Users can update their own notes" ON notes
     FOR UPDATE USING (auth.uid() = user_id);

   -- Create policy for users to delete their own notes
   CREATE POLICY "Users can delete their own notes" ON notes
     FOR DELETE USING (auth.uid() = user_id);
   ```

## Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel's dashboard
4. Deploy!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── summarize/      # AI summarization endpoint
│   ├── auth/               # Authentication routes
│   │   ├── callback/       # OAuth callback handler
│   │   └── signout/        # Sign out handler
│   ├── dashboard/          # Dashboard pages
│   │   ├── edit/[id]/      # Edit note page
│   │   └── new/            # New note page
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/             # React components
│   ├── auth/               # Authentication components
│   └── ui/                 # UI components (Shadcn)
├── lib/                    # Utility functions
│   └── supabase.ts         # Supabase client
├── providers/              # React context providers
├── public/                 # Static assets
├── styles/                 # Global styles
├── middleware.ts           # Next.js middleware
└── package.json            # Project dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
