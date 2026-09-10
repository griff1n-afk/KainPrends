import './StepsSection.css'

interface Step {
  id: string;
  description: string;
}

interface StepsSectionProps {
  steps: Step[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export default function StepsSection({ steps, onAdd, onRemove, onUpdate, onMove }: StepsSectionProps) {
  return (
    <div className="ss-container">
      {steps.map((step, index) => (
        <div className="ss-step" key={step.id}>
          <span className="ss-step-number">{index + 1}.</span>
          <textarea
            className="ss-textarea"
            placeholder="Step description..."
            value={step.description}
            onChange={(e) => onUpdate(step.id, e.target.value)}
          />
          <div className="ss-reorder-controls">
            <button
              type="button"
              className="ss-move-btn"
              onClick={() => onMove(step.id, 'up')}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="ss-move-btn"
              onClick={() => onMove(step.id, 'down')}
              disabled={index === steps.length - 1}
            >
              ↓
            </button>
          </div>
          {steps.length > 1 && (
            <button type="button" className="is-remove-btn" onClick={() => onRemove(step.id)}>
              &times;
            </button>
          )}
        </div>
      ))}

      <button type="button" className="ss-add-btn" onClick={onAdd}>+ Add Step</button>
    </div>
  );
}