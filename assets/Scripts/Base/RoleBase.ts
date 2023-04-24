import Boy from "../Boy";
import BoyManager from "../BoyManager";
import CameraHolder from "../CameraHolder";
import EatingGame from "../EatingGame";
import EatingUtil from "../EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoleBase extends cc.Component {
    protected Ai: boolean;//是否是电脑
    protected boyManager: BoyManager;
    protected roleLevel: number = 1;
    protected moveDir: cc.Vec2 = cc.Vec2.ZERO;
    public visualPrefab: cc.Prefab;
    private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
    private eatingBoy: Boy[] = [];
    private eatingRole: RoleBase[] = [];
    private eatingTime: number = 0;
    private eatingMaxTime: number = 1;

    onLoad() {
        this.boyManager = new BoyManager(this);
    }

    public Init(visualPrefab: cc.Prefab, isAi: boolean = true) {
        this.visualPrefab = visualPrefab;
        this.Ai = isAi;
        let visual = cc.instantiate(this.visualPrefab);
        visual.setParent(this.node.getChildByName("Visual"));
        visual.setPosition(0, 0);
        this.node.setPosition(0, 0);
    }

    public GetLevel() {
        return this.roleLevel;
    }

    public SetLevel(level: number) {
        this.roleLevel = level;
    }

    public GetBoyManager() {
        return this.boyManager;
    }

    public onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (0 == other.tag) {
            let otherBoy = other.node.getComponent(Boy);
            if (null == otherBoy.GetRole()) {
                if (!this.Ai) {
                    this.boyManager.AddBoy(otherBoy);
                }
            }
            else if (this.roleLevel > otherBoy.GetRole().GetLevel()) {
                this.eatingBoy.push(otherBoy);
            }
        }
        else if (1 == other.tag) {
            let otherRole = other.node.getComponent(RoleBase);
            if (this.roleLevel > otherRole.GetLevel()) {
                this.eatingRole.push(otherRole);
            }
        }
    }

    public onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (0 == other.tag) {
            let otherBoy = other.node.getComponent(Boy);
            for (let i = 0; i < this.eatingBoy.length; i++) {
                if (this.eatingBoy[i] == otherBoy) this.eatingBoy.splice(i, 1);
            }
        }
        else if (1 == other.tag) {
            let otherRole = other.node.getComponent(RoleBase);
            for (let i = 0; i < this.eatingRole.length; i++) {
                if (this.eatingRole[i] == otherRole) this.eatingRole.splice(i, 1);
            }
        }
    }

    private AiMove(dt) {
        if (this.aiMovePos.equals(cc.Vec2.ZERO)) {
            this.aiMovePos = EatingGame.Instance.GetInWallPos();
        }
        let pos = this.node.parent.convertToNodeSpaceAR(this.aiMovePos);
        let dir = pos.sub(this.node.getPosition()).normalize();
        this.node.setPosition(this.node.getPosition().add(dir.mul(dt * 100)));
        this.moveDir = dir;
        if (this.node.getPosition().sub(pos).mag() <= 20) this.aiMovePos = cc.Vec2.ZERO;
    }

    private UpdateRotation() {
        if (cc.Vec2.ZERO.equals(this.moveDir)) return;
        let rotation = (this.moveDir.angle(cc.Vec2.UP) * 180) / Math.PI;
        if (this.moveDir.x < 0) {
            rotation = -rotation;
        }
        this.node.getChildByName("Visual").angle = -rotation;
    }

    protected Eating(dt: number) {
        if (0 == this.eatingBoy.length && 0 == this.eatingRole.length) this.eatingTime == 0;
        this.eatingTime += dt;
        if (this.eatingTime >= this.eatingMaxTime) {
            this.eatingTime = 0;
            this.BoyEating();
            this.RoleEating();
        }
    }

    private BoyEating() {
        for (let i = this.eatingBoy.length - 1; i >= 0; i--) {
            let boy: Boy = this.eatingBoy[i];
            if (!(this.Ai && boy.GetRole().Ai) && !(!this.Ai && !boy.GetRole().Ai)) {
                if (!this.Ai) this.boyManager.AddBoy(boy);
                boy.GetRole().GetBoyManager().DeleteBoy(boy);
                this.eatingBoy.splice(i, 1);
            }
        }
    }

    private RoleEating() {
        for (let i = this.eatingRole.length - 1; i >= 0; i--) {
            let role = this.eatingRole[i];
            if (null == role) {
                this.eatingRole.splice(i, 1);
                continue;
            }
            if (!(this.Ai && role.Ai) && !(!this.Ai && !role.Ai)) {
                let boy = role.GetBoyManager().GetBoy();
                if (boy) {
                    if (!this.Ai) this.boyManager.AddBoy(boy);
                    role.GetBoyManager().DeleteBoy(boy);
                    return;
                }
                else {
                    role.RoleDeath();
                }
            }
        }
    }

    public RoleDeath() {
        //角色死亡
        this.node.destroy();
    }

    private UpdateRadius(dt: number) {
        this.node.getComponent(cc.CircleCollider).radius = EatingUtil.Lerp(this.node.getComponent(cc.CircleCollider).radius, this.boyManager.firshRoundR + 10 + this.boyManager.roundR * (this.roleLevel - 1), dt);
    }

    update(dt) {
        if (this.Ai) this.AiMove(dt);
        this.Eating(dt);
        this.UpdateRotation();
        this.UpdateRadius(dt);
    }
}
