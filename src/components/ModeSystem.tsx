import { useState } from 'react';
import { detectMode, getResponseGuidelines, shouldEnforceProtocol, getThinkingTime, ProtocolMode } from '../enforcement/mode-system';

export default function ModeSystem() {
  const [userInput, setUserInput] = useState('');
  const [currentMode, setCurrentMode] = useState<ProtocolMode>('CONVERSATION');
  const [modeContext, setModeContext] = useState(detectMode('', []));
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setUserInput(value);
    
    // Detect mode based on input and history
    const context = detectMode(value, conversationHistory);
    setModeContext(context);
    setCurrentMode(context.mode);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    // Add to conversation history
    setConversationHistory([...conversationHistory, userInput]);
    
    // Show example response based on mode
    alert(`Mode: ${currentMode}\n\n${getResponseGuidelines(currentMode)}`);
    
    setUserInput('');
  };

  const handlePreset = (preset: string, type: 'conversation' | 'brainstorm' | 'code_edit') => {
    setUserInput(preset);
    const context = detectMode(preset, conversationHistory);
    setModeContext(context);
    setCurrentMode(context.mode);
  };

  const getModeColor = (mode: ProtocolMode) => {
    switch (mode) {
      case 'CONVERSATION':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'BRAINSTORM':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      case 'CODE_EDIT':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
    }
  };

  const getModeIcon = (mode: ProtocolMode) => {
    switch (mode) {
      case 'CONVERSATION':
        return '💬';
      case 'BRAINSTORM':
        return '💡';
      case 'CODE_EDIT':
        return '🛡️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎭 Protocol Mode System
        </h2>
        <p className="text-gray-400">
          The enforcement layer is now <span className="text-green-400 font-semibold">context-aware</span>. 
          It only activates when there's actual code to edit.
        </p>
      </div>

      {/* Current Mode Display */}
      <div className={`rounded-xl border-2 p-6 ${getModeColor(currentMode)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getModeIcon(currentMode)}</span>
            <div>
              <h3 className="text-xl font-bold">{currentMode}</h3>
              <p className="text-sm opacity-80">{modeContext.reason}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Enforcement Level</div>
            <div className="text-lg font-bold">{modeContext.enforcementLevel.toUpperCase()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs opacity-80 mb-1">Response Style</div>
            <div className="font-semibold">{modeContext.responseStyle}</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs opacity-80 mb-1">Thinking Time</div>
            <div className="font-semibold">{modeContext.thinkingTime}</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Try Different Inputs</h3>
        
        {/* Preset Buttons */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">💬 Conversation Mode:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreset('Hey, how are you?', 'conversation')}
                className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                "Hey, how are you?"
              </button>
              <button
                onClick={() => handlePreset('What do you think about this?', 'conversation')}
                className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                "What do you think about this?"
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">💡 Brainstorm Mode:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreset('What if we tried a different approach?', 'brainstorm')}
                className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                "What if we tried a different approach?"
              </button>
              <button
                onClick={() => handlePreset('Let\'s brainstorm some ideas for optimization', 'brainstorm')}
                className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                "Let's brainstorm some ideas"
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">🛡️ Code Edit Mode:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreset('The volume button is broken, fix it', 'code_edit')}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors"
              >
                "The volume button is broken, fix it"
              </button>
              <button
                onClick={() => handlePreset('There\'s a bug in the login function', 'code_edit')}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors"
              >
                "There's a bug in the login function"
              </button>
            </div>
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-3">
          <textarea
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your own message to see how the mode changes..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Analyze Input
          </button>
        </div>
      </div>

      {/* Response Guidelines */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Response Guidelines for {currentMode}</h3>
        <pre className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {getResponseGuidelines(currentMode)}
        </pre>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Mode Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Aspect</th>
                <th className="text-left py-2 px-3 text-blue-400">💬 Conversation</th>
                <th className="text-left py-2 px-3 text-purple-400">💡 Brainstorm</th>
                <th className="text-left py-2 px-3 text-red-400">🛡️ Code Edit</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3 font-semibold">Enforcement</td>
                <td className="py-2 px-3">None</td>
                <td className="py-2 px-3">None</td>
                <td className="py-2 px-3">Full</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3 font-semibold">Response Style</td>
                <td className="py-2 px-3">Natural</td>
                <td className="py-2 px-3">Exploratory</td>
                <td className="py-2 px-3">Formal</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3 font-semibold">Thinking Time</td>
                <td className="py-2 px-3">Fast</td>
                <td className="py-2 px-3">Fast</td>
                <td className="py-2 px-3">Thorough</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3 font-semibold">Protocol Steps</td>
                <td className="py-2 px-3">0</td>
                <td className="py-2 px-3">0</td>
                <td className="py-2 px-3">10</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Token Savings</td>
                <td className="py-2 px-3">N/A</td>
                <td className="py-2 px-3">N/A</td>
                <td className="py-2 px-3">91-99%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-400 mb-3">✨ Key Insight</h3>
        <p className="text-gray-300">
          The protocol is now <span className="text-green-400 font-semibold">context-aware</span>. 
          It only activates when there's actual code to edit. For conversations and brainstorming, 
          the AI responds naturally and quickly without over-analyzing.
        </p>
        <div className="mt-4 text-sm text-gray-400">
          <strong className="text-white">Before:</strong> Every message triggered the full protocol → slow, robotic responses<br/>
          <strong className="text-white">After:</strong> Protocol only activates for code edits → fast, natural conversations
        </div>
      </div>
    </div>
  );
}
