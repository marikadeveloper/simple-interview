import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreateTemplateDialog } from './CreateTemplateDialog';

// Mock the mutations
const mockCreateInterviewTemplate = vi.fn();
const mockCreateTag = vi.fn();

// Mock useMutationWithToast to return the mock functions
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useCreateInterviewTemplateMutation: () => [
      null,
      mockCreateInterviewTemplate,
    ],
    useCreateTagMutation: () => [null, mockCreateTag],
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the MultiSelect component
vi.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({
    onValueChange,
    defaultValue,
    placeholder,
    allowCreate,
    onCreateOption,
  }: any) => (
    <div data-testid='multi-select'>
      <input
        data-testid='multi-select-input'
        placeholder={placeholder}
        onChange={(e) => onValueChange([e.target.value])}
        defaultValue={defaultValue?.join(',') || ''}
      />
      {allowCreate && (
        <button
          data-testid='create-tag-btn'
          onClick={() => onCreateOption('New Tag')}>
          Add New Tag
        </button>
      )}
    </div>
  ),
}));

function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('CreateTemplateDialog', () => {
  const mockTags = [
    { label: 'Frontend', value: '1' },
    { label: 'Backend', value: '2' },
    { label: 'Full Stack', value: '3' },
  ];

  beforeEach(() => {
    mockCreateInterviewTemplate.mockReset();
    mockCreateTag.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the dialog button', () => {
    render(<CreateTemplateDialog tags={mockTags} />);
    expect(
      screen.getByRole('button', { name: /add template/i }),
    ).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    await user.click(screen.getByRole('button', { name: /add template/i }));

    expect(screen.getByText('Create Interview Template')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a new interview template. You can add or create tags.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select')).toBeInTheDocument();
  });

  it('submits form with valid data and calls createInterviewTemplate', async () => {
    mockCreateInterviewTemplate.mockResolvedValue({
      data: {
        createInterviewTemplate: {
          id: 1,
          slug: 'test-template',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );

    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateInterviewTemplate).toHaveBeenCalledWith({
        input: {
          name: 'Test Template',
          description: 'This is a test template description',
          tagsIds: [],
        },
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/interview-templates/test-template',
      );
    });
  });

  it('submits form with tags selected', async () => {
    mockCreateInterviewTemplate.mockResolvedValue({
      data: {
        createInterviewTemplate: {
          id: 1,
          slug: 'test-template',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );

    // Select tags
    await user.type(screen.getByTestId('multi-select-input'), '1');

    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateInterviewTemplate).toHaveBeenCalledWith({
        input: {
          name: 'Test Template',
          description: 'This is a test template description',
          tagsIds: [1],
        },
      });
    });
  });

  it('shows validation error if name is too short', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Try to submit with short name
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description',
    );
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if description is too short', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Try to submit with short description
    await user.type(screen.getByLabelText('Name'), 'Valid Name');
    await user.type(screen.getByLabelText('Description'), 'Aaa');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Description must be at least 5 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if name is empty', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Try to submit with empty name
    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description',
    );
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if description is empty', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Try to submit with empty description
    await user.type(screen.getByLabelText('Name'), 'Valid Name');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Description must be at least 5 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Verify dialog is open
    expect(screen.getByText('Create Interview Template')).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Verify dialog is closed
    await waitFor(() => {
      expect(
        screen.queryByText('Create Interview Template'),
      ).not.toBeInTheDocument();
    });
  });

  it('resets form when dialog is closed', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Reopen dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Verify form is reset
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('handles createInterviewTemplate error gracefully', async () => {
    mockCreateInterviewTemplate.mockResolvedValue({
      data: null,
      error: 'Failed to create interview template',
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill and submit form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateInterviewTemplate).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should remain open
    expect(screen.getByText('Create Interview Template')).toBeInTheDocument();
  });

  it('handles createInterviewTemplate success with no data gracefully', async () => {
    mockCreateInterviewTemplate.mockResolvedValue({
      data: { createInterviewTemplate: null },
      error: null,
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill and submit form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateInterviewTemplate).toHaveBeenCalled();
    });

    // Should not navigate if no data returned
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should remain open
    expect(screen.getByText('Create Interview Template')).toBeInTheDocument();
  });

  it('creates new tag when create tag button is clicked', async () => {
    mockCreateTag.mockResolvedValue({
      data: {
        createTag: {
          id: 4,
          text: 'New Tag',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Click create tag button
    await user.click(screen.getByTestId('create-tag-btn'));

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith({
        text: 'New Tag',
      });
    });
  });

  it('handles createTag error gracefully', async () => {
    mockCreateTag.mockResolvedValue({
      data: null,
      error: 'Failed to create tag',
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Click create tag button
    await user.click(screen.getByTestId('create-tag-btn'));

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalled();
    });

    // Should not close dialog on error
    expect(screen.getByText('Create Interview Template')).toBeInTheDocument();
  });

  it('submits form when Enter key is pressed', async () => {
    mockCreateInterviewTemplate.mockResolvedValue({
      data: {
        createInterviewTemplate: {
          id: 1,
          slug: 'test-template',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Template');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test template description',
    );

    // Press Enter in the name field
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockCreateInterviewTemplate).toHaveBeenCalledWith({
        input: {
          name: 'Test Template',
          description: 'This is a test template description',
          tagsIds: [],
        },
      });
    });
  });

  it('does not submit form when Enter is pressed with invalid data', async () => {
    const { user } = setup(<CreateTemplateDialog tags={mockTags} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add template/i }));

    // Try to submit with short name using Enter
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description',
    );
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });

    // Should not call the mutation
    expect(mockCreateInterviewTemplate).not.toHaveBeenCalled();
  });
});
