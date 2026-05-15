import type { PlayerController } from "../PlayerController";
import { IPlayerState } from "./State";

export class JumpState implements IPlayerState {
  enter(controller: PlayerController): void {
    controller.animation.play(controller.jumpAnim);
  }
}
