export type Player = 'X' | 'O';

export type SquareValue = Player | null;

export type Board = SquareValue[];

export type GameHistory = Board[];

export interface GameState {
  history: GameHistory;
  currentMove: number;
  winner: Player | null;
  isDraw: boolean;
}

export interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinningSquare?: boolean;
  disabled?: boolean;
}

export interface BoardProps {
  squares: Board;
  onSquareClick: (index: number) => void;
  winningLine?: number[];
  disabled?: boolean;
}

export interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
}
