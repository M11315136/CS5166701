import { _decorator, Component, Node, Button, Label, UIOpacity } from "cc";
import Game from "../../../week1/scripts/System/Game";
import GameContext from "../Controllers/GameContext";
const { ccclass, property } = _decorator;

@ccclass("WinBoard")
export class WinBoard extends Component {
  @property(UIOpacity)
  public readonly winBoard: UIOpacity = null;
  @property(Label)
  public readonly label: Label = null;
  @property(Label)
  public readonly score: Label = null;
  @property(Button)
  public restartBtn: Button = null;

  public lose() {
    // 顯示失敗畫面
    this.winBoard.opacity = 255;
    // 顯示結果文字
    this.label.string = "You Lose!";
    // 顯示玩家分數
    this.score.string =
      "Your Score: " + Game.context.scoreBoard.score.toString();
    // 解除玩家輸入，防止在結算畫面繼續操作
    Game.context.playerController.unregisterInput();
    // 上傳分數到伺服器（若有 NetworkManager）
    Game.context.submitScore();
  }

  public win() {
    // 顯示勝利畫面
    this.winBoard.opacity = 255;
    // 顯示結果文字
    this.label.string = "You Win!";
    // 顯示玩家分數
    this.score.string =
      "Your Score: " + Game.context.scoreBoard.score.toString();
    // 解除玩家輸入
    Game.context.playerController.unregisterInput();
    // 上傳分數到伺服器（若有 NetworkManager）
    Game.context.submitScore();
  }

  protected start() {
    // 綁定重新開始按鈕的點擊事件，關閉 WinBoard
    this.restartBtn.node.on("click", this._close, this);
  }

  private _close() {
    // 關閉 WinBoard 視窗
    this.winBoard.opacity = 0;
    // WinBoard 關閉後補一次排行榜，避免 WinBoard 面板原本蓋住它
    Game.context.node.emit(GameContext.EVENT_TYPE.GameReset, this);
    Game.context.refreshLeaderboard();
  }
}
