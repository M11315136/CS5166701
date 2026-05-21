import { BaseState } from "./BaseState";

export class BaseJumpState extends BaseState {
  enter(): void {
    this.controller.animation.play(this.controller.jumpAnim);
  }
}
