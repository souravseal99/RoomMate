export class ApiError extends Error {
  public statusCode: number;
  public errors: { field: string; message: string }[] | undefined;

  constructor(
    statusCode: number,
    message: string,
    errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
