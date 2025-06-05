
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Alert } from '../ui/Alert';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signUpUser } = useAppContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Added email state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!username || !password) {
        setError("Username and Password are required.");
        return;
    }
     if (robloxId && !robloxId.match(/^\d+$/) ) { // Validate only if robloxId is provided
        setError("Roblox ID must be a number.");
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }


    setIsLoading(true);
    try {
      const result = await signUpUser({ username, email, password, robloxId });
      if (result.success) {
        setSuccess("Account created successfully! You are now logged in.");
        setTimeout(() => {
            handleClose(); 
        }, 2000);
      } else {
        setError(result.message || "Sign up failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred during sign up. Please try again later.");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRobloxId('');
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        
        <Input
          id="signup-username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          autoFocus
          disabled={isLoading || !!success}
        />
        <Input
          id="signup-email"
          label="Email (Optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading || !!success}
        />
        <Input
          id="signup-robloxid"
          label="Roblox User ID (Optional, for avatar)"
          type="text" 
          value={robloxId}
          onChange={(e) => setRobloxId(e.target.value)}
          placeholder="Enter your Roblox User ID"
          disabled={isLoading || !!success}
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
          disabled={isLoading || !!success}
        />
        <Input
          id="signup-confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          disabled={isLoading || !!success}
        />
        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !!success}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400">
          Already have an account? <Button variant="ghost" size="xs" type="button" onClick={onSwitchToLogin} className="inline p-0 text-brand-primary hover:underline">Login</Button>
        </p>
      </form>
    </Modal>
  );
};