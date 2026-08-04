import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SupportPage from './SupportPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock scrollIntoView which is not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderSupportPage = () => {
  return render(
    <BrowserRouter>
      <SupportPage />
    </BrowserRouter>
  );
};

describe('SupportPage Chat Component', () => {
  it('renders support center header and AI Assistant section', () => {
    renderSupportPage();
    expect(screen.getByText('Support Center')).toBeInTheDocument();
    expect(screen.getByText('Sweepro AI Assistant')).toBeInTheDocument();
  });

  it('allows user to type and send a message', async () => {
    renderSupportPage();
    const input = screen.getByLabelText('Type your support message') as HTMLInputElement;
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'How do I reschedule?' } });
    expect(input.value).toBe('How do I reschedule?');

    fireEvent.click(sendButton);

    // Message should be displayed in the conversation history
    expect(screen.getByText('How do I reschedule?')).toBeInTheDocument();

    // Input should be cleared
    expect(input.value).toBe('');

    // Wait for simulated bot response
    await waitFor(
      () => {
        expect(
          screen.getByText((content) => content.includes('reschedule appointments'))
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('disables send button when input is empty or whitespace only', () => {
    renderSupportPage();
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();

    const input = screen.getByLabelText('Type your support message');
    fireEvent.change(input, { target: { value: '   ' } });
    expect(sendButton).toBeDisabled();
  });

  it('filters FAQ list based on search query', () => {
    renderSupportPage();
    const searchInput = screen.getByPlaceholderText('Search FAQ...');

    fireEvent.change(searchInput, { target: { value: 'reschedule' } });
    expect(screen.getByText('How do I reschedule a cleaning appointment?')).toBeInTheDocument();
  });
});
