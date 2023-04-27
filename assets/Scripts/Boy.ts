import RoleBase from "./Base/RoleBase";
import EatingGame from "./EatingGame";
import EatingGameConfig from "./EatingGameConfig";
import { nodePoolEnum } from "./EatingNodePool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Boy extends cc.Component {
    @property(cc.Prefab)
    boyVisualPrefab: cc.Prefab = null;
    private role: RoleBase;
    //移动方向
    private moveDir: cc.Vec2 = cc.v2(1, 0);
    private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
    private maxSpeed: number = EatingGameConfig.boySpeed;
    private moveSpeed: cc.Vec2 = cc.Vec2.ZERO;
    private accelerationDir: cc.Vec2 = cc.Vec2.ZERO;
    private acceleration: number = EatingGameConfig.boyAcceleration;
    public targetPos: cc.Vec2 = null;
    private rb: cc.RigidBody;
    public inGame: boolean = false;
    public id: number;
    public game: EatingGame;

    public unuse() {
        this.node.getChildByName("Visual").children.forEach((value) => {
            value.destroy();
        })
    }

    Init(game: EatingGame) {
        this.game = game;
    }

    public reuse() {
        this.rb = this.node.getComponent(cc.RigidBody);
        let boyVisualNode = cc.instantiate(this.boyVisualPrefab);
        boyVisualNode.setParent(this.node.getChildByName("Visual"));
        boyVisualNode.setPosition(0, 0);
        this.role = null;
        this.moveDir = cc.Vec2.UP;
        this.aiMovePos = cc.Vec2.ZERO;
        this.maxSpeed = EatingGameConfig.boySpeed;
        this.moveSpeed = cc.Vec2.ZERO;
        this.accelerationDir = cc.Vec2.ZERO;
        this.acceleration = EatingGameConfig.boyAcceleration;
        this.targetPos = null;
        this.rb.linearVelocity = cc.Vec2.ZERO;
    }

    public ChangeTarget(role: RoleBase, targetPos: cc.Vec2) {
        this.role = role;
        this.targetPos = targetPos;
    }

    public GetRole() {
        return this.role;
    }

    private Move() {
        this.rb.linearVelocity = this.moveSpeed;
    }

    private UpdateAccelerationDir() {
        this.accelerationDir = this.node.parent.convertToNodeSpaceAR(this.role.node.parent.convertToWorldSpaceAR(this.role.node.getPosition().add(this.targetPos))).sub(this.node.getPosition());
        this.accelerationDir.normalizeSelf().mulSelf(this.acceleration);
    }

    public BoyDead() {
        this.role.GetBoyManager().DeleteBoy(this);
        this.game.eatingNodePool.PutNode(nodePoolEnum.boy, this.node);
    }

    private UpdateMoveSpeed(dt: number) {
        this.moveSpeed = this.moveSpeed.add(this.accelerationDir.mul(dt));
        if (this.moveSpeed.mag() > this.maxSpeed) {
            this.moveSpeed.normalizeSelf().mulSelf(this.maxSpeed);
        }
        this.moveDir = this.moveSpeed.normalize();
    }

    protected update(dt: number): void {
        if (null == this.role) {
            this.AiMove(dt);
            return;
        }
        if (!cc.isValid(this.role)) return;
        this.UpdateAccelerationDir();
        this.UpdateMoveSpeed(dt);
        this.UpdateRotation(dt);
        this.Move();
    }

    private AiMove(dt) {
        if (this.aiMovePos.equals(cc.Vec2.ZERO)) {
            this.aiMovePos = cc.v2(Math.random() - 0.5, Math.random() - 0.5).normalize().mul(Math.random() * 50 + 50);
            while (!this.game.InWall(this.aiMovePos)) {
                this.aiMovePos = cc.v2(Math.random() - 0.5, Math.random() - 0.5).normalize().mul(Math.random() * 50 + 50);
            }
        }
        let pos = this.node.parent.convertToNodeSpaceAR(this.aiMovePos);
        let dir = pos.sub(this.node.getPosition()).normalize();
        this.node.setPosition(this.node.getPosition().add(dir.mul(dt * 10)));
        if (this.node.getPosition().sub(pos).mag() <= 20) this.aiMovePos = cc.Vec2.ZERO;
        this.moveDir = dir;
        this.UpdateRotation(dt);
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (1 != otherCollider.tag) contact.disabled = true;
    }

    private UpdateRotation(dt: number) {
        if (this.moveDir.equals(cc.Vec2.ZERO)) return;
        let rotation = (this.moveDir.angle(cc.Vec2.UP) * 180) / Math.PI;
        if (this.moveDir.x < 0) {
            rotation = -rotation;
        }
        // this.node.angle = EatingUtil.Lerp(this.node.angle, -rotation, dt * 10);
        this.node.angle = -rotation;
    }
}
