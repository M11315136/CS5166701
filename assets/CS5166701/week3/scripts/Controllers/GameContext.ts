import { _decorator, Component, Node } from "cc";
import Game from "../../../week1/scripts/System/Game";
import KeyController from "./KeyController";
import DoorController from "./DoorController";
import { ScoreBoard } from "../UI/ScoreBoard";
import { PlayerController } from "../../../week2/scripts/Controller/PlayerController";

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

  @property(ScoreBoard)
  public readonly scoreBoard: ScoreBoard = null;

  protected onLoad(): void {
    Game.context = this;
  }
}
