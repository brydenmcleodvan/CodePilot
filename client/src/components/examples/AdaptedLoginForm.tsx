/**
 * Adapted Login Form Example
 * Demonstrates using the auth adapter for backward compatibility
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth-with-adapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

export function AdaptedLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Use the adapted auth hook
  // This looks like the original but uses the new service behind the scenes
  const auth = useAuth();
  const isPending = auth.loginMutation.isPending;
  
  const [, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // This calls the adapter which routes to the new service
      await auth.login({ 
        username, 
        password
      });
      
      // Navigate after successful login
      navigate('/dashboard');
    } catch (error) {
      // Error handling as in the original code
      console.error('Login error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isPending}
          placeholder="Enter your username"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
          placeholder="Enter your password"
          className="w-full"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}