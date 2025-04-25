import React from 'react';

export const ExperimentEnd: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">실험이 종료되었습니다</h2>
      <p className="text-gray-600 mb-4">현재 실험은 종료되어 더 이상 응답을 받을 수 없습니다.</p>
      <p className="text-sm text-gray-500">참여해 주셔서 감사합니다!</p>
    </div>
  );
}; 