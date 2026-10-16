import { QueryFailedError } from 'typeorm';

export interface ConstraintDriverError {
  code: PgErrorCode;
  //eg: Key (ingredientId)=(f53c8375-da5a-48ea-97b5-b24543b70332) is not present in table "ingredient".
  detail: string;
  /**
   * The name of the constraint
   */
  constraint: string;
}

//https://www.postgresql.org/docs/current/errcodes-appendix.html
export enum PgErrorCode {
  INTEGRITY_CONSTRAINT_VIOLATION = '23000',
  RESTRICT_VIOLATION = '23001',
  NOT_NULL_VIOLATION = '23502',
  FOREIGN_KEY_VIOLATION = '23503',
  UNIQUE_VIOLATION = '23505',
  CHECK_VIOLATION = '23514',
  EXCLUSION_VIOLATION = '23P01',
}

export const PG_CONSTRAINT_CODES: PgErrorCode[] = [
  PgErrorCode.INTEGRITY_CONSTRAINT_VIOLATION,
  PgErrorCode.RESTRICT_VIOLATION,
  PgErrorCode.NOT_NULL_VIOLATION,
  PgErrorCode.FOREIGN_KEY_VIOLATION,
  PgErrorCode.UNIQUE_VIOLATION,
  PgErrorCode.CHECK_VIOLATION,
  PgErrorCode.EXCLUSION_VIOLATION,
];

export function extractConstraintError(
  error: any,
): ConstraintDriverError | undefined {
  if (!(error instanceof QueryFailedError)) return undefined;

  const { code, constraint, detail } = error.driverError;
  if (
    !PG_CONSTRAINT_CODES.includes(code) ||
    typeof constraint !== 'string' ||
    typeof detail !== 'string'
  )
    return undefined;
  return { code, constraint, detail };
}
