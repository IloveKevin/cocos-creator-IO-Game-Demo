import RoleBase from "./Base/RoleBase";
import EatingUtil from "./EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Boy extends cc.Component {
    private role: RoleBase;
    //移动方向
    private moveDir: cc.Vec2 = cc.v2(1, 0);
    private maxSpeed: number = 400;
    private AiMaxSpeed: number = 20;
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
            // this.AiMove(dt);
            return;
        }
        this.UpdateAccelerationDir();
        this.UpdateMoveSpeed(dt);
        this.UpdateRotation(dt);
        this.Move();
    }

    private AiMove(dt: number) {
        if (null == this.targetPos || 10 >= (this.node.getPosition().sub(this.targetPos)).mag()) {
            let targetPos = cc.v2(Math.random() - 1, Math.random() - 1).normalize().mul(Math.random() * 100);
            this.targetPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition().add(targetPos));
        }
        let targetDir = this.node.parent.convertToNodeSpaceAR(this.targetPos).sub(this.node.getPosition());
        let accelerationDir = targetDir.normalize().mul(this.acceleration);
        this.moveSpeed = this.moveSpeed.add(accelerationDir.mul(dt));
        if (this.moveSpeed.mag() > this.AiMaxSpeed) {
            this.moveSpeed.normalizeSelf().mulSelf(this.AiMaxSpeed);
        }
        this.Move();
        this.moveDir = this.moveSpeed.normalize();
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
