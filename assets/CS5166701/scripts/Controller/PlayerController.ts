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
} from "cc";
import { DataType } from "../Game/DataStructure";
import { WinBoard } from "../Object/WinBoard";
const { ccclass, property } = _decorator;

enum MoveDir {
  Left = -1,
  Stop = 0,
  Right = 1,
}

enum EventType {
  KeyCollected = "key-collected",
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

  private _moveDir: MoveDir = MoveDir.Stop;
  private _isGrounded: boolean = true;
  private _currentState: string = "";
  private _leftHeld: boolean = false;
  private _rightHeld: boolean = false;
  private _blockedLeftContacts: number = 0;
  private _blockedRightContacts: number = 0;

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
  }

  protected update() {
    this._updateMovement();
    this._updateAnimation();
    this._checkGrounded();
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
    this._playAnim(this.jumpAnim);
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === DataType.Tag.Hole) {
      this.winBoard.node.active = true;
      this.winBoard.label.string = "You Lose!";
      this.winBoard.node.position = v3(
        this.player.position.x,
        this.winBoard.node.position.y,
        0,
      );
    }
  }

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
        const isTarget = res.collider.tag === DataType.Tag.Ground;

        // 條件 2: 法線向上 (避免射線掃到側牆也算接地)
        const isFloor = res.normal.y >= 0.9;

        return isTarget && isFloor;
      });

      this._isGrounded = !!groundHit;
    } else {
      this._isGrounded = false;
    }
  }

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
      (this.moveDir === MoveDir.Right && this._blockedRightContacts > 0) ||
      (this.moveDir === MoveDir.Left && this._blockedLeftContacts > 0)
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

  // TODO: 移動時會持續更新 Start/End Contact，導致 isGrounded 狀態不固定 (持續 false)，需修正。
  // 改用射線判斷是否觸地，避免移動時接觸地面狀態不穩定的問題。
  private _updateAnimation() {
    if (!this._isGrounded) {
      this._playAnim(this.jumpAnim);
    } else if (this.moveDir === MoveDir.Stop) {
      this._playAnim(this.idleAnim);
    } else if (
      this.moveDir === MoveDir.Left ||
      this.moveDir === MoveDir.Right
    ) {
      this._playAnim(this.walkAnim);
    }
  }

  private _playAnim(name: string) {
    if (this._currentState === name) {
      return;
    }
    this._currentState = name;
    this._anim.play(name);
  }
}
