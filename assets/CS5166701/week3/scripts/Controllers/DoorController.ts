import {
  _decorator,
  Component,
  Animation,
  Collider2D,
  director,
  Node,
  PhysicsSystem2D,
  Contact2DType,
  Enum,
} from "cc";
import KeyController from "./KeyController";
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import Game from "../../../week1/scripts/System/Game";
import { WinBoard } from "../UI/WinBoard";

const { ccclass, property } = _decorator;

// TODO: Door 跟 Key 應放一起，並用陣列控制多組對應關係
@ccclass("DoorController")
export default class DoorController extends Component {
  @property(Node)
  public readonly target: Node = null;

  @property({type: Enum(DataType.Group)})
  public readonly keyGroup: DataType.Group = DataType.Group.Item;

  @property({type: Enum(DataType.Item)})
  public readonly keyTag: DataType.Item = DataType.Item.KeyYellow;


  @property
  public readonly openAnim: string = "open";

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  private _isOpen = false;

  protected start() {
    Game.context.playerController.node.on(
      PlayerController.EVENT_TYPE.KeyCollected,
      this._onKeyCollected,
      this,
    );
    const collider = this.target.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }
  }

  protected onDestroy() {
    Game.context.playerController.node.off(
      PlayerController.EVENT_TYPE.KeyCollected,
      this._onKeyCollected,
      this,
    );
  }

  private _onKeyCollected(group: DataType.Group, tag: DataType.Item) {
    if (+group === +this.keyGroup && +tag === +this.keyTag) {
      this._open();
    }
  }

  private _open() {
    const anim = this.target.getComponent(Animation);
    if (anim && this.openAnim) {
      anim.play(this.openAnim);
    }
    this._isOpen = true;
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.group === DataType.Group.Player && this._isOpen) {
      this.winBoard.win();
    }
  }
}
