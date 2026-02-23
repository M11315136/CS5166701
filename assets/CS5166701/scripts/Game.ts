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
}
