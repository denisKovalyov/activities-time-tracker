export class EmailNotVerifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

export class EmailRateLimit extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailRateLimit';
  }
}
