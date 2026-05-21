import { _decorator, Component, Node, Button, Label, Vec3 } from "cc";
import { PlayerController } from "../../../week2/scripts/Controller/PlayerController";
import Game from "../../../week1/scripts/System/Game";
const { ccclass, property } = _decorator;

@ccclass("ScoreBoard")
export class ScoreBoard extends Component {
  @property(Label)
  public readonly value: Label = null;
  @property(Node)
  public readonly camera: Node = null;
  @property(Node)
  public readonly scoreBoard: Node = null;
  @property({
    type: Vec3,
    tooltip: "World offset from camera where scoreboard will be placed",
  })
  public offset: Vec3 = new Vec3(-400, 230, 0);
  private _scoreValue = 0;

  public get score() {
    return this._scoreValue;
  }
  protected start() {
    Game.context.playerController.node.on(
      PlayerController.EVENT_TYPE.CoinCollected,
      this._score,
      this,
    );
    // initial alignment
    this.syncToCamera();
  }
  protected update(deltaTime: number) {
    this.syncToCamera();
  }

  protected syncToCamera() {
    if (!this.camera || !this.scoreBoard) return;
    const camPos = new Vec3();
    this.camera.getWorldPosition(camPos);
    const target = new Vec3();
    Vec3.add(target, camPos, this.offset);
    this.scoreBoard.setWorldPosition(target);
  }
  private _score() {
    this._scoreValue++;
    this.value.string = this._scoreValue.toString();
  }
}
