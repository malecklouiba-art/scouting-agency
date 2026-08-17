/** Sérialise les appels avec un délai minimum entre chacun — évite de marteler l'API externe. */
export class RateLimiter {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly minDelayMs: number) {}

  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const wait = this.queue.then(() => new Promise<void>((resolve) => setTimeout(resolve, this.minDelayMs)));
    this.queue = wait;
    return wait.then(fn);
  }
}
