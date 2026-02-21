import {
  _decorator,
  Component,
  Animation,
  Collider2D,
  director,
  Node,
  PhysicsSystem2D,
  Contact2DType,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("door")
export class door extends Component {
  @property
  public keyName = "key";

  @property
  public openAnim = "open";

  @property(Node)
  winBoard: Node;

  private _isOpen = false;

  protected start() {
    director.on("key-collected", this._onKeyCollected, this);
    const collider = this.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }
  }

  private _onKeyCollected(name: string) {
    if (name === this.keyName) {
      this._open();
    }
  }

  private _open() {
    const anim = this.getComponent(Animation);
    if (anim && this.openAnim) anim.play(this.openAnim);
    this._isOpen = true;
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    console.log("door contact", other.tag);
    if (other.tag === 0 && this._isOpen) {
      this.winBoard.active = true;
    }
  }

  protected onDestroy() {
    director.off("key-collected", this._onKeyCollected, this);
  }
}
