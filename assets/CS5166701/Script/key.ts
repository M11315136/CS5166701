import {
  _decorator,
  Component,
  Collider2D,
  Contact2DType,
  director,
  PhysicsSystem2D,
  UIOpacity,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("key")
export class key extends Component {
  @property
  public keyName = "keyYellow";

  protected start() {
    const collider = this.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  private onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === 0) {
      director.emit("key-collected", this.keyName);
      this.getComponent(Collider2D).off(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this,
      );
      this.getComponent(UIOpacity).opacity = 0;
    }
  }
}
