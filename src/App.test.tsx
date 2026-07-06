import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Basic Setup Test', () => {
  it('should run a test in vitest', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a simple DOM element correctly', () => {
    render(<div>Test Element</div>);
    expect(screen.getByText('Test Element')).toBeInTheDocument();
  });
});
