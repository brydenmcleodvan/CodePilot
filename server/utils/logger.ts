export async function logError(message: string, userId?: number, stack?: string): Promise<void> {
  console.error(`Error: ${message}`, { userId, stack });
}