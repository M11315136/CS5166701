import {
  _decorator,
  Component,
  Collider2D,
  Contact2DType,
  director,
  PhysicsSystem2D,
  UIOpacity,
  Node,
} from "cc";
import { DataStructure } from "../DataStructure";
const { ccclass, property } = _decorator;

export enum EventType {
  KeyCollected = "key-collected",
}

@ccclass("Key")
class Key {
  @property
  public readonly name = "keyYellow";

  @property(Node)
  public readonly target: Node = null;
}

@ccclass("KeyController")
export default class KeyController extends Component {
  public static EVENT_TYPE = EventType;
  @property([Key])
  public readonly keys: Key[] = [];

  private _tag2KeyMap: Map<number, Key> = new Map();

  protected start() {
    this.keys.forEach((key) => {
      const collider = key.target.getComponent(Collider2D);
      this._tag2KeyMap.set(collider.tag, key);
      if (collider) {
        PhysicsSystem2D.instance.enable = true;
        collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
      }
    });
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === DataStructure.Tag.Player) {
      const key = this._tag2KeyMap.get(self.tag);
      if (!key) {
        return;
      }
      this.node.emit(KeyController.EVENT_TYPE.KeyCollected, key.name);
      key.target
        .getComponent(Collider2D)
        .off(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
      key.target.getComponent(UIOpacity).opacity = 0;
    }
  }
}
