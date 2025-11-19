/** 
  Handles getting value from environment file for given variable name.
  Throws error if no value found in env file for given variable name
*/
export function env(variable: string): string {
  const value = process.env[variable];
  if (!value) {
    throw new Error(`Critical env variable ${variable} not defined`);
  }
  return value;
}
