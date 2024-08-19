export enum ElevatorStatus {
  Idle = "Idle",
  Running = "Running",
}

export enum ElevatorDirection {
  Up = "Up",
  Down = "Down",
}

export interface InternalControlEventHandlers {
  // Handler gets called before reaching any floor
  shouldStopAtFloor: (floor: number, direction: ElevatorDirection) => boolean;

  onStop: (floor: number, direction: ElevatorDirection) => void;
}

export interface InternalControl {
  getCurrentStatus(): ElevatorStatus;

  getCurrentDirection(): ElevatorDirection;

  getCurrentFloor(): number;

  // Make elevator starting to go up, it will stop at the floor where shouldStopAtFloor returns true
  // calling this function again while elevator is running will throw an error
  startMoveUp(): void;

  // Make elevator starting to go down, it will stop at the floor where shouldStopAtFloor returns true
  // calling this function again while elevator is running will throw an error
  startMoveDown(): void;
}
