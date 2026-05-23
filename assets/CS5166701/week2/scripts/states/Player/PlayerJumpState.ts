import { AudioManager } from "../../AudioManager";
import GameAudio from "../../AudioNameConfig";
import { BaseJumpState } from "../Base/BaseJumpState";

export class PlayerJumpState extends BaseJumpState {
  public enter(): void {
    super.enter();
    AudioManager.instance.playEffect(GameAudio.Effect.Jump);
  }

  public exit(): void {}
}
