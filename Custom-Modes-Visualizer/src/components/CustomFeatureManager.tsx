import React, { useState } from 'react';
import { useModes } from '../context/ModeContext';
import { CustomFeatureModal } from './CustomFeatureModal';
import type { CustomFeature } from '../types';
import { featureCategories } from '../data/features';

export const CustomFeatureManager: React.FC = () => {
  const { customFeatures, addCustomFeature, updateCustomFeature, deleteCustomFeature } = useModes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<CustomFeature | null>(null);

  const handleCreateFeature = (featureData: Omit<CustomFeature, 'id'>) => {
    const newFeature: CustomFeature = {
      ...featureData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    addCustomFeature(newFeature);
  };

  const handleUpdateFeature = (id: string, updates: Partial<CustomFeature>) => {
    updateCustomFeature(id, updates);
  };

  const handleEdit = (feature: CustomFeature) => {
    setEditingFeature(feature);
    setIsModalOpen(true);
  };

  const handleDelete = (feature: CustomFeature) => {
    if (window.confirm(`Are you sure you want to delete "${feature.name}"? This action cannot be undone.`)) {
      deleteCustomFeature(feature.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFeature(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = featureCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Features</h2>
          <p className="text-gray-600 mt-1">Manage your custom toggleable features</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Feature</span>
        </button>
      </div>

      {customFeatures.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No custom features</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first custom feature.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customFeatures.map((feature) => (
            <div key={feature.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <p className="text-gray-600 mt-1">{feature.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryName(feature.category)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(feature)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Edit feature"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(feature)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete feature"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomFeatureModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleCreateFeature}
        onUpdate={handleUpdateFeature}
        editingFeature={editingFeature}
      />
    </div>
  );
};