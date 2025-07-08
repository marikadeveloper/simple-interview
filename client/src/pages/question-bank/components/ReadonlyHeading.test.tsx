import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReadonlyHeading } from './ReadonlyHeading';

// Mock the Button and PageTitle components (shadcn/ui, simple wrappers)
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock('@/components/ui/page-title', () => ({
  PageTitle: (props: any) => <h1>{props.children}</h1>,
}));

// Mock Pencil icon (lucide-react)
vi.mock('lucide-react', () => ({
  Pencil: () => <svg data-testid='pencil-icon' />,
}));

describe('ReadonlyHeading (question-bank)', () => {
  const questionBank = {
    __typename: 'QuestionBank',
    id: 5,
    name: 'Frontend Bank',
    slug: 'frontend-bank',
  };

  it('renders the question bank name', () => {
    const setFormVisible = vi.fn();
    render(
      <ReadonlyHeading
        questionBank={questionBank as any}
        setFormVisible={setFormVisible}
      />,
    );
    expect(screen.getByText('Frontend Bank')).toBeInTheDocument();
  });

  it('calls setFormVisible(true) when edit button is clicked', async () => {
    const setFormVisible = vi.fn();
    const user = userEvent.setup();
    render(
      <ReadonlyHeading
        questionBank={questionBank as any}
        setFormVisible={setFormVisible}
      />,
    );
    const editBtn = screen.getByRole('button');
    await user.click(editBtn);
    expect(setFormVisible).toHaveBeenCalledWith(true);
  });
});
