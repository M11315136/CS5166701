import { _decorator, Collider2D, Contact2DType, UIOpacity } from "cc";
import Item from "./Item";
import Game from "../../../week1/scripts/System/Game";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { Inventory } from "../UI/Inventory";

const { ccclass, property } = _decorator;

@ccclass("Key")
export default class Key extends Item {
  protected onBeginContact(self: Collider2D, other: Collider2D) {
    // 當有物件接觸到 key 的 collider
    if (other.group === DataType.Group.Player) {

      // 通知 PlayerController：玩家已撿到鑰匙，傳遞該鑰匙的群組與標籤
      Game.context.playerController.node.emit(
        PlayerController.EVENT_TYPE.KeyCollected,
        this.group,
        this.tag,
      );

      // 撿到鑰匙後移除碰撞監聽，避免重複觸發事件
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

      // 將視覺物件設為透明，視覺上表示物件已被移除
      this.target.getComponent(UIOpacity).opacity = 0;
    }
  }

  // 碰撞結束時的處理（目前無額外行為，但保留以便未來擴充）
  protected onEndContact(self: Collider2D, other: Collider2D) {}
}
