import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';

jest.mock('axios');

test('renders App and toggles Analyze/Stop button during load', async () => {
  // Mock axios.get for initial calls
  axios.get = jest.fn().mockImplementation(() => new Promise(() => {}));
  
  // Mock axios.post for search
  axios.post = jest.fn().mockImplementation(() => new Promise(() => {}));

  render(
    <MemoryRouter initialEntries={['/analyze']}>
      <App />
    </MemoryRouter>
  );

  // Initially, button should say "Analyze →"
  const analyzeBtn = screen.getByRole('button', { name: /Analyze/i });
  expect(analyzeBtn).toBeInTheDocument();

  // Find input and type query
  const input = screen.getByPlaceholderText(/Search brand or product/i);
  fireEvent.change(input, { target: { value: 'testbrand' } });

  // Click analyze
  fireEvent.click(analyzeBtn);

  // Button text should now toggle to "Stop"
  const stopBtn = screen.getByRole('button', { name: /Stop/i });
  expect(stopBtn).toBeInTheDocument();

  // Centered loader container should be present
  const loaderText = screen.getByText(/Analyzing "testbrand" across platforms/i);
  expect(loaderText).toBeInTheDocument();

  // Click Stop
  fireEvent.click(stopBtn);

  // It should reset loading state and change button back to "Analyze →"
  const analyzeBtnBack = await screen.findByRole('button', { name: /Analyze/i });
  expect(analyzeBtnBack).toBeInTheDocument();
});
