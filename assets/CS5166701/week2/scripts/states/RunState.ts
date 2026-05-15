import type { PlayerController } from "../PlayerController";
import { IPlayerState } from "./State";

export class RunState implements IPlayerState {
  enter(controller: PlayerController): void {
    controller.animation.play(controller.walkAnim);
  }
}
