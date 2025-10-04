import { Check } from 'lucide-react';

type Props = {
  words: string[];
  foundWords: Set<string>;
};

export default function WordList({ words, foundWords }: Props) {
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
