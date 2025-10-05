import { useState, useEffect } from 'react';
import { Search, Plus, List, X } from 'lucide-react';
import { supabase, type WordSearchGame } from './lib/supabase';
import { generateWordSearch, type WordPlacement } from './utils/wordSearchGenerator';
import { getRandomWords } from './utils/norwegianWords';
import GameCreator from './components/GameCreator';
import WordSearchGrid from './components/WordSearchGrid';
import WordList from './components/WordList';

function App() {
  const [games, setGames] = useState<WordSearchGame[]>([]);
  const [currentGame, setCurrentGame] = useState<WordSearchGame | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isWordListOpen, setWordListOpen] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isGameActive && currentGame && foundWords.size < currentGame.words.length) {
      interval = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, currentGame, foundWords.size]);

  const loadGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('word_search_games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading games:', error);
    } else if (data) {
      setGames(data);
      if (data.length > 0 && !currentGame) {
        setCurrentGame(data[0]);
      }
    }
    setLoading(false);
  };

  const handleCreateGame = async (wordCount: number) => {
    setIsCreating(true);

    const words = getRandomWords(wordCount);
    const { grid, placements } = generateWordSearch(words, 15);

    const gameData = {
      title: 'Ordleting',
      grid_size: 15,
      grid_data: grid,
      words: placements,
      is_public: true,
    };

    const { data, error } = await supabase
      .from('word_search_games')
      .insert([gameData])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating game:', error);
      alert('Kunne ikke opprette spill. Prøv igjen.');
    } else if (data) {
      setGames([data, ...games]);
      setCurrentGame(data);
      setFoundWords(new Set());
      setScore(0);
      setTimeElapsed(0);
      setIsGameActive(false);
    }

    setIsCreating(false);
  };

  const handleWordFound = async (word: string) => {
    if (!isGameActive) {
      setIsGameActive(true);
    }
    const newFoundWords = new Set([...foundWords, word]);
    setFoundWords(newFoundWords);
    const wordLength = word.length;
    const timeBonus = Math.max(0, 100 - timeElapsed);
    const points = wordLength * 10 + timeBonus;
    const newScore = score + points;
    setScore(newScore);

    if (currentGame && newFoundWords.size === currentGame.words.length) {
      await supabase.from('game_scores').insert([{
        game_id: currentGame.id,
        score: newScore,
        time_seconds: timeElapsed,
        words_found: newFoundWords.size,
        completed: true,
      }]);
    }
  };

  const handleSelectGame = (game: WordSearchGame) => {
    setCurrentGame(game);
    setFoundWords(new Set());
    setScore(0);
    setTimeElapsed(0);
    setIsGameActive(false);
    setWordListOpen(false);
  };

  const handleNewGame = () => {
    setCurrentGame(null);
    setFoundWords(new Set());
    setScore(0);
    setTimeElapsed(0);
    setIsGameActive(false);
    setWordListOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Search size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Ordleting</h1>
          </div>
          <p className="text-gray-600">Finn alle ordene i rutenettet!</p>
        </header>

        {!currentGame ? (
          <div className="flex flex-col items-center gap-6">
            <GameCreator onCreateGame={handleCreateGame} isCreating={isCreating} />

            {games.length > 0 && (
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tidligere spill</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <h3 className="font-semibold text-gray-800 mb-1">{game.title}</h3>
                      <p className="text-sm text-gray-600">
                        {game.words.length} ord • {game.grid_size}x{game.grid_size}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-800">{currentGame.title}</h2>

              <div className="flex items-center gap-4">
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600 mb-1">Tid</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <div className="text-sm text-gray-600 mb-1">Poeng</div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                </div>

                <button
                  onClick={handleNewGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nytt spill
                </button>
              </div>
            </div>

            {foundWords.size === currentGame.words.length && (
              <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 text-center">
                <p className="text-2xl font-bold text-green-800 mb-2">Gratulerer! Du fant alle ordene!</p>
                <p className="text-lg text-green-700">Sluttpoeng: {score} | Tid: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
              <button
                type="button"
                onClick={() => setWordListOpen(true)}
                className="lg:hidden self-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                <List size={18} />
                Vis ordliste
              </button>

              <WordSearchGrid
                grid={currentGame.grid_data}
                words={currentGame.words}
                onWordFound={handleWordFound}
              />

              <div className="lg:w-80 hidden lg:block">
                <WordList
                  words={currentGame.words.map((w: WordPlacement) => w.word)}
                  foundWords={foundWords}
                  variant="panel"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {currentGame && isWordListOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Ord å finne</h3>
              <button
                type="button"
                onClick={() => setWordListOpen(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                aria-label="Lukk ordliste"
              >
                <X size={18} />
              </button>
            </div>
            <WordList
              words={currentGame.words.map((w: WordPlacement) => w.word)}
              foundWords={foundWords}
              variant="drawer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
