import React from 'react';
import { render } from '@testing-library/react';
import EditorApp from './EditorApp';

test('renders learn react link', () => {
  const { getByText } = render(<EditorApp />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
