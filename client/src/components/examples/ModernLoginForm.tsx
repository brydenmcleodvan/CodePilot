/**
 * Modern Login Form Example
 * Demonstrates using the new auth service directly
 */

import { useState } from 'react';
import { useAuthService } from '@/hooks/use-auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

export function ModernLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Use our new auth service hook
  const { login, loginMutation } = useAuthService();
  const isPending = loginMutation.isPending;
  
  const [, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use the login helper from the hook
      await login({ 
        username, 
        password,
        rememberMe
      });
      
      // Navigate after successful login
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the hook via toast notifications
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
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
          Remember me
        </Label>
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