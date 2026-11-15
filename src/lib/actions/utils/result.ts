import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

// What every server action returns. `message` is shown in a toast,
// `fieldErrors` are validation errors for the fields of a form.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export const success = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const failure = (
  error: unknown,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionResult<never> => ({
  ok: false,
  message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
  fieldErrors,
});
