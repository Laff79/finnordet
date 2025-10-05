import { useState, useRef } from 'react';

type Cell = {
  row: number;
  col: number;
};

type Props = {
  grid: string[][];
  words: {
    word: string;
    start: { row: number; col: number };
    end: { row: number; col: number };
    direction: string;
  }[];
  onWordFound?: (word: string) => void;
};

export default function WordSearchGrid({ grid, words, onWordFound }: Props) {
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridSize = grid.length;

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    return words.some(wordData => {
      if (!foundWords.has(wordData.word)) return false;

      const { start, end } = wordData;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      if (row < minRow || row > maxRow || col < minCol || col > maxCol) {
        return false;
      }

      const rowDiff = end.row - start.row;
      const colDiff = end.col - start.col;

      if (rowDiff === 0) {
        return row === start.row;
      } else if (colDiff === 0) {
        return col === start.col;
      } else {
        const steps = Math.abs(rowDiff);
        const rowStep = rowDiff / steps;
        const colStep = colDiff / steps;

        for (let i = 0; i <= steps; i++) {
          if (start.row + rowStep * i === row && start.col + colStep * i === col) {
            return true;
          }
        }
        return false;
      }
    });
  };

  const getCellFromPoint = (x: number, y: number): Cell | null => {
    if (!gridRef.current) return null;
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    const cellElement = element.closest('[data-cell]');
    if (!cellElement) return null;

    const row = parseInt(cellElement.getAttribute('data-row') || '0');
    const col = parseInt(cellElement.getAttribute('data-col') || '0');
    return { row, col };
  };

  const updateSelection = (row: number, col: number) => {
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell || (lastCell.row === row && lastCell.col === col)) return;

    const firstCell = selectedCells[0];
    const rowDiff = row - firstCell.row;
    const colDiff = col - firstCell.col;

    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const cells: Cell[] = [firstCell];
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const rowStep = steps === 0 ? 0 : rowDiff / steps;
      const colStep = steps === 0 ? 0 : colDiff / steps;

      for (let i = 1; i <= steps; i++) {
        cells.push({
          row: firstCell.row + Math.round(rowStep * i),
          col: firstCell.col + Math.round(colStep * i),
        });
      }

      setSelectedCells(cells);
    }
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;
    updateSelection(row, col);
  };

  const handleMouseUp = () => {
    if (selectedCells.length > 0) {
      checkForWord();
    }
    setIsSelecting(false);
    setSelectedCells([]);
  };

  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    e.preventDefault();
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isSelecting) return;

    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (cell) {
      updateSelection(cell.row, cell.col);
    }
  };

  const finalizeSelection = () => {
    if (selectedCells.length > 0) {
      checkForWord();
    }
    setIsSelecting(false);
    setSelectedCells([]);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    finalizeSelection();
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    finalizeSelection();
  };

  const checkForWord = () => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const matchedWord = words.find(
      wordData =>
        (wordData.word === selectedWord || wordData.word === reversedWord) &&
        !foundWords.has(wordData.word)
    );

    if (matchedWord) {
      setFoundWords(prev => new Set([...prev, matchedWord.word]));
      if (onWordFound) {
        onWordFound(matchedWord.word);
      }
    }
  };

  return (
    <div
      ref={gridRef}
      className="inline-block select-none touch-none w-full"
      style={{ maxWidth: 'min(90vw, 28rem)' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div
        className="grid gap-1 bg-white p-4 rounded-lg shadow-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const selected = isCellSelected(rowIndex, colIndex);
            const found = isCellInFoundWord(rowIndex, colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-cell
                data-row={rowIndex}
                data-col={colIndex}
                className={`
                  flex items-center justify-center
                  font-semibold text-xs sm:text-sm cursor-pointer
                  rounded transition-colors w-full aspect-square
                  ${found ? 'bg-green-200 text-green-800' : 'bg-gray-50 hover:bg-gray-100'}
                  ${selected ? 'bg-blue-300 text-blue-900' : ''}
                `}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
