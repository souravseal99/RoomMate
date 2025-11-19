export class ApiError extends Error {
  public statusCode: number;
  public errors: { field: String; message: String }[] | undefined;

  constructor(
    statusCode: number,
    message: string,
    errors?: { field: String; message: String }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
