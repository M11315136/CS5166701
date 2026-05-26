import { _decorator, Collider2D, Contact2DType, UIOpacity } from "cc";
import Item from "./Item";
import Game from "../../../week1/scripts/System/Game";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import { DataType } from "../../../week1/scripts/Data/DataStructure";

const { ccclass, property } = _decorator;

@ccclass("Coin")
export default class Coin extends Item {
  protected onBeginContact(self: Collider2D, other: Collider2D) {
    // 如果碰撞對象是玩家，則視為撿到金幣
    if (other.group === DataType.Group.Player) {
      // 通知遊戲主要的 PlayerController：玩家已撿到金幣（把本物件作為參數傳遞）
      Game.context.playerController.node.emit(
        PlayerController.EVENT_TYPE.CoinCollected,
        this,
      );

      // 撿取後取消本物件的碰撞監聽，避免重複觸發
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

      // 將視覺上的 target 透明化，模擬物件被撿走
      this.target.getComponent(UIOpacity).opacity = 0;
    }
  }

  // 當碰撞結束時的處理（目前未使用，可於需要時覆寫）
  protected onEndContact(self: Collider2D, other: Collider2D) {}

  private _reset() {
    // 重置金幣狀態：重新啟用碰撞監聽，並將視覺物件恢復可見
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
    if (this.target) {
      this.target.getComponent(UIOpacity).opacity = 255;
    }
  }
}
