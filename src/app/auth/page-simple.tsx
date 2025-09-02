'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!loginForm.email || !loginForm.password) {
      setAlert({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setAlert({ type: 'error', message: result.message || 'Login failed. Please try again.' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.name) {
      setAlert({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (registerForm.password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    const result = await register(registerForm.email, registerForm.password, registerForm.name);
    
    if (result.success) {
      setAlert({ 
        type: 'success', 
        message: 'Registration successful! Please wait for admin approval to access your account.' 
      });
      // Clear form
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      });
    } else {
      setAlert({ type: 'error', message: result.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="text-gray-600 mt-2">Sign in to your dashboard</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-center space-x-1 mb-4">
              <button
                onClick={() => setIsLoginMode(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isLoginMode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Sign In
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !isLoginMode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Register
              </button>
            </div>
            <CardTitle>{isLoginMode ? 'Sign In' : 'Register'}</CardTitle>
            <CardDescription>
              {isLoginMode 
                ? 'Enter your credentials to access your dashboard' 
                : 'Create a new account to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoginMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                {alert && (
                  <div className={`p-4 rounded-lg ${
                    alert.type === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-800' 
                      : alert.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-blue-50 border border-blue-200 text-blue-800'
                  }`}>
                    {alert.message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                {alert && (
                  <div className={`p-4 rounded-lg ${
                    alert.type === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-800' 
                      : alert.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-blue-50 border border-blue-200 text-blue-800'
                  }`}>
                    {alert.message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2024 Dashboard Application. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
