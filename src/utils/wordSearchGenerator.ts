type Direction = {
  row: number;
  col: number;
  name: string;
};

const DIRECTIONS: Direction[] = [
  { row: 0, col: 1, name: 'horizontal' },
  { row: 1, col: 0, name: 'vertical' },
  { row: 1, col: 1, name: 'diagonal-down' },
  { row: -1, col: 1, name: 'diagonal-up' },
];

export type WordPlacement = {
  word: string;
  start: { row: number; col: number };
  end: { row: number; col: number };
  direction: string;
};

export function generateWordSearch(words: string[], gridSize: number = 15) {
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(''));

  const placements: WordPlacement[] = [];
  const uppercaseWords = words.map(w => w.toUpperCase());

  for (const word of uppercaseWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (canPlaceWord(grid, word, startRow, startCol, direction, gridSize)) {
        placeWord(grid, word, startRow, startCol, direction);
        const endRow = startRow + direction.row * (word.length - 1);
        const endCol = startCol + direction.col * (word.length - 1);

        placements.push({
          word,
          start: { row: startRow, col: startCol },
          end: { row: endRow, col: endCol },
          direction: direction.name,
        });
        placed = true;
      }
      attempts++;
    }
  }

  fillEmptySpaces(grid, gridSize);

  return { grid, placements };
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
  gridSize: number
): boolean {
  const endRow = row + direction.row * (word.length - 1);
  const endCol = col + direction.col * (word.length - 1);

  if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
    return false;
  }

  for (let i = 0; i < word.length; i++) {
    const r = row + direction.row * i;
    const c = col + direction.col * i;
    const currentCell = grid[r][c];

    if (currentCell !== '' && currentCell !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
): void {
  for (let i = 0; i < word.length; i++) {
    const r = row + direction.row * i;
    const c = col + direction.col * i;
    grid[r][c] = word[i];
  }
}

function fillEmptySpaces(grid: string[][], gridSize: number): void {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ';

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}
