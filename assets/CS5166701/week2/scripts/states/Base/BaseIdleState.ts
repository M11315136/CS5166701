import { BaseState } from "./BaseState";

export class BaseIdleState extends BaseState {
  enter(): void {
    this.controller.animation.play(this.controller.idleAnim);
  }
}
