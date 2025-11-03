import React, { useState } from 'react';
import { useModes } from '../context/ModeContext';
import type { Mode, FeatureState } from '../types';
import { featureCategories, features, getDefaultFeaturesForMode } from '../data/features';
import { CustomFeatureManager } from './CustomFeatureManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Props for the PromptBuilder component
 */
interface PromptBuilderProps {
  /** Available modes to build prompts from */
  modes: Mode[];
}

/**
 * Component for constructing custom prompts from mode options
 */
/**
 * Sortable feature item component
 */
const SortableFeatureItem: React.FC<{
  featureId: string;
  feature: any;
  selectedFeatures: FeatureState;
  onFeatureToggle: (featureId: string, enabled: boolean) => void;
  isCustom?: boolean;
}> = ({ featureId, feature, selectedFeatures, onFeatureToggle, isCustom = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: featureId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFeatureToggle(featureId, e.target.checked);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start space-x-3"
    >
      {/* Drag handle */}
      <button
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 15h18v2H3v-2zm0-4h18v2H3v-2zm0-4h18v2H3V7z"/>
        </svg>
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        id={`${featureId}-checkbox`}
        checked={selectedFeatures[featureId] || false}
        onChange={handleToggle}
        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        aria-label={feature.name}
      />

      {/* Feature content */}
      <div className="flex-1">
        <label htmlFor={`${featureId}-checkbox`} className="cursor-pointer">
          <span className="font-medium text-gray-900">{feature.name}</span>
          <p className="text-sm text-gray-600">{feature.description}</p>
          {isCustom && (
            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Custom
            </span>
          )}
        </label>
      </div>
    </div>
  );
};

const PromptBuilder: React.FC<PromptBuilderProps> = ({ modes }) => {
    const { customFeatures, reorderCustomFeatures } = useModes();
    const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState<FeatureState>({});
    const [copyMessage, setCopyMessage] = useState(false);
    const [showCustomFeatureManager, setShowCustomFeatureManager] = useState(false);

    // Sensors for drag and drop
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

   /**
    * Handle mode selection
    */
   const handleModeSelect = (mode: Mode) => {
     setSelectedMode(mode);
     setCustomPrompt('');
     setGeneratedPrompt('');
     setSelectedFeatures(getDefaultFeaturesForMode(mode.slug));
   };

   /**
    * Handle drag end for feature reordering
    */
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;

     if (over && active.id !== over.id) {
       const activeId = active.id as string;
       const overId = over.id as string;

       // Check if both are custom features
       const isActiveCustom = activeId.startsWith('custom-');
       const isOverCustom = overId.startsWith('custom-');

       if (isActiveCustom && isOverCustom) {
         // Reorder custom features
         const oldIndex = customFeatures.findIndex(f => f.id === activeId);
         const newIndex = customFeatures.findIndex(f => f.id === overId);

         if (oldIndex !== -1 && newIndex !== -1) {
           const newOrder = arrayMove(customFeatures, oldIndex, newIndex);
           reorderCustomFeatures(newOrder);
         }
       }
       // For built-in features, we could add reordering if needed in the future
       // But the task specifically mentions custom features
     }
   };

   /**
    * Handle feature toggle changes
    */
   const handleFeatureToggle = (featureId: string, enabled: boolean) => {
     setSelectedFeatures(prev => ({
       ...prev,
       [featureId]: enabled,
     }));
   };

   /**
    * Generate prompt from selected mode and enabled features
    */
   const generatePrompt = () => {
     if (!selectedMode) return;

     let prompt = selectedMode.prompt;

     // Collect enabled features in drag-and-drop order (per category)
     const enabledFeatures: (typeof features[0] | typeof customFeatures[0])[] = [];
     featureCategories.forEach(category => {
       // Add enabled built-in features for this category
       const catBuiltIn = features.filter(f => f.category === category.id && selectedFeatures[f.id]);
       enabledFeatures.push(...catBuiltIn);

       // Add enabled custom features for this category (in their reordered order)
       const catCustom = customFeatures.filter(f => f.category === category.id && selectedFeatures[f.id]);
       enabledFeatures.push(...catCustom);
     });

     // Add enabled features as standardized instruction blocks
     if (enabledFeatures.length > 0) {
       prompt += '\n\n--- Feature Enhancements ---\n';
       enabledFeatures.forEach(feature => {
         prompt += `\n## ${feature.name}\n${feature.description}\n`;
       });
     }

     // If there's custom content, integrate it
     if (customPrompt.trim()) {
       prompt += `\n\nAdditional Instructions: ${customPrompt}`;
     }

     setGeneratedPrompt(prompt);
   };

   /**
    * Copy generated prompt to clipboard
    */
   const copyToClipboard = async () => {
     if (generatedPrompt) {
       try {
         await navigator.clipboard.writeText(generatedPrompt);
         // Show copy success message
         setCopyMessage(true);
         setTimeout(() => setCopyMessage(false), 2000);
       } catch (err) {
         console.error('Failed to copy text: ', err);
       }
     }
   };

   /**
    * Reset the builder
    */
   const reset = () => {
     setSelectedMode(null);
     setCustomPrompt('');
     setGeneratedPrompt('');
     setSelectedFeatures({});
   };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Prompt Builder</h2>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Base Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.slug}
                onClick={() => handleModeSelect(mode)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedMode?.slug === mode.slug
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{mode.name}</div>
                <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>


        {/* Custom Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={customPrompt}
             onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific requirements, constraints, or customizations..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Custom Feature Manager Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowCustomFeatureManager(!showCustomFeatureManager)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${showCustomFeatureManager ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Manage Custom Features</span>
          </button>
          {showCustomFeatureManager && (
            <div className="mt-4 border-t pt-4">
              <CustomFeatureManager />
            </div>
          )}
        </div>

        {/* Selected Mode Info */}
        {selectedMode && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Mode Details</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900">{selectedMode.name}</h4>
               <p className="text-blue-800 mt-1">{selectedMode.description}</p>
               <p className="text-blue-700 text-sm mt-2">
                 <strong>Usage:</strong> {selectedMode.usage}
              </p>
            </div>
          </div>
        )}

        {/* Feature Toggles */}
        {selectedMode && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Feature Enhancements
              </label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="space-y-4">
                  {featureCategories.map(category => {
                    const categoryFeatures = features.filter(f => f.category === category.id);
                    const categoryCustomFeatures = customFeatures.filter(f => f.category === category.id);

                    if (categoryFeatures.length === 0 && categoryCustomFeatures.length === 0) return null;

                    // Create sortable items for both built-in and custom features
                    const allFeatures = [
                      ...categoryFeatures.map(f => ({ ...f, isCustom: false })),
                      ...categoryCustomFeatures.map(f => ({ ...f, isCustom: true }))
                    ];

                    return (
                      <div key={category.id} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                        <div className="space-y-2">
                          <SortableContext
                            items={allFeatures.map(f => f.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {allFeatures.map(feature => (
                              <SortableFeatureItem
                                key={feature.id}
                                featureId={feature.id}
                                feature={feature}
                                selectedFeatures={selectedFeatures}
                                onFeatureToggle={handleFeatureToggle}
                                isCustom={feature.isCustom}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DndContext>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={generatePrompt}
            disabled={!selectedMode}
            className={`px-6 py-2 rounded-md font-medium ${
              selectedMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            🚀 Generate Prompt
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            🔄 Reset
          </button>
        </div>

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Generated Prompt</h3>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </div>
        )}


        {/* Copy success message */}
        {copyMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in-up z-50">
            Copied ✨
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptBuilder;