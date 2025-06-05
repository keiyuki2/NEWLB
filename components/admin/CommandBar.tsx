
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Input } from '../ui/Input'; 
import { Button } from '../ui/Button';

export const CommandBar: React.FC = () => {
  const { executeAdminCommand } = useAppContext();
  const [command, setCommand] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setHistory(prev => [command, ...prev].slice(0, 20)); 
    setHistoryIndex(-1); 

    const result = await executeAdminCommand(command);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setCommand('');
    }
    setTimeout(() => setFeedback(null), 15000); 
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
        setCommand(''); 
      }
    }
  };

  if (isMinimized) {
    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 z-50">
            <Button
            variant="primary"
            size="sm"
            onClick={() => setIsMinimized(false)}
            title="Expand Admin Command Bar"
            className="rounded-full !p-2.5 shadow-lg"
            >
                <i className="fas fa-terminal text-lg"></i>
            </Button>
        </div>
    );
  }


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border p-3 shadow-lg z-50">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-mono">Admin Command Line</span>
        <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsMinimized(true)}
            className="!p-1 text-gray-500 hover:text-gray-200"
            title="Minimize Command Bar"
        >
            <i className="fas fa-compress-arrows-alt"></i>
        </Button>
      </div>
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
        <p className={`mt-1.5 text-xs ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'} whitespace-pre-wrap max-h-32 overflow-y-auto`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};