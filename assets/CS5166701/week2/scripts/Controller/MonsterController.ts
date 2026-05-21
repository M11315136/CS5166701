import {
  _decorator,
  Component,
  Node,
  Animation,
  Vec2,
  Vec3,
  tween,
  Contact2DType,
  PhysicsSystem2D,
  Collider2D,
} from "cc";
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { WinBoard } from "../../../week3/scripts/UI/WinBoard";
import { EntityController, EntityState, MoveDir } from "./EntityController";
import { BaseState } from "../states/Base/BaseState";
import { MonsterIdleState } from "../states/Monster/MonsterIdleState";
import { MonsterRunState } from "../states/Monster/MonsterRunState";
import { MonsterJumpState } from "../states/Monster/MonsterJumpState";

const { ccclass, property } = _decorator;

@ccclass("MonsterController")
export class MonsterController extends EntityController {
  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  // state instances
  protected _stateInstances: Record<EntityState, BaseState> = {
    [EntityState.Idle]: new MonsterIdleState(this),
    [EntityState.Run]: new MonsterRunState(this),
    [EntityState.Jump]: new MonsterJumpState(this),
  };

  protected onLoad() {
    super.onLoad();

    // this._state = EntityState.Idle;
    this.moveDir = MoveDir.Left;

    const collider = this.target.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }
  }

  protected updateMovement(dt: number) {
    if (!this.target) {
      return;
    }

    // move
    const moveAmount = this.moveSpeed * dt * this._moveDir;
    this.target.setPosition(
      this.target.position.x + moveAmount,
      this.target.position.y,
      this.target.position.z,
    );
  }

  protected checkGrounded() {
    if (!this.target) {
      return;
    }
    // raycast ahead and down to check for ground
    const worldPos = this.target.worldPosition;
    const forwardOffset = 20 * this._moveDir; // pixels ahead
    const start = new Vec2(worldPos.x + forwardOffset, worldPos.y - 10);
    const end = new Vec2(start.x, start.y - 40);

    const results = PhysicsSystem2D.instance.raycast(start, end);
    const hasGround = results.some((res) => {
      const isGround =
        res.collider.group === DataType.Group.Floor &&
        res.collider.tag === DataType.Floor.Ground;
      const isFloor = res.normal.y >= 0.9;
      return isGround && isFloor;
    });

    if (!hasGround) {
      // no ground ahead -> turn around
      this._moveDir *= -1;
      this.target.setScale(this._moveDir === MoveDir.Right ? -1 : 1, 1, 1);
    }
  }

  protected jump(): void {}

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.group === DataType.Group.Player) {
      this.winBoard.lose();
      this.winBoard.node.setPosition(
        other.node.position.x,
        this.winBoard.node.position.y,
        this.target.position.z,
      );
      // other.node.active = false;
    }
  }
}
