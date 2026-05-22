import { _decorator, Component, Label } from "cc";
import Game from "../../../week1/scripts/System/Game";
import { WinBoard } from "./WinBoard";

const { ccclass, property } = _decorator;

@ccclass("CountdownTimer")
export class CountdownTimer extends Component {
  @property(Label)
  public readonly timeLabel: Label = null;

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  @property
  public totalSeconds = 60;

  private _remainingSeconds = 0;
  private _tickBuffer = 0;
  private _finished = false;

  public get remainingSeconds() {
    return this._remainingSeconds;
  }

  protected start() {
    this._remainingSeconds = Math.max(0, Math.floor(this.totalSeconds));
    this._tickBuffer = 0;
    this._finished = false;
    this._updateTimeLabel();
  }

  protected update(deltaTime: number) {
    if (this._finished) {
      return;
    }

    this._tickBuffer += deltaTime;

    while (this._tickBuffer >= 1 && !this._finished) {
      this._tickBuffer -= 1;
      this._remainingSeconds -= 1;

      if (this._remainingSeconds <= 0) {
        this._remainingSeconds = 0;
        this._updateTimeLabel();
        this._onTimeUp();
        return;
      }

      this._updateTimeLabel();
    }
  }

  public completeWin() {
    if (this._finished) {
      return;
    }

    this._finished = true;
    Game.context.scoreBoard.addScore(this._remainingSeconds / 10);
    this._updateTimeLabel();
    this.winBoard.win();
  }

  private _onTimeUp() {
    if (this._finished) {
      return;
    }

    this._finished = true;
    this.winBoard.lose();
  }

  private _updateTimeLabel() {
    if (!this.timeLabel) {
      return;
    }

    this.timeLabel.string = this._formatTime(this._remainingSeconds);
  }

  private _formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const minuteText = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondText = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `剩餘時間： ${minuteText}:${secondText}`;
  }
}
