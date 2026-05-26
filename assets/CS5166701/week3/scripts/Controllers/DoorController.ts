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
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import Game from "../../../week1/scripts/System/Game";
import { WinBoard } from "../UI/WinBoard";
import GameContext from "./GameContext";

const { ccclass, property } = _decorator;

// TODO: Door 跟 Key 應放一起，並用陣列控制多組對應關係
@ccclass("DoorController")
export default class DoorController extends Component {
  @property(Node)
  public readonly target: Node = null;

  @property({ type: Enum(DataType.Group) })
  public readonly keyGroup: DataType.Group = DataType.Group.Item;

  @property({ type: Enum(DataType.Item) })
  public readonly keyTag: DataType.Item = DataType.Item.KeyYellow;

  @property
  public readonly openAnim: string = "open";

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  private _isOpen = false;

  protected start() {
    // 在場景開始時註冊要監聽的事件（玩家撿到鑰匙）
    // 若收到對應的鑰匙事件，會呼叫 _onKeyCollected 進行判斷
    Game.context.playerController.node.on(
      PlayerController.EVENT_TYPE.KeyCollected,
      this._onKeyCollected,
      this,
    );
    // 嘗試取得目標節點上的 Collider2D，並註冊碰撞事件監聽（玩家接觸門）
    const collider = this.target.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }

    Game.context.node.on(GameContext.EVENT_TYPE.GameReset, this._reset, this);
  }

  protected onDestroy() {
    // 離開或銷毀時，解除事件監聽，避免記憶體洩漏與多重觸發
    Game.context.playerController.node.off(
      PlayerController.EVENT_TYPE.KeyCollected,
      this._onKeyCollected,
      this,
    );
    Game.context.node.off(GameContext.EVENT_TYPE.GameReset, this._reset, this);
  }

  private _onKeyCollected(group: DataType.Group, tag: DataType.Item) {
    // 收到鑰匙收集事件時比對群組與標籤，若為本門所需的鑰匙則打開門
    if (+group === +this.keyGroup && +tag === +this.keyTag) {
      this._open();
    }
  }

  private _open() {
    // 嘗試取得目標節點上的 Animation，並播放設定好的開門動畫
    const anim = this.target.getComponent(Animation);
    if (anim && this.openAnim) {
      anim.play(this.openAnim);
    }
    // 標記門已經開啟，讓後續碰撞觸發可以正常觸發過關流程
    this._isOpen = true;
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    // 當玩家與門接觸且門已開啟時，執行過關處理（若有倒數計時則透過 countdown 處理）
    if (other.group === DataType.Group.Player && this._isOpen) {
      if (Game.context.countdown) {
        Game.context.countdown.completeWin();
      } else {
        this.winBoard.win();
      }
    }
  }

  private _reset() {
    // 重置門的狀態（關閉門、重置動畫等）
    this._isOpen = false;
    const anim = this.target.getComponent(Animation);
    if (anim) {
      anim.play("idle");
    }
  }
}
