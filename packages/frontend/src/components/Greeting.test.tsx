import { render, screen } from '@testing-library/react';
import { Greeting } from './Greeting';

describe('Greeting', () => {
  it('should render the welcome message with user name', () => {
    render(<Greeting userName="John Doe" />);

    expect(
      screen.getByRole('heading', { name: /welcome, john doe!/i })
    ).toBeVisible();
  });

  it('should render the subtitle text', () => {
    render(<Greeting userName="Jane" />);

    expect(
      screen.getByText(/here's your weather dashboard overview/i)
    ).toBeVisible();
  });
});
