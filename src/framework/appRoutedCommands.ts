import { RoutedCommand } from './routedCommands';

/** Common application routed commands */
export let appRoutedCommands = {
  delete: new RoutedCommand('delete'),
  undo: new RoutedCommand('undo'),
  redo: new RoutedCommand('redo'),
  new: new RoutedCommand('new'),
};

export { RoutedCommand };
