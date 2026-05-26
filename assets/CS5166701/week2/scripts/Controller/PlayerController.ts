import {
  _decorator,
  Animation,
  RigidBody2D,
  Vec2,
  Input,
  input,
  EventKeyboard,
  KeyCode,
  PhysicsSystem2D,
  Camera,
  UITransform,
} from "cc";
import { DataType } from "../../../week1/scripts/Data/DataStructure";
import { EntityController, EntityState, MoveDir } from "./EntityController";
import { BaseState } from "../states/Base/BaseState";
import { PlayerIdleState } from "../states/Player/PlayerIdleState";
import { PlayerRunState } from "../states/Player/PlayerRunState";
import { PlayerJumpState } from "../states/Player/PlayerJumpState";
import GameContext from "../../../week3/scripts/Controllers/GameContext";
import Game from "../../../week1/scripts/System/Game";
const { ccclass, property } = _decorator;

enum EventType {
  KeyCollected = "key-collected",
  CoinCollected = "coin-collected",
}

@ccclass("PlayerController")
export class PlayerController extends EntityController {
  public static readonly EVENT_TYPE = EventType;

  @property(Camera)
  public readonly camera: Camera = null;

  @property({ group: "Settings" })
  public readonly jumpForce = 8;

  protected _stateInstances: Record<EntityState, BaseState> = {
    [EntityState.Idle]: new PlayerIdleState(this),
    [EntityState.Run]: new PlayerRunState(this),
    [EntityState.Jump]: new PlayerJumpState(this),
  };

  protected _rb: RigidBody2D;

  protected _currentAnim: string = "";
  protected _leftHeld: boolean = false;
  protected _rightHeld: boolean = false;
  protected _blockedLeft: boolean = false;
  protected _blockedRight: boolean = false;

  public unregisterInput() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    this.moveDir = MoveDir.Stop;
  }

  // 註冊鍵盤輸入事件的 helper，方便 start 與 reset 時重用
  public registerInput() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  protected onLoad() {
    Game.context.node.on(GameContext.EVENT_TYPE.GameReset, this._reset, this);
  }

  protected start() {
    this._anim = this.target.getComponent(Animation)!;
    this._rb = this.target.getComponent(RigidBody2D)!;
    // 使用 registerInput() 統一註冊輸入，方便後續重新啟用
    this.registerInput();
    PhysicsSystem2D.instance.enable = true;
  }

  protected update(dt: number) {
    super.update(dt);
    this.checkBlockedLeft();
    this.checkBlockedRight();
  }

  protected jump() {
    if (!this._isGrounded) {
      return;
    }
    this._rb.linearVelocity = new Vec2(
      this._rb.linearVelocity.x,
      this.jumpForce,
    );
    console.log("跳躍！", this._rb.linearVelocity);
  }

  /* #region week2 */

  // 透過射線檢測玩家是否接觸地面，更新 _isGrounded 狀態
  protected _checkGrounded() {
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

  // 透過射線檢測玩家左側是否被障礙物擋住
  protected checkBlockedLeft() {
    const worldPos = this.target.worldPosition;
    // 在三個高度位置檢測：上、中、下
    const { width: playerWidth, height: playerHeight } =
      this.target.getComponent(UITransform);
    const offsets = [playerHeight / 2, 0, -playerHeight / 2];
    const rayDistance = playerWidth / 2 + 5;

    for (const offset of offsets) {
      const start = new Vec2(worldPos.x, worldPos.y + offset);
      const end = new Vec2(worldPos.x - rayDistance, worldPos.y + offset);

      const results = PhysicsSystem2D.instance.raycast(start, end);

      const blocked = results.some((res) => {
        const isBlock =
          (res.collider.group === DataType.Group.Floor ||
            res.collider.group === DataType.Group.Block) &&
          res.collider.tag === DataType.Floor.Platform;
        const isLeftWall = res.normal.x >= 0.9;
        return isBlock && isLeftWall;
      });

      if (blocked) {
        this._blockedLeft = true;
        return;
      }
    }

    this._blockedLeft = false;
  }

  // 透過射線檢測玩家右側是否被障礙物擋住
  protected checkBlockedRight() {
    const worldPos = this.target.worldPosition;
    // 在三個高度位置檢測：上、中、下
    const { width: playerWidth, height: playerHeight } =
      this.target.getComponent(UITransform);
    const offsets = [playerHeight / 2, 0, -playerHeight / 2];
    const rayDistance = playerWidth / 2 + 5;

    for (const offset of offsets) {
      const start = new Vec2(worldPos.x, worldPos.y + offset);
      const end = new Vec2(worldPos.x + rayDistance, worldPos.y + offset);

      const results = PhysicsSystem2D.instance.raycast(start, end);

      const blocked = results.some((res) => {
        const isBlock =
          (res.collider.group === DataType.Group.Floor ||
            res.collider.group === DataType.Group.Block) &&
          res.collider.tag === DataType.Floor.Platform;
        const isRightWall = res.normal.x <= -0.9;
        return isBlock && isRightWall;
      });

      if (blocked) {
        this._blockedRight = true;
        return;
      }
    }

    this._blockedRight = false;
  }

  protected updateMovement() {
    const v = this._rb.linearVelocity;

    if (
      (this.moveDir === MoveDir.Right && this._blockedRight) ||
      (this.moveDir === MoveDir.Left && this._blockedLeft)
    ) {
      v.x = 0;
    } else {
      v.x = this.moveDir * this.moveSpeed;
    }

    this._rb.linearVelocity = v;
    this.camera.node.setPosition(
      Math.min(Math.max(this.target.getPosition().x, 0), 1920),
      this.camera.node.getPosition().y,
      this.camera.node.getPosition().z,
    );
    if (this.moveDir !== MoveDir.Stop) {
      this.target.setScale(this.moveDir, 1, 1);
    }
  }

  /* #endregion */

  protected onKeyDown(e: EventKeyboard) {
    if (this._isLeftKey(e.keyCode)) {
      this._leftHeld = true;
      this._resolveMoveDir();
      return;
    }

    if (this._isRightKey(e.keyCode)) {
      this._rightHeld = true;
      this._resolveMoveDir();
      return;
    }

    if (this._isJumpKey(e.keyCode)) {
      this.jump();
    }
  }

  protected onKeyUp(e: EventKeyboard) {
    if (this._isLeftKey(e.keyCode)) {
      this._leftHeld = false;
      this._resolveMoveDir();
      return;
    }

    if (this._isRightKey(e.keyCode)) {
      this._rightHeld = false;
      this._resolveMoveDir();
    }
  }

  private _isLeftKey(keyCode: KeyCode) {
    return keyCode === KeyCode.KEY_A || keyCode === KeyCode.ARROW_LEFT;
  }

  private _isRightKey(keyCode: KeyCode) {
    return keyCode === KeyCode.KEY_D || keyCode === KeyCode.ARROW_RIGHT;
  }

  private _isJumpKey(keyCode: KeyCode) {
    return (
      keyCode === KeyCode.KEY_W ||
      keyCode === KeyCode.ARROW_UP ||
      keyCode === KeyCode.SPACE
    );
  }

  private _resolveMoveDir() {
    if (this._leftHeld === this._rightHeld) {
      this.moveDir = MoveDir.Stop;
      return;
    }
    this.moveDir = this._leftHeld ? MoveDir.Left : MoveDir.Right;
  }

  private _reset() {
    // 重置玩家位置、狀態與分數
    this.target.setPosition(-357, -245, 0);
    this.camera.node.setPosition(0, 0, 0);
    this.moveDir = MoveDir.Stop;
    this._leftHeld = false;
    this._rightHeld = false;
    this.target.setScale(1, 1, 1);
    this._isGrounded = true;
    // 當遊戲重置時，確保鍵盤事件已被註冊（若之前在結算時被取消）
    this.registerInput();
  }
}
  