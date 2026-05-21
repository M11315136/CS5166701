import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  Enum,
  Node,
  PhysicsSystem2D
} from "cc";
import { DataType } from "../../../week1/scripts/Data/DataStructure";

const { ccclass, property } = _decorator;

// TODO: MVC 須拆出 Model 來控制 Item 資訊，再透過 Controller 串接
@ccclass("Item")
export default abstract class Item extends Component {
  @property({ type: Enum(DataType.Group) })
  public readonly group: DataType.Group = DataType.Group.Item;

  @property({ type: Enum(DataType.Item) })
  public readonly tag: DataType.Item = DataType.Item.KeyYellow;

  @property(Node)
  public readonly target: Node = null;

  protected collider: Collider2D = null;
  protected onLoad() {
    if (!this.target) {
      return;
    }
    this.collider = this.target.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    PhysicsSystem2D.instance.enable = true;
  }
  
  protected abstract onBeginContact(self: Collider2D, other: Collider2D);
  protected abstract onEndContact(self: Collider2D, other: Collider2D);
}
