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
} from "cc";

const { ccclass, property } = _decorator;

enum MoveDir {
  Left = -1,
  Stop = 0,
  Right = 1,
}

enum EventType {
  KeyCollected = "key-collected",
  CoinCollected = "coin-collected",
}

@ccclass("PlayerController")
export class PlayerController extends Component {
  public static EVENT_TYPE = EventType;
  @property(Node)
  public readonly player: Node = null;

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

    PhysicsSystem2D.instance.enable = true;
  }

  protected update() {
    this._updateMovement();
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
}
