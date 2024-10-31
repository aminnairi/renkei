interface LimiterStrategy {
  get(id: string): Promise<Client | undefined>
  set(id: string, client: Client): Promise<void>
}

export interface CreateLimiterOptions {
  requestsPerWindow: number,
  windowInSeconds: number,
  strategy: LimiterStrategy
}

export interface Limited {
  status: "limited",
  unlockedAt: Date
}

export interface NotLimited {
  status: "available",
  availableRequests: number
}

export interface Client {
  availableRequests: number,
  requestedAt: Date
}

export type LimitFunction = (id: string) => Promise<Limited | NotLimited | Error>

export const createLimiter = (options: CreateLimiterOptions): LimitFunction => {
  return async (id: string) => {
    try {

      const foundClientForId = await options.strategy.get(id);

      if (!foundClientForId) {
        const client: Client = {
          availableRequests: options.requestsPerWindow,
          requestedAt: new Date()
        };

        await options.strategy.set(id, client);

        const unlockedAt = new Date(client.requestedAt.getTime());

        unlockedAt.setSeconds(client.requestedAt.getSeconds() + options.windowInSeconds);

        return {
          status: "available",
          availableRequests: client.availableRequests,
          unlockedAt
        };
      }

      const unlockedAt = new Date(foundClientForId.requestedAt.getTime())
      const now = new Date()

      unlockedAt.setSeconds(unlockedAt.getSeconds() + options.windowInSeconds);

      if (unlockedAt < now) {
        await options.strategy.set(id, {
          availableRequests: options.requestsPerWindow,
          requestedAt: now
        });

        return {
          status: "available",
          availableRequests: options.requestsPerWindow,
        }
      }

      const newAvailableRequestsCount = foundClientForId.availableRequests - 1;

      if (newAvailableRequestsCount < 1) {
        await options.strategy.set(id, {
          ...foundClientForId,
          availableRequests: 0
        });

        return {
          status: "limited",
          unlockedAt
        };
      }

      return {
        status: "available",
        availableRequests: newAvailableRequestsCount
      };
    } catch (error) {
      return error;
    }
  }
}

export class InMemoryStrategy implements LimiterStrategy {
  private readonly map: Map<string, Client> = new Map();

  public async get(id: string): Promise<Client | undefined> {
    return this.map.get(id);
  }

  public async set(id: string, client: Client): Promise<void> {
    this.map.set(id, client);
  }
}