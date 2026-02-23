import { _decorator, Component, Node } from "cc";
import KeyController from "./Controller/KeyController";
import DoorController from "./Controller/DoorController";
import Game from "./Game";

const { ccclass, property } = _decorator;

@ccclass("GameContext")
export default class GameContext extends Component {
  protected static instance: GameContext = null;

  @property(KeyController)
  public readonly keyController: KeyController = null;

  @property(DoorController)
  public readonly doorController: DoorController = null;

  protected onLoad(): void {
    Game.context = this;
  }
}
