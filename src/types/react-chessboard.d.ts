declare module 'react-chessboard' {
  import * as React from 'react';

  export type Square = string;

  export interface ChessboardProps extends React.HTMLAttributes<any> {
    position?: string | Record<string, string>;
    onPieceDrop?: (args: any) => boolean | void;
    onSquareClick?: (args: any) => void;
    allowDragging?: boolean;
    boardWidth?: number;
    orientation?: 'white' | 'black';
    options?: any;
  }

  export const Chessboard: React.FC<ChessboardProps>;
  export default Chessboard;
}
