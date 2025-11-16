
import React from 'react';
import type { MentalTrigger } from '../types';

interface TriggerSelectorProps {
  triggers: MentalTrigger[];
  selectedTriggers: string[];
  onToggle: (triggerKey: string) => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  triggers,
  selectedTriggers,
  onToggle,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {triggers.map((trigger) => {
        const isSelected = selectedTriggers.includes(trigger.key);
        return (
          <button
            key={trigger.key}
            onClick={() => onToggle(trigger.key)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {trigger.name}
          </button>
        );
      })}
    </div>
  );
};

export default TriggerSelector;
