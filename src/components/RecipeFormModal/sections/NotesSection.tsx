import './NotesSection.css'

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export default function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <div className="ns-container">
      <label className="ns-label">Notes & Tips (Optional)</label>
      <textarea
        className="ns-textarea"
        placeholder="Add extra cooking secrets, tweaks, or storage advice here..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
    </div>
  );
}