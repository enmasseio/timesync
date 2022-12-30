declare module "timesync" {
  type TimeSync = {
    destroy();
    now(): number;
    on(event: "change", callback: (offset: number) => void);
    on(event: "error", callback: (err: any) => void);
    on(event: "sync", callback: (value: "start" | "end") => void);
    off(event: "change" | "error" | "sync", callback?: () => void);
    sync();

    send(to: string, data: object, timeout: number): Promise<void>;
    receive(from: string, data: object);
  };

  type TimeSyncCreateOptions = {
    interval?: number;
    timeout?: number;
    delay?: number;
    repeat?: number;
    peers?: string | string[];
    server?: string;
    now?: () => number;
  };

  function create(options: TimeSyncCreateOptions): TimeSync;

  export = TimeSync;
}

declare module 'timesync/server' {
  import type { Request, Response } from 'express';
  import type { createServer as createHttpServer, Server } from 'http';
  function requestHandler(req: Request, res: Response): void;

  function createServer(): ReturnType<typeof createHttpServer>;

  function attachServer(server: Server, path?: string): void;
}
