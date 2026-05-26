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
import Game from "../../../week1/scripts/System/Game";
import GameContext from "../Controllers/GameContext";

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
    // 檢查是否有設定 target（視覺或碰撞用的子節點），若無則不繼續初始化
    if (!this.target) {
      return;
    }

    // 從 target 取得 Collider2D，之後用來監聽碰撞事件
    this.collider = this.target.getComponent(Collider2D);
    if (this.collider) {
      // 當碰撞開始時，呼叫 onBeginContact（由繼承類別實作具體行為）
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      // 當碰撞結束時，呼叫 onEndContact（由繼承類別實作具體行為）
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // 啟用 2D 物理系統（確保碰撞事件會被觸發）
    PhysicsSystem2D.instance.enable = true;

    Game.context.node.on(GameContext.EVENT_TYPE.GameReset, this._reset, this);
  }
  
  // 子類別需實作：處理碰撞開始的邏輯（例如玩家接觸物件時要觸發的行為）
  protected abstract onBeginContact(self: Collider2D, other: Collider2D);

  // 子類別需實作：處理碰撞結束的邏輯（例如玩家離開時的後續處理）
  protected abstract onEndContact(self: Collider2D, other: Collider2D);
}
