import { _decorator, Component, Node } from "cc";
import GameContext from "./GameContext";

export default class Game {
  protected static instance: Game = null;
  protected context: GameContext = null;

  public static get Instance() {
    if (!Game.instance) {
      this.instance = new Game();
    }
    return this.instance;
  }

  public static get context() {
    return this.Instance.context;
  }

  public static set context(value: GameContext) {
    this.Instance.context = value;
  }
  // TODO: 切場景 -> Loading (選關) 
  // TODO: 倒數計時
  // TODO: 金幣、分數結算系統
  // TODO: (隨機)障礙物
}
