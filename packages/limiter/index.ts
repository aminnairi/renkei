export interface CreateLimiterOptions {
  requestsPerWindow: number,
  windowInSeconds: number
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

export type Limiter = (id: string) => Limited | NotLimited

export const createLimiter = (options: CreateLimiterOptions): Limiter => {
  const idPerClient = new Map<string, Client>();

  return (id: string) => {
    const foundClientForId = idPerClient.get(id);

    if (!foundClientForId) {
      const client: Client = {
        availableRequests: options.requestsPerWindow,
        requestedAt: new Date()
      };

      idPerClient.set(id, client);

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
      idPerClient.set(id, {
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
      idPerClient.set(id, {
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
  }
}