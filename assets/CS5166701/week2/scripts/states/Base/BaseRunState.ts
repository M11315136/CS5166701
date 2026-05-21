import { BaseState } from "./BaseState";

export class BaseRunState extends BaseState {
  public enter(): void {
    this.controller.animation.play(this.controller.walkAnim);
  }
}
