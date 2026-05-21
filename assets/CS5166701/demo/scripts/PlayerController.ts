import {
  _decorator,
  Component,
  Animation,
  RigidBody2D,
  Vec2,
  Input,
  input,
  EventKeyboard,
  KeyCode,
  PhysicsSystem2D,
  Node,
  Camera,
  Contact2DType,
  Collider2D,
  v3,
  UITransform,
} from "cc";
import { WinBoard } from "../../week3/scripts/UI/WinBoard";
import { DataType } from "../../week1/scripts/Data/DataStructure";

const { ccclass, property } = _decorator;

enum MoveDir {
  Left = -1,
  Stop = 0,
  Right = 1,
}

enum EventType {
  KeyCollected = "key-collected",
}

enum PlayerState {
  Idle = "Idle",
  Run = "Run",
  Jump = "Jump",
}

@ccclass("PlayerController")
export class PlayerController extends Component {
  public static EVENT_TYPE = EventType;
  @property(Node)
  public readonly player: Node = null;

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  @property(Camera)
  public readonly camera: Camera = null;

  @property({ group: "Settings" })
  public readonly moveSpeed = 5;

  @property({ group: "Settings" })
  public readonly jumpForce = 8;

  @property({ group: "Animation Name" })
  public readonly idleAnim = "idle";

  @property({ group: "Animation Name" })
  public readonly walkAnim = "walk";

  @property({ group: "Animation Name" })
  public readonly jumpAnim = "jump";

  private _anim: Animation;
  private _rb: RigidBody2D;

  private _state: PlayerState = PlayerState.Idle;
  private _moveDir: MoveDir = MoveDir.Stop;
  private _isGrounded: boolean = true;
  private _currentAnim: string = "";
  private _leftHeld: boolean = false;
  private _rightHeld: boolean = false;
  private _blockedLeft: boolean = false;
  private _blockedRight: boolean = false;

  private get moveDir() {
    return this._moveDir;
  }

  private set moveDir(value: number) {
    if (value === this._moveDir) {
      return;
    }
    this._moveDir = value;
  }

  protected start() {
    this._anim = this.player.getComponent(Animation)!;
    this._rb = this.player.getComponent(RigidBody2D)!;
    input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

    this._playAnim(this.idleAnim);
    const collider = this.player.getComponent(Collider2D);
    PhysicsSystem2D.instance.enable = true;
    collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this._onEndContact, this);
  }

  protected update() {
    this._checkGrounded();
    this._checkBlockedLeft();
    this._checkBlockedRight();
    this._updateMovement();
    this._updateStateMachine();
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
    this._changeState(PlayerState.Jump);
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    /* #region week3 */
    if (other.tag === DataType.Group.Hole) {
      this.winBoard.node.active = true;
      this.winBoard.label.string = "You Lose!";
      this.winBoard.node.position = v3(
        this.player.position.x,
        this.winBoard.node.position.y,
        0,
      );
    }
    /* #endregion */
  }

  private _onEndContact(self: Collider2D, other: Collider2D) {
    // 射線檢測已取代接觸事件的水平阻擋偵測
  }

  /* #region week2 */

  // 透過射線檢測玩家是否接觸地面，更新 _isGrounded 狀態
  private _checkGrounded() {
    const worldPos = this.player.worldPosition;
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
  private _checkBlockedLeft() {
    const worldPos = this.player.worldPosition;
    // 在三個高度位置檢測：上、中、下
    const playerHeight = this.player.getComponent(UITransform).height;
    const offsets = [playerHeight / 2, 0, -playerHeight / 2];
    const rayDistance = 20;

    for (const offset of offsets) {
      const start = new Vec2(worldPos.x, worldPos.y + offset);
      const end = new Vec2(worldPos.x - rayDistance, worldPos.y + offset);

      const results = PhysicsSystem2D.instance.raycast(start, end);

      const blocked = results.some((res) => {
        const isBlock = res.collider.group === DataType.Group.Block;
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
  private _checkBlockedRight() {
    const worldPos = this.player.worldPosition;
    // 在三個高度位置檢測：上、中、下
    const playerHeight = this.player.getComponent(UITransform).height;
    const offsets = [playerHeight / 2, 0, -playerHeight / 2];
    const rayDistance = 20;

    for (const offset of offsets) {
      const start = new Vec2(worldPos.x, worldPos.y + offset);
      const end = new Vec2(worldPos.x + rayDistance, worldPos.y + offset);

      const results = PhysicsSystem2D.instance.raycast(start, end);

      const blocked = results.some((res) => {
        const isBlock = res.collider.group === DataType.Group.Block;
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

  /* #endregion */

  private _onKeyDown(e: EventKeyboard) {
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

  private _onKeyUp(e: EventKeyboard) {
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

  private _updateMovement() {
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
      Math.min(Math.max(this.player.getPosition().x, 0), 1920),
      this.camera.node.getPosition().y,
      this.camera.node.getPosition().z,
    );
    if (this.moveDir !== MoveDir.Stop) {
      this.player.setScale(this.moveDir, 1, 1);
    }
  }

  /* #region week2 */

  private _updateStateMachine() {
    let nextState: PlayerState;

    if (!this._isGrounded) {
      nextState = PlayerState.Jump;
    } else if (this.moveDir === MoveDir.Stop) {
      nextState = PlayerState.Idle;
    } else {
      nextState = PlayerState.Run;
    }

    this._changeState(nextState);
  }

  private _changeState(nextState: PlayerState) {
    if (this._state === nextState) {
      return;
    }

    this._state = nextState;
    this._onEnterState(nextState);
  }

  private _onEnterState(state: PlayerState) {
    switch (state) {
      case PlayerState.Idle:
        this._playAnim(this.idleAnim);
        break;
      case PlayerState.Run:
        this._playAnim(this.walkAnim);
        break;
      case PlayerState.Jump:
        this._playAnim(this.jumpAnim);
        break;
    }
  }

  private _playAnim(name: string) {
    if (this._currentAnim === name) {
      return;
    }
    this._currentAnim = name;
    this._anim.play(name);
  }
  /* #endregion */
}
