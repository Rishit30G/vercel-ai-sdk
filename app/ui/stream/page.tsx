'use client';

import {useCompletion} from "@ai-sdk/react"

export default function CompletionPage() {
    const {input, handleInputChange, handleSubmit, completion, isLoading, error, stop} = useCompletion({
        api: "/api/stream"
    })
  return (
    <div className="min-h-screen flex flex-col">
        {error && <div className="text-red-500 mb-4"> {error.message} </div>}
        {isLoading && !completion && <div>Loading...</div>}
        {completion && <div>{completion}</div>}
      <form onSubmit={handleSubmit} className="fixed bottom-10 left-0 right-0">
        <div className="flex justify-center items-baseline gap-2">
          <input
            placeholder="How can I help you ?"
            className="border-2 border-gray-600 rounded-xl pr-20 pt-4 pb-4 pl-1"
            value={input}
            onChange={handleInputChange}
          />

          {isLoading ? <button onClick={stop} className="bg-red-500 py-2 px-4 rounded-xl">Stop</button> : 
          <button
            type="submit"
            className="bg-blue-500 py-2 px-4 rounded-xl"
            disabled={isLoading}
          >
            Send
          </button>
}
        </div>
      </form>
    </div>
  );
}
