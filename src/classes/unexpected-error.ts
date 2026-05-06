class UnexpectedError extends Error {
  status: number;

  constructor(message: string, status?: number) {
    super(`💥💥💥 ${message}`);
    this.name = 'UnexpectedError';
    this.status = status ?? 500;
  }
}

export default UnexpectedError;
