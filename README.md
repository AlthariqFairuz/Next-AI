# NEXT AI

A document retrieval augmented generation (RAG) system that allows users to upload PDFs and chat with their documents using various AI models.

![image](https://github.com/user-attachments/assets/92694fcf-47c9-46aa-b690-f1deca8b5f5c)


## Features

- **Document Management**: Upload, store, and manage PDF documents
- **AI-Powered Chat**: Ask questions about your documents in natural language
- **Multiple AI Models**: Choose between DeepSeek-R1, Llama 4 Scout, and Mistral Small
- **Secure Authentication**: User accounts with Supabase authentication
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes, Supabase
- **AI & Embeddings**: OpenRouter, Cohere, Langchain
- **Vector Database**: Pinecone
- **Storage**: Supabase Storage

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Pinecone account
- Cohere API key
- OpenRouter API key

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/next-ai.git
   cd next-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_ROLE_KEY=your_supabase_service_role_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   COHERE_API_KEY=your_cohere_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```

4. Set up Supabase database with the required tables:
   - documents
   - document_metadata
   - chat_history

5. Create a Pinecone index named 'sample-movies'

6. Run the development server
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── ui/              # UI components (shadcn)
│   ├── ChatInterface.tsx
│   ├── FileUpload.tsx
│   └── ...
├── context/             # React context
│   └── AuthContext.tsx
├── lib/                 # Utility functions
│   ├── ragservice.ts    # RAG service
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
└── middleware.ts        # Next.js middleware
```

## Usage

1. Register for an account or log in
2. Upload PDF documents from the dashboard
3. Select your preferred AI model
4. Start chatting with your documents
5. View document list and manage your content

## License

MIT
