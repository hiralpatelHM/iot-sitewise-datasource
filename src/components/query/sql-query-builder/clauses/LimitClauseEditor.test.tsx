import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LimitClauseEditor } from './LimitClauseEditor';

describe('LimitClauseEditor', () => {
  it('renders with empty input if limit is undefined', () => {
    render(<LimitClauseEditor limit={undefined} updateQuery={jest.fn()} />);
    expect(screen.getByPlaceholderText('Defaults to 100')).toHaveValue(null);
  });

  it('renders with provided limit', () => {
    render(<LimitClauseEditor limit={50} updateQuery={jest.fn()} />);
    expect(screen.getByPlaceholderText('Defaults to 100')).toHaveValue(50);
  });

  it('calls updateQuery with number on valid input', () => {
    const updateQuery = jest.fn();
    render(<LimitClauseEditor limit={undefined} updateQuery={updateQuery} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '25' } });
    expect(updateQuery).toHaveBeenCalledWith({ limit: 25 });
  });

  it('calls updateQuery with undefined on empty input', () => {
    const updateQuery = jest.fn();
    render(<LimitClauseEditor limit={100} updateQuery={updateQuery} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(updateQuery).toHaveBeenCalledWith({ limit: undefined });
  });

  it('does not call updateQuery on non-numeric input', () => {
    const updateQuery = jest.fn();
    render(<LimitClauseEditor limit={undefined} updateQuery={updateQuery} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: 'abc' } });
    expect(updateQuery).not.toHaveBeenCalled();
  });
});
