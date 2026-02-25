import {
  _decorator,
  Collider2D,
} from "cc";
import Item from "../BaseClass/Item";

const { ccclass, property } = _decorator;

@ccclass("Door")
export default class Door extends Item {
    protected onBeginContact(self: Collider2D, other: Collider2D) {
        
    }

    protected onEndContact(self: Collider2D, other: Collider2D) {
    
    }
}