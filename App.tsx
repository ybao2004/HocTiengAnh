
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { processTestImages } from './services/geminiService';
import type { TestResult } from './types';
import { LogoIcon, SparklesIcon } from './components/icons';

// FIX: Removed conflicting global declaration for window.aistudio.
// The type is assumed to be provided by the environment.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } catch (e) {
            console.error("Could not check for API key:", e);
            setApiKeySelected(false);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    setError(null);
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race conditions and immediately show the app UI.
        setApiKeySelected(true);
      } catch (e) {
        console.error("Error opening select key dialog:", e);
        setError("Could not open the API key selection dialog. Please try again.");
      }
    }
  };

  // FIX: Added handleFilesSelected callback to receive files from the FileUpload component.
  const handleFilesSelected = useCallback((files: File[]) => {
    setImages(files);
  }, []);

  const handleProcessClick = useCallback(async () => {
    if (images.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await processTestImages(images);
      setResult(response);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred. Please check the console.";
      
      // Check for specific API key related errors
      if (errorMessage.includes("API_KEY environment variable is not set") || errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key not valid")) {
        setError("Your API key appears to be invalid or missing. Please select a valid API key to proceed.");
        setApiKeySelected(false); // Go back to key selection screen
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [images]);

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl">
          <LogoIcon className="h-16 w-16 text-primary-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Syntax Test Solver</h1>
          <p className="text-gray-400 mb-8">
            To get started, please select a Google AI API key. This is required to analyze the test papers using the Gemini model.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors duration-200 transform hover:scale-105"
          >
            Select API Key
          </button>
          <p className="text-xs text-gray-500 mt-6">
            For information about billing, visit{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-400">
              ai.google.dev/gemini-api/docs/billing
            </a>.
          </p>
           {error && (
            <div className="mt-6 w-full bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-left" role="alert">
                <strong className="font-bold">An error occurred:</strong>
                <span className="block mt-1">{error}</span>
            </div>
           )}
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <LogoIcon className="h-12 w-12 text-primary-400" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Syntax Test Solver
          </h1>
        </div>
        <p className="text-lg text-gray-400">
          Upload your English test papers, and let AI extract, translate, and solve them for you.
        </p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <FileUpload onFilesSelected={handleFilesSelected} />
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleProcessClick}
              disabled={isLoading || images.length === 0}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Analyze Test
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {result && (
          <div className="w-full mt-4">
            <ResultDisplay result={result} />
          </div>
        )}
      </main>

       <footer className="w-full max-w-4xl mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini. For educational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;