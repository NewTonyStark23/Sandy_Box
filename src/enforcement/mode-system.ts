/**
 * Protocol Mode System
 * 
 * The enforcement layer should be CONTEXT-AWARE, not always-on.
 * 
 * Modes:
 * - CONVERSATION: Natural, fast responses (default)
 * - BRAINSTORM: Creative, exploratory, fast
 * - CODE_EDIT: Full protocol enforcement
 * 
 * The protocol only activates when there's actual code to edit.
 */

export type ProtocolMode = 'CONVERSATION' | 'BRAINSTORM' | 'CODE_EDIT';

export interface ModeContext {
  mode: ProtocolMode;
  reason: string;
  enforcementLevel: 'none' | 'light' | 'full';
  responseStyle: 'natural' | 'exploratory' | 'formal';
  thinkingTime: 'fast' | 'moderate' | 'thorough';
}

/**
 * Detect the appropriate mode based on conversation context
 */
export function detectMode(userMessage: string, conversationHistory: string[]): ModeContext {
  const message = userMessage.toLowerCase();
  
  // CODE_EDIT indicators
  const codeEditIndicators = [
    'fix the', 'fix this', 'bug in', 'broken', 'error in',
    'edit the', 'change the', 'update the', 'modify the',
    'add a function', 'write code', 'implement', 'refactor',
    'the button doesn\'t work', 'nothing happens when',
    'apply the fix', 'deploy the change'
  ];
  
  // BRAINSTORM indicators
  const brainstormIndicators = [
    'what if', 'how about', 'let\'s think', 'brainstorm',
    'ideas for', 'possibilities', 'options', 'alternatives',
    'explore', 'consider', 'imagine', 'suppose',
    'what are the', 'could we', 'should we'
  ];
  
  // Check for code edit context
  const hasCodeEdit = codeEditIndicators.some(indicator => message.includes(indicator));
  const hasCodeContext = conversationHistory.some(msg => 
    msg.toLowerCase().includes('code') || 
    msg.toLowerCase().includes('function') ||
    msg.toLowerCase().includes('bug') ||
    msg.toLowerCase().includes('fix')
  );
  
  // Check for brainstorm context
  const hasBrainstorm = brainstormIndicators.some(indicator => message.includes(indicator));
  
  // Determine mode
  if (hasCodeEdit && hasCodeContext) {
    return {
      mode: 'CODE_EDIT',
      reason: 'User is requesting a code fix or edit',
      enforcementLevel: 'full',
      responseStyle: 'formal',
      thinkingTime: 'thorough'
    };
  }
  
  if (hasBrainstorm || message.includes('what do you think') || message.includes('your thoughts')) {
    return {
      mode: 'BRAINSTORM',
      reason: 'User is exploring ideas or brainstorming',
      enforcementLevel: 'none',
      responseStyle: 'exploratory',
      thinkingTime: 'fast'
    };
  }
  
  // Default to conversation mode
  return {
    mode: 'CONVERSATION',
    reason: 'General conversation or question',
    enforcementLevel: 'none',
    responseStyle: 'natural',
    thinkingTime: 'fast'
  };
}

/**
 * Get response guidelines based on mode
 */
export function getResponseGuidelines(mode: ProtocolMode): string {
  switch (mode) {
    case 'CONVERSATION':
      return `
MODE: CONVERSATION
- Be natural and conversational
- Respond quickly and directly
- Don't over-analyze
- Keep it simple and friendly
- No need for formal structure
      `.trim();
    
    case 'BRAINSTORM':
      return `
MODE: BRAINSTORM
- Be creative and exploratory
- Think out loud
- Share multiple ideas quickly
- Don't worry about perfection
- Build on the user's ideas
- Fast iteration over deep analysis
      `.trim();
    
    case 'CODE_EDIT':
      return `
MODE: CODE_EDIT
- Apply full Rubbi-Box protocol
- Generate Context Card before editing
- Check reuse before repair before replace
- Test in sandbox before deploying
- Vet all changes
- Be thorough and precise
- Document every step
      `.trim();
  }
}

/**
 * Check if protocol should be enforced
 */
export function shouldEnforceProtocol(mode: ProtocolMode): boolean {
  return mode === 'CODE_EDIT';
}

/**
 * Get thinking time recommendation
 */
export function getThinkingTime(mode: ProtocolMode): string {
  switch (mode) {
    case 'CONVERSATION':
      return 'Respond immediately - no deep thinking needed';
    case 'BRAINSTORM':
      return 'Think quickly - explore ideas fast';
    case 'CODE_EDIT':
      return 'Think thoroughly - follow the full protocol';
  }
}
