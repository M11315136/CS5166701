import type { PlayerController } from "../PlayerController";
import { IPlayerState } from "./State";

export class IdleState implements IPlayerState {
  enter(controller: PlayerController): void {
    controller.animation.play(controller.idleAnim);
  }
}
