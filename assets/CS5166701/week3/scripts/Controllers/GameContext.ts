import { _decorator, Component, Node } from "cc";
import Game from "../../../week1/scripts/System/Game";
import { PlayerController } from "../../../week1/scripts/Controller/PlayerController";
import KeyController from "./KeyController";
import DoorController from "./DoorController";

const { ccclass, property } = _decorator;

@ccclass("GameContext")
export default class GameContext extends Component {
  protected static instance: GameContext = null;

  @property(KeyController)
  public readonly keyController: KeyController = null;

  @property(DoorController)
  public readonly doorController: DoorController = null;

  @property(PlayerController)
  public readonly playerController: PlayerController = null;

  protected onLoad(): void {
    Game.context = this;
  }
}
