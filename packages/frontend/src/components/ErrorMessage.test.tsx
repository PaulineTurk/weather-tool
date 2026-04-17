import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render the error message', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeVisible();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = () => { };
    render(<ErrorMessage message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: "/retry/i" });
    expect(retryButton).toBeVisible();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
