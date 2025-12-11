import React, { useState, useEffect, useRef } from 'react';
import { estimateTokens } from '../utils/tokenEstimation';

/**
 * Props for the ContextManager component
 */
interface ContextManagerProps {
  /** Optional callback when a recommendation is made */
  onRecommendation?: (recommendation: ContextRecommendation) => void;
}

/**
 * Uploaded file with token estimation
 */
interface UploadedFile {
  name: string;
  size: number;
  tokens: number;
}

/**
 * Context calculation input state
 */
interface ContextInputs {
  systemPromptTokens: number;
  currentHistoryTokens: number;
  turnCount: number;
  filesRead: number;
  plannedMessages: number;
  inputPrice: number;
  outputPrice: number;
}

/**
 * Cost calculation results
 */
interface CostCalculation {
  totalContext: number;
  costPerTurnStaying: number;
  costToSwitch: number;
  costIfStay: number;
  costIfSwitch: number;
  breakEvenTurns: number;
}

/**
 * Context recommendation result
 */
interface ContextRecommendation {
  recommendation: string;
  cssClass: 'stay' | 'switch' | 'urgent';
  details: string;
  warnings: string;
  costs: CostCalculation;
  riskFactors: {
    contextPollutionRisk: boolean;
    fileBloatRisk: boolean;
    historyBloatRisk: boolean;
  };
}

/**
 * ContextManager component for task-switch optimization
 * Implements the "10x Rule" calculator for determining when to switch tasks
 */
const ContextManager: React.FC<ContextManagerProps> = ({ onRecommendation }) => {
  // Form state for all inputs
  const [inputs, setInputs] = useState<ContextInputs>({
    systemPromptTokens: 2000,
    currentHistoryTokens: 10000,
    turnCount: 10,
    filesRead: 3,
    plannedMessages: 5,
    inputPrice: 3.00,
    outputPrice: 15.00
  });

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [totalFileTokens, setTotalFileTokens] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate results state
  const [recommendation, setRecommendation] = useState<ContextRecommendation | null>(null);

  const CACHE_MULTIPLIER = 10;
  const OUTPUT_TOKENS_PER_TURN = 2000; // Average output tokens per turn

  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /**
   * Calculate context recommendation based on inputs
   */
  const calculateRecommendation = (): ContextRecommendation => {
    const { systemPromptTokens, currentHistoryTokens, turnCount, filesRead, plannedMessages, inputPrice, outputPrice } = inputs;

    // Calculate total context size
    const totalContext = systemPromptTokens + currentHistoryTokens;

    // Calculate break-even point (in turns)
    const breakEvenTurns = (CACHE_MULTIPLIER * systemPromptTokens) / currentHistoryTokens;

    // Calculate output cost (symmetric for both stay/switch)
    const outputCostPerTurn = (OUTPUT_TOKENS_PER_TURN * outputPrice) / 1000000;

    // Calculate input costs
    // Use inputPrice for costPerTurnStaying (cached), inputPrice * 10 for costToSwitch (full price)
    const inputCostPerTurnStaying = (totalContext * inputPrice) / 1000000;
    const inputCostToSwitch = (systemPromptTokens * inputPrice * CACHE_MULTIPLIER) / 1000000;

    // Total costs per turn/path
    const costPerTurnStaying = inputCostPerTurnStaying + outputCostPerTurn;
    const costToSwitch = inputCostToSwitch + outputCostPerTurn;
    const costIfStay = costPerTurnStaying * plannedMessages;
    const costIfSwitch = costToSwitch + (costPerTurnStaying * (plannedMessages - 1));

    // Risk factors
    const contextPollutionRisk = turnCount > 15;
    const fileBloatRisk = filesRead > 5;
    const historyBloatRisk = currentHistoryTokens > 25000;

    // Determine recommendation
    let recommendation: string = '', cssClass: 'stay' | 'switch' | 'urgent' = 'stay', details: string = '';

    if (historyBloatRisk || (turnCount > 20) || (filesRead > 8)) {
      recommendation = '🚨 SWITCH NOW - Your context is critically bloated';
      cssClass = 'urgent';
      details = `Your current context (${totalContext.toLocaleString()} tokens) is too large. You're wasting money on "rent" for old data that likely isn't helping anymore.`;
    } else if (costIfStay > costIfSwitch * 1.5) {
      recommendation = '⚠️ RECOMMEND SWITCH - Starting fresh will save money';
      cssClass = 'switch';
      details = `Staying will cost $${costIfStay.toFixed(4)}, while switching costs $${costIfSwitch.toFixed(4)}. You'll save $${(costIfStay - costIfSwitch).toFixed(4)} over the next ${plannedMessages} messages.`;
    } else if (breakEvenTurns > plannedMessages) {
      recommendation = '✅ STAY - You haven\'t hit the break-even point yet';
      cssClass = 'stay';
      details = `Your System Prompt is heavy (${systemPromptTokens.toLocaleString()} tokens). You'd need to send ${Math.ceil(breakEvenTurns)} messages to justify switching, but you only plan ${plannedMessages}.`;
    } else {
      recommendation = '⚖️ MARGINAL - Consider your workflow';
      cssClass = 'switch';
      details = `The math is close. If you're changing topics or finished a feature, switch. If you're debugging the same issue, stay.`;
    }

    // Add risk warnings
    let warnings = '';
    if (contextPollutionRisk) warnings += '<br>⚠️ High turn count detected - context may be polluted with failed attempts.';
    if (fileBloatRisk) warnings += '<br>⚠️ Many files in context - consider removing unused files.';

    const costs: CostCalculation = {
      totalContext,
      costPerTurnStaying,
      costToSwitch,
      costIfStay,
      costIfSwitch,
      breakEvenTurns
    };

    const riskFactors = {
      contextPollutionRisk,
      fileBloatRisk,
      historyBloatRisk
    };

    return {
      recommendation,
      cssClass,
      details,
      warnings,
      costs,
      riskFactors
    };
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof ContextInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files: FileList) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.toLowerCase().split('.').pop();
      const validExts = ['txt', 'md', 'ts', 'tsx', 'js', 'jsx', 'json', 'css', 'html'];
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (>10MB), skipped`);
        continue;
      }
      if (!validExts.includes(ext!) && !file.type.startsWith('text/')) {
        console.warn(`File ${file.name} has invalid type, skipped`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;
    setIsProcessing(true);
    const promises = validFiles.map(async (file) => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const tokens = estimateTokens(text);
          resolve({ name: file.name, size: file.size, tokens });
        };
        reader.readAsText(file);
      });
    });
    const results = await Promise.all(promises);
    setUploadedFiles(prev => [...prev, ...results]);
    const total = results.reduce((sum, f) => sum + f.tokens, 0);
    setTotalFileTokens(prev => prev + total);
    setIsProcessing(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      const newTotal = newFiles.reduce((sum, f) => sum + f.tokens, 0);
      setTotalFileTokens(newTotal);
      return newFiles;
    });
  };

  const addToHistory = () => {
    setInputs(prev => ({ ...prev, currentHistoryTokens: prev.currentHistoryTokens + totalFileTokens }));
    setUploadedFiles([]);
    setTotalFileTokens(0);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    const result = calculateRecommendation();
    setRecommendation(result);
    if (onRecommendation) {
      onRecommendation(result);
    }
  }, [inputs, onRecommendation]);

  /**
   * Get CSS classes for result based on recommendation type
   */
  const getResultClasses = (cssClass: string) => {
    const baseClasses = 'mt-6 p-5 rounded-lg border-l-4 text-lg font-medium';
    switch (cssClass) {
      case 'stay':
        return `${baseClasses} bg-teal-50 border-teal-400 text-teal-800`;
      case 'switch':
        return `${baseClasses} bg-orange-50 border-orange-400 text-orange-800`;
      case 'urgent':
        return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Switch Calculator</h2>
        <p className="text-gray-600">Optimize your API costs by knowing when to switch tasks</p>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Prompt Size */}
          <div>
            <label htmlFor="systemPromptTokens" className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt Size (tokens)
            </label>
            <input
              type="number"
              id="systemPromptTokens"
              value={inputs.systemPromptTokens}
              onChange={(e) => handleInputChange('systemPromptTokens', e.target.value)}
              min="100"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Current Chat History */}
          <div>
            <label htmlFor="currentHistoryTokens" className="block text-sm font-medium text-gray-700 mb-2">
              Current Chat History (tokens)
            </label>
            <input
              type="number"
              id="currentHistoryTokens"
              value={inputs.currentHistoryTokens}
              onChange={(e) => handleInputChange('currentHistoryTokens', e.target.value)}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Number of Turns */}
          <div>
            <label htmlFor="turnCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Turns So Far
            </label>
            <input
              type="number"
              id="turnCount"
              value={inputs.turnCount}
              onChange={(e) => handleInputChange('turnCount', e.target.value)}
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Files Read */}
          <div>
            <label htmlFor="filesRead" className="block text-sm font-medium text-gray-700 mb-2">
              Files Read in Context
            </label>
            <input
              type="number"
              id="filesRead"
              value={inputs.filesRead}
              onChange={(e) => handleInputChange('filesRead', e.target.value)}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Planned Messages */}
          <div className="md:col-span-2">
            <label htmlFor="plannedMessages" className="block text-sm font-medium text-gray-700 mb-2">
              How many more messages do you plan to send?
            </label>
            <input
              type="number"
              id="plannedMessages"
              value={inputs.plannedMessages}
              onChange={(e) => handleInputChange('plannedMessages', e.target.value)}
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Pricing Inputs */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Pricing ($/Million Tokens)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inputPrice" className="block text-xs font-medium text-gray-600 mb-1">
                  Input
                </label>
                <input
                  type="number"
                  id="inputPrice"
                  value={inputs.inputPrice}
                  onChange={(e) => handleInputChange('inputPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="outputPrice" className="block text-xs font-medium text-gray-600 mb-1">
                  Output
                </label>
                <input
                  type="number"
                  id="outputPrice"
                  value={inputs.outputPrice}
                  onChange={(e) => handleInputChange('outputPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">File Upload for Token Estimation</label>
            <div ref={dropZoneRef} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()}>
              {isProcessing ? <div>Processing...</div> : <div>Drag & drop files or click to browse (.txt, .md, .tsx, etc.)</div>}
              <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.ts,.tsx,.js,.jsx,.json,.css,.html" className="hidden" onChange={(e) => handleFiles(e.target.files!)} />
            </div>
            {totalFileTokens > 0 && (
              <div className="mt-4 space-y-2">
                <div>Total: {totalFileTokens.toLocaleString()} tokens <button onClick={addToHistory} className="ml-2 px-3 py-1 bg-teal-500 text-white rounded text-sm">Add to History</button></div>
                <ul>{uploadedFiles.map((f,i) => <li key={i} className={`flex justify-between p-2 rounded ${f.tokens<1000?'bg-green-50':f.tokens<5000?'bg-yellow-50':'bg-red-50'}`}>
                  <span>{f.name} ({f.size/1024|0}KB)</span><span>{f.tokens.toLocaleString()}</span><button onClick={()=>removeFile(i)} className="ml-2 text-red-500">×</button>
                </li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Card */}
      {recommendation && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className={getResultClasses(recommendation.cssClass)}>
            <div className="text-xl mb-4">{recommendation.recommendation}</div>
            <div className="text-sm text-gray-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: recommendation.details }} />
              {recommendation.warnings && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div dangerouslySetInnerHTML={{ __html: recommendation.warnings }} />
                </div>
              )}
              
              {/* Cost Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Total Context Size:</span>
                  <span>{recommendation.costs.totalContext.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Cost per turn (staying):</span>
                  <span>${recommendation.costs.costPerTurnStaying.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Cost to switch (first turn):</span>
                  <span>${recommendation.costs.costToSwitch.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Break-even point:</span>
                  <span>{Math.ceil(recommendation.costs.breakEvenTurns)} turns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How it Works</h3>
        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <strong>The 10x Rule:</strong> Switching tasks costs 10x more for one turn (full price vs cached price). 
            This calculator determines if your "history rent" exceeds the "switching penalty."
          </div>
          <div>
            <strong>Key Factors:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Heavy System Prompt = Stay longer</li>
              <li>Bloated History = Switch sooner</li>
              <li>Many Files Read = Switch sooner</li>
              <li>High Turn Count = Context pollution risk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextManager;