export function showLogs<T>(helperText: string, data: T) {
  const formattedLog = JSON.stringify(data, null, 2);
  console.log(`${helperText} =>`, formattedLog);
}
