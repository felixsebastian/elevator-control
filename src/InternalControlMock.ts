import {
  ElevatorDirection,
  ElevatorStatus,
  InternalControl,
  InternalControlEventHandlers,
} from "./types";

const TRAVEL_TIME = 1000;

// Helper function to mimic time passing
export function wait(round: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, round * TRAVEL_TIME);
  });
}

export class InternalControlMock implements InternalControl {
  private status: ElevatorStatus = ElevatorStatus.Idle;
  private direction: ElevatorDirection = ElevatorDirection.Up;
  private floor = 0;

  constructor(
    private eventHandlers: InternalControlEventHandlers,
    private minFloor: number,
    private maxFloor: number
  ) {
    return this;
  }

  getCurrentStatus(): ElevatorStatus {
    return this.status;
  }

  getCurrentFloor(): number {
    return this.floor;
  }

  getCurrentDirection(): ElevatorDirection {
    return this.direction;
  }

  private async move(direction: ElevatorDirection): Promise<void> {
    if (this.status === ElevatorStatus.Running) {
      throw new Error("Elevator is already running");
    }

    this.status = ElevatorStatus.Running;
    console.log(`Elevator is moving ${direction}`);

    this.direction = direction;
    const delta = direction === ElevatorDirection.Up ? 1 : -1;

    while (
      direction === ElevatorDirection.Up
        ? this.floor < this.maxFloor
        : this.floor > this.minFloor
    ) {
      const shouldStop = this.eventHandlers.shouldStopAtFloor(
        this.floor + delta,
        direction
      );
      await wait(1);
      this.floor += delta;

      if (shouldStop) {
        break;
      }
    }

    this.status = ElevatorStatus.Idle;
    this.eventHandlers.onStop(this.floor, direction);
  }

  startMoveDown(): void {
    this.move(ElevatorDirection.Down);
  }

  startMoveUp(): void {
    this.move(ElevatorDirection.Up);
  }
}
