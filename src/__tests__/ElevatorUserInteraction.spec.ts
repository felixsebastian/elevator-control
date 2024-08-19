import { ElevatorUserInteraction } from "../ElevatorUserInteraction";
import {
  ElevatorDirection,
  ElevatorStatus,
  InternalControl,
  InternalControlEventHandlers,
} from "../types";

describe("ElevatorUserInteraction", () => {
  let elevatorUserInteraction: ElevatorUserInteraction;
  let internalControlMock: jest.Mocked<InternalControl>;
  let handlers: InternalControlEventHandlers;

  beforeEach(() => {
    internalControlMock = {
      getCurrentStatus: jest.fn(),
      getCurrentDirection: jest.fn(),
      getCurrentFloor: jest.fn(),
      startMoveUp: jest.fn(),
      startMoveDown: jest.fn(),
    } as unknown as jest.Mocked<InternalControl>;

    elevatorUserInteraction = new ElevatorUserInteraction(
      (providedHandlers) => {
        handlers = providedHandlers;
        return internalControlMock;
      }
    );
  });

  describe("requestAnElevator", () => {
    it("should start moving up when an elevator is requested from a lower floor", () => {
      internalControlMock.getCurrentFloor.mockReturnValue(2);
      internalControlMock.getCurrentStatus.mockReturnValue(ElevatorStatus.Idle);
      elevatorUserInteraction.requestAnElevator(5, ElevatorDirection.Up);
      expect(internalControlMock.startMoveUp).toHaveBeenCalled();
    });

    it("should start moving down when an elevator is requested from a higher floor", () => {
      internalControlMock.getCurrentFloor.mockReturnValue(5);
      internalControlMock.getCurrentStatus.mockReturnValue(ElevatorStatus.Idle);
      elevatorUserInteraction.requestAnElevator(2, ElevatorDirection.Down);
      expect(internalControlMock.startMoveDown).toHaveBeenCalled();
    });
  });

  it("should handle a floor request correctly while moving up", () => {
    internalControlMock.getCurrentFloor.mockReturnValue(3);

    internalControlMock.getCurrentDirection.mockReturnValue(
      ElevatorDirection.Down
    );

    elevatorUserInteraction.requestAFloor(6);
    expect(elevatorUserInteraction.getCurrentRequests()).toContain(6);
  });

  describe("shouldStopAtFloor", () => {
    it("should return true if the elevator is moving up and the requested floor is on the way", () => {
      internalControlMock.getCurrentFloor.mockReturnValue(3);
      elevatorUserInteraction.requestAFloor(5);
      expect(handlers.shouldStopAtFloor(5, ElevatorDirection.Up)).toBe(true);
    });

    it("should return false if the elevator is moving up and the requested floor is not on the way", () => {
      internalControlMock.getCurrentFloor.mockReturnValue(3);

      internalControlMock.getCurrentStatus.mockReturnValue(
        ElevatorStatus.Running
      );

      internalControlMock.getCurrentDirection.mockReturnValue(
        ElevatorDirection.Up
      );

      elevatorUserInteraction.requestAFloor(1);
      expect(handlers.shouldStopAtFloor(2, ElevatorDirection.Up)).toBe(false);
    });
  });

  it("should handle a floor request correctly while moving down", () => {
    internalControlMock.getCurrentFloor.mockReturnValue(7);

    internalControlMock.getCurrentDirection.mockReturnValue(
      ElevatorDirection.Down
    );

    elevatorUserInteraction.requestAFloor(4);
    expect(elevatorUserInteraction.getCurrentRequests()).toContain(4);
  });

  it("should clear the floor request when the elevator stops at that floor", () => {
    elevatorUserInteraction.requestAFloor(4);
    handlers.onStop(4, ElevatorDirection.Up);
    expect(elevatorUserInteraction.getCurrentRequests()).not.toContain(4);
  });
});
