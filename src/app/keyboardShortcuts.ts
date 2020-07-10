import hotkeys from 'hotkeys-js';
import { appRoutedCommands, RoutedCommand } from '@/framework/appRoutedCommands';

function trigger(shortcut, command: RoutedCommand) {
  hotkeys(shortcut, (evt) => {
    command.trigger(document.activeElement as HTMLElement);
    evt.preventDefault();
  });
}

export function registerShortcuts() {
  trigger('ctrl+z', appRoutedCommands.undo);
  trigger('ctrl+y', appRoutedCommands.redo);
  trigger('delete', appRoutedCommands.delete);
  trigger('ctrl+n', appRoutedCommands.new);
  trigger('ctrl+a', appRoutedCommands.new);
}
