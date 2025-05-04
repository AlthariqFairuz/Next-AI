export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  message: string; 
  sources?: string[];
  created_at?: string;
  isTyping?: boolean;
}