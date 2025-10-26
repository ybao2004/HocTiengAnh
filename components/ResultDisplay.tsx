
import React, { useState } from 'react';
import type { TestResult } from '../types';
import { DownloadIcon } from './icons';

interface ResultDisplayProps {
  result: TestResult;
}

type ViewMode = 'english' | 'vietnamese' | 'solution';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('english');

  const generateHtmlForDoc = () => {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${result.title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; }
          h1, h2, h3 { color: #333; }
          .question { margin-bottom: 2em; border-bottom: 1px solid #ccc; padding-bottom: 1em; }
          .section-title { font-weight: bold; margin-top: 1em; }
        </style>
      </head>
      <body>
        <h1>${result.title}</h1>
        <p><strong>Time Allotted:</strong> ${result.timeAllotted}</p>
        <hr/>
    `;

    result.questions.forEach(q => {
      html += `
        <div class="question">
          <h2>Question ${q.questionNumber}</h2>
          
          <p class="section-title">English:</p>
          <p><em>${q.english.prompt}</em></p>
          <p>${q.english.content}</p>

          <p class="section-title">Vietnamese Translation:</p>
          <p><em>${q.vietnamese.prompt}</em></p>
          <p>${q.vietnamese.content}</p>

          <p class="section-title">Solution (English):</p>
          <div>${q.solution.english.replace(/\n/g, '<br/>')}</div>

          <p class="section-title">Solution (Vietnamese):</p>
          <div>${q.solution.vietnamese.replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    });

    html += `</body></html>`;
    return html;
  };

  const handleDownload = () => {
    const htmlContent = generateHtmlForDoc();
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test-review.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const renderContent = (question: TestResult['questions'][0]) => {
    switch (viewMode) {
      case 'english':
        return (
          <>
            <p className="text-gray-400 italic mb-2">{question.english.prompt}</p>
            <p className="text-gray-200 whitespace-pre-wrap">{question.english.content}</p>
          </>
        );
      case 'vietnamese':
        return (
          <>
            <p className="text-gray-400 italic mb-2">{question.vietnamese.prompt}</p>
            <p className="text-gray-200 whitespace-pre-wrap">{question.vietnamese.content}</p>
          </>
        );
      case 'solution':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary-400 mb-2">Solution (English)</h4>
              <div className="text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded-md">{question.solution.english}</div>
            </div>
            <div>
              <h4 className="font-semibold text-primary-400 mb-2">Giải thích (Tiếng Việt)</h4>
              <div className="text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded-md">{question.solution.vietnamese}</div>
            </div>
          </div>
        );
    }
  };

  const TabButton:React.FC<{mode: ViewMode; label: string;}> = ({ mode, label }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        viewMode === mode
          ? 'bg-primary-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-700">
        <div>
            <h2 className="text-2xl font-bold text-white">{result.title}</h2>
            <p className="text-sm text-gray-400">Time Allotted: {result.timeAllotted}</p>
        </div>
        <button
          onClick={handleDownload}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
        >
          <DownloadIcon className="h-5 w-5" />
          Download .doc
        </button>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4">
          <TabButton mode="english" label="English Test" />
          <TabButton mode="vietnamese" label="Bản dịch Tiếng Việt" />
          <TabButton mode="solution" label="Solutions & Guide" />
        </div>
        
        <div className="space-y-8">
          {result.questions.sort((a, b) => a.questionNumber - b.questionNumber).map((question) => (
            <div key={question.questionNumber} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-primary-300 mb-4">
                Question {question.questionNumber}
              </h3>
              {renderContent(question)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
