import React from 'react';
import { render } from '@testing-library/react';
import EditorApp from './EditorApp';

test('app renders successfully', () => {
  const { getByText } = render(<EditorApp />);
  const linkElement = getByText("Web App Builder");
  expect(linkElement).toBeInTheDocument();
});
