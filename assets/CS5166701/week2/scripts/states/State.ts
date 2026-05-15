import type { PlayerController } from "../PlayerController";

export interface IPlayerState {
  enter(controller: PlayerController): void;
}
