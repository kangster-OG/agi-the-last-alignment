export class Client {
  constructor(...args: any[]);
  joinOrCreate<T = any>(...args: any[]): Promise<Room<T>>;
  joinById<T = any>(...args: any[]): Promise<Room<T>>;
  create<T = any>(...args: any[]): Promise<Room<T>>;
}

export interface Room<TState = any> {
  [key: string]: any;
  id: string;
  sessionId: string;
  state: TState;
  send(type: string, message?: any): void;
  leave(...args: any[]): Promise<void> | void;
  onMessage(type: string | number, callback: (...args: any[]) => void): void;
  onStateChange(callback: (state: TState) => void): void;
  onError(callback: (...args: any[]) => void): void;
  onLeave(callback: (...args: any[]) => void): void;
}
