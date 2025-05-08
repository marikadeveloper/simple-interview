import { useSearchParams } from 'react-router';

export function useQueryParam(
  key: string,
  multiple: boolean = false,
): string[] | string | null {
  const [searchParams] = useSearchParams();
  let param;
  if (multiple) {
    param = searchParams.getAll(key);
  } else {
    param = searchParams.get(key);
  }
  return param;
}
