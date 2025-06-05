
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Input } from '../ui/Input'; // Assuming Input is in ui

export const CommandBar: React.FC = () => {
  const { executeAdminCommand } = useAppContext();
  const [command, setCommand] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setHistory(prev => [command, ...prev].slice(0, 20)); // Keep last 20 commands
    setHistoryIndex(-1); // Reset history navigation

    const result = await executeAdminCommand(command);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setCommand('');
    }
    // Auto-clear feedback after a few seconds
    setTimeout(() => setFeedback(null), 15000); // Increased duration
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? '' : history[newIndex] || '');
      } else {
        setCommand(''); // Clear if at the end of history (or no history)
      }
    }
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border p-3 shadow-lg z-50">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <span className="text-gray-400 font-mono text-sm hidden sm:inline">{'>'}</span>
        <Input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter admin command (e.g., /ban User123 reason)... Type /help for commands."
          className="flex-grow !bg-black !border-gray-700 focus:!border-brand-primary command-bar-input text-sm"
          wrapperClassName="flex-grow"
          aria-label="Admin Command Input"
        />
        <button type="submit" className="px-4 py-1.5 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-surface">
          Execute
        </button>
      </form>
      {feedback && (
        <p className={`mt-1.5 text-xs ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'} whitespace-pre-line`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};