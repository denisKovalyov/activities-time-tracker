import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Please use valid email',
  }),
  password: z.string().min(8, {
    message: 'Password should have at least 8 symbols',
  }),
});

const ERROR_CODE_CUSTOM = z.ZodIssueCode.custom;

export const LENGTH_REQUIREMENT = 'length between 8 and 36 symbols';
export const UPPER_LOWER_CASE_REQUIREMENT = 'at least one upper and lower case letter';
export const NUMBER_REQUIREMENT = 'at least one number';
export const SPECIAL_CHAR_REQUIREMENT = 'at least one special character';

const PasswordComplexity = z.string()
    .superRefine((password, ctx) => {
      const length = password.length >= 8 && password.length <= 36;
      const lowerCase = /[a-z]/.test(password);
      const upperCase = /[A-Z]/.test(password);
      const number = /[0-9]/.test(password);
      const specialCharacters = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(password);

      if (!length) {
        ctx.addIssue({
          code: ERROR_CODE_CUSTOM,
          message: LENGTH_REQUIREMENT,
        })
      }

      if (!lowerCase || !upperCase) {
        ctx.addIssue({
          code: ERROR_CODE_CUSTOM,
          message: UPPER_LOWER_CASE_REQUIREMENT,
        })
      }

      if (!number) {
        ctx.addIssue({
          code: ERROR_CODE_CUSTOM,
          message: NUMBER_REQUIREMENT,
        })
      }

      if (!specialCharacters) {
        ctx.addIssue({
          code: ERROR_CODE_CUSTOM,
          message: SPECIAL_CHAR_REQUIREMENT,
        })
      }
    });

export const SignUpSchema = z.object({
  email: z.string().email({
    message: 'Please use valid email',
  }),
  password: PasswordComplexity,
});

export type Requirement = typeof LENGTH_REQUIREMENT | typeof UPPER_LOWER_CASE_REQUIREMENT | typeof NUMBER_REQUIREMENT | typeof SPECIAL_CHAR_REQUIREMENT;
export const validatePassword = (password: string) => {
  const validatedFields = PasswordComplexity.safeParse(password);

  if (!validatedFields.success) {
    return validatedFields.error.flatten().formErrors as Requirement[];
  }
};
