import { toast } from 'sonner';
import { AnyVariables, UseMutationResponse } from 'urql';

type MutationHook<T, V extends AnyVariables> = () => UseMutationResponse<T, V>;

export function useMutationWithToast<T, V extends AnyVariables>(
  mutationHook: MutationHook<T, V>,
  {
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
  }: {
    successMessage?: string;
    errorMessage?: string;
  } = {},
) {
  const [result, executeMutation] = mutationHook();

  const executeWithToast = async (variables: V) => {
    try {
      const response = await executeMutation(variables);

      if (response.error) {
        toast.error(errorMessage, {
          description: response.error.message,
        });
        return response;
      }

      toast.success(successMessage);
      return response;
    } catch (error) {
      toast.error(errorMessage, {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  };

  return [result, executeWithToast] as const;
}
