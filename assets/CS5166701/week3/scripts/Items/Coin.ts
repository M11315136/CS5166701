import { _decorator, Collider2D, Contact2DType, UIOpacity } from "cc";
import Item from "./Item";
import Game from "../../../week1/scripts/System/Game";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import { DataType } from "../../../week1/scripts/Data/DataStructure";

const { ccclass, property } = _decorator;

@ccclass("Coin")
export default class Coin extends Item {


  protected onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.group === DataType.Group.Player) {

      Game.context.playerController.node.emit(
        PlayerController.EVENT_TYPE.CoinCollected,
        this
      );
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.target.getComponent(UIOpacity).opacity = 0;
    }
  }

  protected onEndContact(self: Collider2D, other: Collider2D) {}
}
