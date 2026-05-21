import { EntityController } from "../../Controller/EntityController";

export class BaseState {
  protected controller: EntityController;

  constructor(controller: EntityController) {
    this.controller = controller;
  }

  public enter() {}
  public exit() {}
}
