import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MaidSupportPage from './MaidSupportPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/components/dashboard/MaidDashboardLayout', () => ({
  MaidDashboardLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="maid-dashboard-layout">{children}</div>,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderMaidSupportPage = () => {
  return render(
    <BrowserRouter>
      <MaidSupportPage />
    </BrowserRouter>
  );
};

describe('MaidSupportPage Chat Component', () => {
  it('renders partner support desk title', () => {
    renderMaidSupportPage();
    expect(screen.getByText('Partner Support Desk')).toBeInTheDocument();
  });

  it('sends user message and receives bot response', async () => {
    renderMaidSupportPage();
    const input = screen.getByLabelText('Type your support message') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'When is salary paid?' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('When is salary paid?')).toBeInTheDocument();
    expect(input.value).toBe('');

    await waitFor(
      () => {
        expect(
          screen.getByText((content) => content.includes('Payments are processed within 24-48 hours'))
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
