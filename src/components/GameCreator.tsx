import { useState } from 'react';
import { Plus, X } from 'lucide-react';

type Props = {
  onCreateGame: (wordCount: number) => void;
  isCreating: boolean;
};

export default function GameCreator({ onCreateGame, isCreating }: Props) {
  const [wordCount, setWordCount] = useState(12);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGame(wordCount);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
      >
        <Plus size={20} />
        Lag nytt spill
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Lag nytt ordletingspill</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Antall ord
          </label>
          <input
            type="number"
            min="5"
            max="20"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-600">
            Spillet vil automatisk velge {wordCount} tilfeldige norske ord
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isCreating ? 'Oppretter...' : 'Opprett spill'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}
