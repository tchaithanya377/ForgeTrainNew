import React, { useState } from 'react';
import { CogIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const aiPersonalities = [
  {
    id: 'default',
    name: 'Default Assistant',
    description: 'Helpful and informative responses',
    icon: '🤖'
  },
  {
    id: 'teacher',
    name: 'Educational Tutor',
    description: 'Focused on teaching and explaining concepts',
    icon: '📚'
  },
  {
    id: 'programmer',
    name: 'Code Expert',
    description: 'Specialized in programming and technical topics',
    icon: '💻'
  },
  {
    id: 'creative',
    name: 'Creative Partner',
    description: 'Great for brainstorming and creative tasks',
    icon: '🎨'
  }
];

export const ChatSettings: React.FC<ChatSettingsProps> = ({ isOpen, onClose }) => {
  const [selectedPersonality, setSelectedPersonality] = useState('default');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Chat Settings
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Personality
                </label>
                <div className="space-y-2">
                  {aiPersonalities.map((personality) => (
                    <label
                      key={personality.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPersonality === personality.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="personality"
                        value={personality.id}
                        checked={selectedPersonality === personality.id}
                        onChange={(e) => setSelectedPersonality(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{personality.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {personality.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {personality.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Style
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="detailed">Detailed and thorough</option>
                  <option value="concise">Concise and to the point</option>
                  <option value="conversational">Conversational and friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Save Settings
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 