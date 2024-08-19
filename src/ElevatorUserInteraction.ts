import {
  ElevatorDirection,
  ElevatorStatus,
  InternalControl,
  InternalControlEventHandlers,
} from "./types";

interface Request {
  floor: number;
  direction: ElevatorDirection;
}

export class ElevatorUserInteraction {
  private internalControl: InternalControl;
  private pendingRequests: Request[] = [];
  private destinationQueue: number[] = [];

  constructor(
    internalControlFactory: (
      handlers: InternalControlEventHandlers
    ) => InternalControl
  ) {
    this.internalControl = internalControlFactory({
      shouldStopAtFloor: this.shouldStopAtFloor.bind(this),
      onStop: this.onStop.bind(this),
    });
  }

  requestAnElevator(originFloor: number, direction: ElevatorDirection) {
    this.pendingRequests.push({ floor: originFloor, direction });
    this.processRequests();
  }

  requestAFloor(destinationFloor: number) {
    if (!this.destinationQueue.includes(destinationFloor)) {
      this.destinationQueue.push(destinationFloor);
    }

    this.processRequests();
  }

  getCurrentRequests() {
    return this.destinationQueue;
  }

  private shouldStopAtFloor(
    floor: number,
    direction: ElevatorDirection
  ): boolean {
    if (this.destinationQueue.includes(floor)) return true;

    return this.pendingRequests.some(
      (request) => request.floor === floor && request.direction === direction
    );
  }

  private onStop(floor: number, direction: ElevatorDirection) {
    this.destinationQueue = this.destinationQueue.filter((f) => f !== floor);

    this.pendingRequests = this.pendingRequests.filter(
      (request) => request.floor !== floor || request.direction !== direction
    );

    this.processRequests();
  }

  private processRequests() {
    if (this.internalControl.getCurrentStatus() === ElevatorStatus.Running) {
      // Elevator is already running, no need to start it again
      return;
    }

    if (this.pendingRequests.length > 0 || this.destinationQueue.length > 0) {
      const currentFloor = this.internalControl.getCurrentFloor();
      const direction = this.getNextDirection(currentFloor);

      if (direction === ElevatorDirection.Up) {
        this.internalControl.startMoveUp();
      } else if (direction === ElevatorDirection.Down) {
        this.internalControl.startMoveDown();
      }
    }
  }

  private getNextDirection(currentFloor: number): ElevatorDirection | null {
    const upRequests = this.pendingRequests.filter(
      (request) => request.floor > currentFloor
    );

    const downRequests = this.pendingRequests.filter(
      (request) => request.floor < currentFloor
    );

    const upDestinations = this.destinationQueue.filter(
      (floor) => floor > currentFloor
    );

    const downDestinations = this.destinationQueue.filter(
      (floor) => floor < currentFloor
    );

    if (upRequests.length > 0 || upDestinations.length > 0) {
      return ElevatorDirection.Up;
    } else if (downRequests.length > 0 || downDestinations.length > 0) {
      return ElevatorDirection.Down;
    }

    return null;
  }
}
