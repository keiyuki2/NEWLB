

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Alert } from '../ui/Alert';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void; // New prop
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const { loginUser } = useAppContext();
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Pass email to loginUser
      const result = await loginUser({ email, password }); 
      if (result.success) {
        onClose(); // Close modal on successful login
        setEmail('');
        setPassword('');
      } else {
        setError(result.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form on close
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setIsLoading(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Login to Your Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
        <Input
          id="login-email" // Changed id
          label="Email" // Changed label
          type="email" // Changed type to email
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" // Changed placeholder
          required
          autoFocus
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400">
          Don't have an account? <Button variant="ghost" size="xs" type="button" onClick={onSwitchToSignUp} className="inline p-0 text-brand-primary hover:underline">Sign Up</Button>
        </p>
      </form>
    </Modal>
  );
};