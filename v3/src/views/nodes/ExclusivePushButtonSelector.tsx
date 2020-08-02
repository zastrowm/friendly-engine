import React from 'react';

export function PushButton<T>(_: { data: T; children: JSX.Element; key?: string }): JSX.Element {
  return undefined as any;
}

export function ExclusivePushButtonSelector(props: {
  onChanged: (data: string, targetElement?: HTMLElement) => void;
  children: React.ReactElement[];
  current: string;
}) {
  return (
    <span>
      {props.children.map((it) => (
        <button
          key={it.key ?? it.props.data}
          onClick={() => props.onChanged(it.props.data)}
          data-data={it.props.data}
          data-selected={it.props.data === props.current ? true : undefined}
        >
          {it.props.children}
        </button>
      ))}
    </span>
  );
}
