'use client';

import { useState } from 'react';

export default function CompletionPage() {
  const [prompt, setPrompt] = useState('');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setPrompt('');

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setCompletion(data.text);
    } catch (error) {
      console.log('Error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong, please try again later',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : completion ? (
        <div className="whitespace-pre-wrap">{completion}</div>
      ) : null}

      <form onSubmit={complete} className="fixed bottom-10 left-0 right-0">
        <div className="flex justify-center items-baseline gap-2">
          <input
            placeholder="How can I help you ?"
            className="border-2 border-gray-600 rounded-xl pr-20 pt-4 pb-4 pl-1"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 py-2 px-4 rounded-xl"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
