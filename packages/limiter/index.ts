interface LimiterStorage {
  get(id: string): Promise<Client | undefined>
  set(id: string, client: Client): Promise<void>
}

export interface CreateLimiterOptions {
  requestsPerWindow: number,
  windowInSeconds: number,
  storage: LimiterStorage
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

export type Limiter = (id: string) => Promise<Limited | NotLimited | Error>

export const createLimiter = (options: CreateLimiterOptions): Limiter => {
  return async (id: string) => {
    try {

      const foundClientForId = await options.storage.get(id);

      if (!foundClientForId) {
        const client: Client = {
          availableRequests: options.requestsPerWindow,
          requestedAt: new Date()
        };

        await options.storage.set(id, client);

        return {
          status: "available",
          availableRequests: client.availableRequests,
          unlockedAt: new Date(client.requestedAt.getTime()).setSeconds(client.requestedAt.getSeconds() + options.windowInSeconds)
        };
      }

      const unlockedAt = new Date(foundClientForId.requestedAt.getTime())
      const now = new Date()

      unlockedAt.setSeconds(unlockedAt.getSeconds() + options.windowInSeconds);

      if (unlockedAt < now) {
        await options.storage.set(id, {
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
        await options.storage.set(id, {
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

export class InMemoryLimiterStorage implements LimiterStorage {
  private readonly map: Map<string, Client> = new Map();

  public async get(id: string): Promise<Client | undefined> {
    return this.map.get(id);
  }

  public async set(id: string, client: Client): Promise<void> {
    this.map.set(id, client);
  }
}