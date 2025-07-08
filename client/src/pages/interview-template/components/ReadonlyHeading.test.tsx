import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReadonlyHeading } from './ReadonlyHeading';

// Mock the Button, PageTitle, PageSubtitle components (shadcn/ui, simple wrappers)
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock('@/components/ui/page-title', () => ({
  PageTitle: (props: any) => <h1>{props.children}</h1>,
}));
vi.mock('@/components/ui/page-subtitle', () => ({
  PageSubtitle: (props: any) => <h2>{props.children}</h2>,
}));

// Mock Pencil icon (lucide-react)
vi.mock('lucide-react', () => ({
  Pencil: () => <svg data-testid='pencil-icon' />,
}));

// Mock react-router Link
vi.mock('react-router', () => ({
  Link: (props: any) => (
    <a
      href={props.to}
      {...props}
    />
  ),
}));

describe('ReadonlyHeading', () => {
  const baseTemplate = {
    id: 1,
    name: 'Frontend Interview',
    description: 'A test template',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    slug: 'frontend-interview',
    tags: [
      { id: 10, text: 'React', __typename: 'Tag' },
      { id: 11, text: 'UI', __typename: 'Tag' },
    ],
    __typename: 'InterviewTemplate',
  };

  it('renders the title, description, and tags', () => {
    const setFormVisible = vi.fn();
    render(
      <ReadonlyHeading
        interviewTemplate={baseTemplate as any}
        setFormVisible={setFormVisible}
      />,
    );
    expect(screen.getByText('Frontend Interview')).toBeInTheDocument();
    expect(screen.getByText('A test template')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
  });

  it('renders tag links with correct href', () => {
    const setFormVisible = vi.fn();
    render(
      <ReadonlyHeading
        interviewTemplate={baseTemplate as any}
        setFormVisible={setFormVisible}
      />,
    );
    const tagLinks = screen.getAllByRole('link');
    expect(tagLinks[0]).toHaveAttribute('href', '/interview-templates?tags=10');
    expect(tagLinks[1]).toHaveAttribute('href', '/interview-templates?tags=11');
  });

  it('calls setFormVisible(true) when edit button is clicked', async () => {
    const setFormVisible = vi.fn();
    const user = userEvent.setup();
    render(
      <ReadonlyHeading
        interviewTemplate={baseTemplate as any}
        setFormVisible={setFormVisible}
      />,
    );
    const editBtn = screen.getByRole('button');
    await user.click(editBtn);
    expect(setFormVisible).toHaveBeenCalledWith(true);
  });

  it('renders gracefully with no tags', () => {
    const setFormVisible = vi.fn();
    const templateNoTags = { ...baseTemplate, tags: null };
    render(
      <ReadonlyHeading
        interviewTemplate={templateNoTags as any}
        setFormVisible={setFormVisible}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
