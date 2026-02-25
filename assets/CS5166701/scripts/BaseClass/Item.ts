import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  Enum,
  Node,
} from "cc";
import { DataType } from "../Game/DataStructure";

const { ccclass, property } = _decorator;

// TODO: MVC 須拆出 Model 來控制 Item 資訊，再透過 Controller 串接
@ccclass("Item")
export default abstract class Item extends Component {
    @property({type: Enum(DataType.Tag)})
    public readonly tag: DataType.Tag = DataType.Tag.KeyYellow;

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
    }
    protected abstract onBeginContact(self: Collider2D, other: Collider2D);
    protected abstract onEndContact(self: Collider2D, other: Collider2D);
}