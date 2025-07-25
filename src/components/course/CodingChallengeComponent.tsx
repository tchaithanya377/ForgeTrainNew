import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import {
  LightBulbIcon,
  TagIcon,
  FireIcon,
  TrophyIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  UserIcon,
  CalendarIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category_id?: string;
  tags: string[];
  company_tags: string[];
  supported_languages: string[];
  starter_code: Record<string, any>;
  solution_code: Record<string, any>;
  test_cases: any[];
  constraints: string;
  hints: string[];
  time_complexity: string;
  space_complexity: string;
  acceptance_rate: number;
  total_submissions: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  step_by_step_solution?: string;
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

export function CodingChallengeComponent({ challenge }: { challenge: Challenge }) {
  const [showHints, setShowHints] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(challenge.supported_languages[0] || 'javascript');

  // Copy starter code
  const handleCopy = () => {
    navigator.clipboard.writeText(challenge.starter_code?.[selectedLanguage] || '');
  };

  // Helper for stepper in solution
  const solutionSteps = challenge.step_by_step_solution
    ? challenge.step_by_step_solution.split(/\n\s*\n/).filter(Boolean)
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: Problem Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mr-2">{challenge.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${difficultyStyles[challenge.difficulty.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}</span>
            {challenge.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-200"><TagIcon className="h-4 w-4" />{tag}</span>
            ))}
            {challenge.company_tags.map(company => (
              <span key={company} className="flex items-center gap-1 text-xs border border-indigo-300 text-indigo-700 px-2 py-1 rounded-full font-medium bg-white"><CheckCircleIcon className="h-4 w-4" />{company}</span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><DocumentTextIcon className="h-5 w-5" />Description</h2>
            <div className="text-gray-900 text-base whitespace-pre-line leading-relaxed mb-4">{challenge.description}</div>
            <div className="flex flex-wrap gap-4 mb-2">
              {challenge.constraints && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1 min-w-[180px]">
                  <h4 className="font-semibold text-blue-800 mb-2">Constraints</h4>
                  <p className="text-blue-700 text-sm whitespace-pre-line">{challenge.constraints}</p>
                </div>
              )}
              {(challenge.time_complexity || challenge.space_complexity) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-1 min-w-[180px]">
                  <h4 className="font-semibold text-gray-900 mb-2">Complexity</h4>
                  {challenge.time_complexity && <p className="text-xs text-gray-700 mb-1">Time: {challenge.time_complexity}</p>}
                  {challenge.space_complexity && <p className="text-xs text-gray-700">Space: {challenge.space_complexity}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Examples */}
          {challenge.test_cases && challenge.test_cases.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><CodeBracketIcon className="h-5 w-5" />Examples</h2>
              <div className="space-y-4">
                {challenge.test_cases.slice(0, 3).map((test, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-700 mb-1">Example {idx + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">Input:</span>
                        <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(test.input, null, 2)}</pre>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Output:</span>
                        <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(test.expected_output, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><LightBulbIcon className="h-5 w-5 text-yellow-500" />Hints</h2>
                <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)}>{showHints ? 'Hide' : 'Show'} Hints</Button>
              </div>
              {showHints && (
                <ul className="list-disc ml-8 space-y-2">
                  {challenge.hints.map((hint, idx) => (
                    <li key={idx} className="text-yellow-900 text-sm">{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step-by-Step Solution */}
          {solutionSteps.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><LightBulbIcon className="h-5 w-5 text-blue-500" />Step-by-Step Solution</h2>
                <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)}>{showSolution ? 'Hide' : 'Show'} Solution</Button>
              </div>
              {showSolution && (
                <ol className="list-decimal ml-8 space-y-2">
                  {solutionSteps.map((step, idx) => (
                    <li key={idx} className="text-blue-900 text-sm whitespace-pre-line">{step}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Sticky Code & Metadata */}
        <div className="w-full lg:w-[420px] flex-shrink-0 lg:sticky lg:top-8 h-fit">
          {/* Starter Code Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold flex items-center gap-2"><CodeBracketIcon className="h-5 w-5" />Starter Code</h2>
              <div className="flex gap-2 items-center">
                <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                  {challenge.supported_languages.map(lang => (
                    <button
                      key={lang}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${selectedLanguage === lang ? 'bg-gradient-to-r from-[#0c5a66] to-[#f1872c] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copy starter code">
                  <ClipboardIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <pre className="w-full min-h-40 max-h-80 overflow-x-auto overflow-y-auto p-4 bg-gray-900 text-green-200 rounded-xl font-mono text-sm border border-gray-800 whitespace-pre mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {challenge.starter_code?.[selectedLanguage] || '// No starter code available for this language.'}
            </pre>
          </div>

          {/* Metadata Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 text-xs text-gray-600">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="flex items-center gap-1"><TrophyIcon className="h-4 w-4" />{challenge.acceptance_rate}% Acceptance</span>
              <span className="flex items-center gap-1"><FireIcon className="h-4 w-4" />{(challenge.total_submissions/1000).toFixed(1)}K Submissions</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" />{new Date(challenge.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><UserIcon className="h-4 w-4" />{challenge.created_by}</span>
              <span className="flex items-center gap-1">Cat: {challenge.category_id}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" />Updated: {new Date(challenge.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}