import { _decorator, Component, Node, Button, Label, Vec3 } from "cc";
import { PlayerController } from "../../../week2/scripts/Controller/PlayerController";
import Game from "../../../week1/scripts/System/Game";
import GameContext from "../Controllers/GameContext";
const { ccclass, property } = _decorator;

@ccclass("ScoreBoard")
export class ScoreBoard extends Component {
  @property(Label)
  public readonly value: Label = null;
  @property(Node)
  public readonly camera: Node = null;
  @property(Node)
  public readonly scoreBoard: Node = null;
  @property({
    type: Vec3,
    tooltip: "World offset from camera where scoreboard will be placed",
  })
  public offset: Vec3 = new Vec3(-400, 230, 0);
  private _scoreValue = 0;

  public get score() {
    // 取得目前計分板上的分數
    return this._scoreValue;
  }

  public addScore(value: number) {
    // 若傳入的分數小於等於 0，視為無效，直接忽略
    if (value <= 0) {
      return;
    }

    // 累加分數並更新 UI 上的文字顯示
    this._scoreValue += value;
    this.value.string = this._scoreValue.toString();
  }

  protected start() {
    // 註冊監聽：當玩家撿到硬幣時，呼叫本元件的 _score() 方法增加分數
    Game.context.playerController.node.on(
      PlayerController.EVENT_TYPE.CoinCollected,
      this._score,
      this,
    );

    Game.context.node.on(GameContext.EVENT_TYPE.GameReset, this._reset, this);
  }

  private _score() {
    // 每次收到 coin collected 事件，就增加 1 分
    this.addScore(1);
  }

  private _reset() {
    // 重置分數
    this._scoreValue = 0;
    this.value.string = "0";
  }
}
