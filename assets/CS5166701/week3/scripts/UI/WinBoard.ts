import { _decorator, Component, Node, Button, Label } from "cc";
import Game from "../../../week1/scripts/System/Game";
import GameContext from "../Controllers/GameContext";
const { ccclass, property } = _decorator;

@ccclass("WinBoard")
export class WinBoard extends Component {
  @property(Node)
  public readonly winBoard: Node = null;
  @property(Label)
  public readonly label: Label = null;
  @property(Label)
  public readonly score: Label = null;
  @property(Node)
  public readonly camera: Node = null;
  @property(Button)
  public restartBtn: Button = null;

  public lose() {
    this.winBoard.active = true;
    this.winBoard.setPosition(this.camera.getPosition());
    this.label.string = "You Lose!";
    this.score.string =
      "Your Score: " + Game.context.scoreBoard.score.toString();
    Game.context.playerController.unregisterInput();
  }

  public win() {
    this.winBoard.active = true;
    this.winBoard.setPosition(this.camera.getPosition());
    this.label.string = "You Win!";
    this.score.string =
      "Your Score: " + Game.context.scoreBoard.score.toString();
  }

  protected start() {
    this.restartBtn.node.on("click", this._close, this);
  }

  private _close() {
    this.node.active = false;
  }
}
