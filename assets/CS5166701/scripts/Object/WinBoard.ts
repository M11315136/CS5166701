import { _decorator, Component, Node, Button, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("WinBoard")
export class WinBoard extends Component {
  @property(Node)
  public readonly winBoard: Node = null;
  @property(Label)
  public readonly label: Label = null;
  @property(Button)
  public restartBtn: Button = null;

  protected start() {
    this.restartBtn.node.on("click", this._close, this);
  }

  private _close() {
    this.node.active = false;
  }
}
