import RoleBase from "./Base/RoleBase";
import EatingGame from "./EatingGame";
import EatingUtil from "./EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Boy extends cc.Component {
    private role: RoleBase;
    //移动方向
    private moveDir: cc.Vec2 = cc.v2(1, 0);
    private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
    private maxSpeed: number = 400;
    private moveSpeed: cc.Vec2 = cc.Vec2.ZERO;
    private accelerationDir: cc.Vec2 = cc.Vec2.ZERO;
    private acceleration: number = 1500;
    public targetPos: cc.Vec2 = null;
    private rb: cc.RigidBody;

    protected onLoad(): void {
        this.rb = this.node.getComponent(cc.RigidBody);
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
        this.UpdateAccelerationDir();
        this.UpdateMoveSpeed(dt);
        this.UpdateRotation(dt);
        this.Move();
    }

    private AiMove(dt) {
        if (this.aiMovePos.equals(cc.Vec2.ZERO)) {
            this.aiMovePos = cc.v2(Math.random() - 0.5, Math.random() - 0.5).normalize().mul(Math.random() * 50 + 50);
            while (!EatingGame.Instance.InWall(this.aiMovePos)) {
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
        let rotation = (this.moveDir.angle(cc.Vec2.UP) * 180) / Math.PI;
        if (this.moveDir.x < 0) {
            rotation = -rotation;
        }
        this.node.angle = EatingUtil.Lerp(this.node.angle, -rotation, dt);
    }
}