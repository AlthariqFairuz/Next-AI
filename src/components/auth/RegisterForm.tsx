// src/components/auth/RegisterForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"

const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      toast("Success",{
        description: "Account created successfully"
      });
      onSuccess();
    } catch (error) {
      toast("Error",{
        description: error instanceof Error ? error.message : 'Failed to create account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  );
};

export default RegisterForm;