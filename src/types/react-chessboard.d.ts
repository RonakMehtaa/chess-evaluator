declare module 'react-chessboard' {
  import * as React from 'react';

  export type Square = string;

  // Handler arg types used in the app. Keep minimal shape to satisfy TS checks.
  export interface PieceDropHandlerArgs {
    sourceSquare: Square;
    targetSquare?: Square | null;
    // other properties may exist but are not required for our usage
    [key: string]: any;
  }

  export interface SquareHandlerArgs {
    square: Square;
    [key: string]: any;
  }

  export interface ChessboardProps extends React.HTMLAttributes<any> {
    position?: string | Record<string, string>;
    onPieceDrop?: (args: PieceDropHandlerArgs) => boolean | void;
    onSquareClick?: (args: SquareHandlerArgs) => void;
    allowDragging?: boolean;
    boardWidth?: number;
    orientation?: 'white' | 'black';
    options?: any;
  }

  export const Chessboard: React.FC<ChessboardProps>;
  export default Chessboard;
}
