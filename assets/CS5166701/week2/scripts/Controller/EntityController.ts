import {
  _decorator,
  Component,
  Animation,
  Vec2,
  PhysicsSystem2D,
  Node,
} from "cc";
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { BaseIdleState } from "../states/Base/BaseIdleState";
import { BaseRunState } from "../states/Base/BaseRunState";
import { BaseJumpState } from "../states/Base/BaseJumpState";
import { BaseState } from "../states/Base/BaseState";

const { ccclass, property } = _decorator;

export enum MoveDir {
  Left = -1,
  Stop = 0,
  Right = 1,
}

export enum EntityState {
  Idle = "Idle",
  Run = "Run",
  Jump = "Jump",
}

@ccclass("EntityController")
export abstract class EntityController extends Component {
  @property(Node)
  public readonly target: Node = null;

  @property({ group: "Settings" })
  public readonly moveSpeed = 5;

  @property({ group: "Animation Name" })
  public readonly idleAnim = "idle";

  @property({ group: "Animation Name" })
  public readonly walkAnim = "walk";

  @property({ group: "Animation Name" })
  public readonly jumpAnim = "jump";

  // state instances
  protected _stateInstances: Record<EntityState, BaseState> = {
    [EntityState.Idle]: new BaseIdleState(this),
    [EntityState.Run]: new BaseRunState(this),
    [EntityState.Jump]: new BaseJumpState(this),
  };

  protected _anim: Animation;

  protected _state: EntityState = EntityState.Idle;
  protected _moveDir: MoveDir = MoveDir.Stop;
  protected _isGrounded: boolean = true;

  public get animation(): Animation {
    return this._anim;
  }

  protected get moveDir() {
    return this._moveDir;
  }

  protected set moveDir(value: number) {
    if (value === this._moveDir) {
      return;
    }
    this._moveDir = value;
  }

  protected onLoad() {
    this._anim = this.target.getComponent(Animation);
  }

  protected update(dt: number) {
    this.checkGrounded();
    this.updateMovement(dt);
    this.updateStateMachine();
  }

  /* #region week2 */

  // 透過射線檢測玩家是否接觸地面，更新 _isGrounded 狀態
  protected checkGrounded() {
    const worldPos = this.target.worldPosition;
    // 射線起點稍微高一點點，確保穿過腳底
    const start = new Vec2(worldPos.x, worldPos.y);
    const end = new Vec2(worldPos.x, worldPos.y - 30);

    const results = PhysicsSystem2D.instance.raycast(start, end);

    if (results.length > 0) {
      // 找到第一個符合條件的地板
      const groundHit = results.find((res) => {
        // 條件 1: Tag 是地板或障礙物
        const isTarget =
          res.collider.group === DataType.Group.Floor &&
          res.collider.tag === DataType.Floor.Ground;

        // 條件 2: 法線向上 (避免射線掃到側牆也算接地)
        const isFloor = res.normal.y >= 0.9;

        return isTarget && isFloor;
      });

      this._isGrounded = !!groundHit;
    } else {
      this._isGrounded = false;
    }
  }

  /* #endregion */

  /* #region week2 */

  protected updateStateMachine() {
    let nextState: EntityState;

    if (!this._isGrounded) {
      nextState = EntityState.Jump;
    } else if (this.moveDir === MoveDir.Stop) {
      nextState = EntityState.Idle;
    } else {
      nextState = EntityState.Run;
    }

    this.changeState(nextState);
  }

  protected changeState(nextState: EntityState) {
    if (this._state === nextState) {
      return;
    }
    console.log(`當前狀態: ${this._state}，下一個狀態: ${nextState}`);
    this._stateInstances[this._state].exit();
    this._state = nextState;
    this._stateInstances[this._state].enter();
  }
  /* #endregion */

  protected abstract jump(): void;
  protected abstract updateMovement(dt: number): void;
}
