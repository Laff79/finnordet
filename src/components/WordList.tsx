import { Check } from 'lucide-react';

type Props = {
  words: string[];
  foundWords: Set<string>;
  variant?: 'panel' | 'drawer';
};

export default function WordList({ words, foundWords, variant = 'panel' }: Props) {
  if (variant === 'drawer') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {words.map((word) => {
            const isFound = foundWords.has(word);
            return (
              <span
                key={word}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isFound
                    ? 'bg-green-100 text-green-800 line-through'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isFound && <Check size={16} className="text-green-600" />}
                {word}
              </span>
            );
          })}
        </div>
        <p className="text-sm text-gray-600">
          Funnet: {foundWords.size} / {words.length}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Ord å finne</h3>
      <div className="space-y-2">
        {words.map((word) => {
          const isFound = foundWords.has(word);
          return (
            <div
              key={word}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFound
                  ? 'bg-green-100 text-green-800 line-through'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              {isFound && <Check size={18} className="text-green-600" />}
              <span className="font-medium">{word}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Funnet: {foundWords.size} / {words.length}
        </p>
      </div>
    </div>
  );
}
