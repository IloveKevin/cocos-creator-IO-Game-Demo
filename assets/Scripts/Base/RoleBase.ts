import Boy from "../Boy";
import BoyManager from "../BoyManager";
import EatingGame from "../EatingGame";
import EatingGameConfig from "../EatingGameConfig";
import EatingUtil from "../EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoleBase extends cc.Component {
    private roleLevel: number = 1;
    public visualPrefab: cc.Prefab = null;
    public Ai: boolean = true;
    protected boyManager: BoyManager;
    protected moveDir: cc.Vec2 = cc.Vec2.ZERO;
    private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
    public beEatingRole: RoleBase = null;
    public eatingRole: RoleBase[] = [];
    public eatingBoy: Boy[] = [];
    private eatingTime: number = 0;
    public speed: number = EatingGameConfig.roleMoveSpeed;

    public Init(visualPrefab: cc.Prefab, level: number = 1, ai: boolean = true) {
        this.boyManager = new BoyManager(this);
        this.roleLevel = level;
        this.visualPrefab = visualPrefab;
        this.Ai = ai;
        let visual = cc.instantiate(visualPrefab);
        visual.setParent(this.node.getChildByName("Visual"));
        visual.setPosition(0, 0);
        let boyCount = 4 + level;
        for (let i = 0; i < boyCount; i++) {
            let boy = (EatingGame.Instance.GetBoy());
            boy.setParent(EatingGame.Instance.node);
            boy.setPosition(boy.parent.convertToNodeSpaceAR(this.node.parent.convertToWorldSpaceAR(this.node.getPosition())));
            this.boyManager.AddBoy(boy.getComponent(Boy));
        }
    }

    public GetLevel() {
        return this.roleLevel;
    }

    public SetLevel(level: number) {
        if (this.Ai) return;
        this.roleLevel = level;
    }

    public GetBoyManager() {
        return this.boyManager;
    }

    public onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (EatingGameConfig.ColliderTag.role == self.tag) {
            switch (other.tag) {
                case EatingGameConfig.ColliderTag.boy:
                    this.eatingBoy.push(other.node.getComponent("Boy"));
                    break;
                case EatingGameConfig.ColliderTag.roleR:
                    this.eatingRole.push(other.node.getComponent("RoleBase"));
                    break;
            }
        }
    }

    public onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (EatingGameConfig.ColliderTag.role == self.tag) {
            switch (other.tag) {
                case EatingGameConfig.ColliderTag.boy:
                    for (let i = 0; i < this.eatingBoy.length; i++) {
                        if (this.eatingBoy[i] == other.node.getComponent("Boy")) this.eatingBoy.splice(i, 1);
                    }
                    break;
                case EatingGameConfig.ColliderTag.roleR:
                    for (let i = 0; i < this.eatingRole.length; i++) {
                        if (this.eatingRole[i] == other.node.getComponent("RoleBase")) this.eatingRole.splice(i, 1);
                    }
                    break;
            }
        }
    }

    private AiMove(dt) {
        if (this.aiMovePos.equals(cc.Vec2.ZERO)) {
            this.aiMovePos = EatingGame.Instance.GetInWallPos();
        }
        let pos = this.node.parent.convertToNodeSpaceAR(this.aiMovePos);
        let dir = pos.sub(this.node.getPosition()).normalize();
        // this.node.setPosition(this.node.getPosition().add(dir.mul(dt * this.speed)));
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

    protected UpdateEat(dt: number) {
        let reset: boolean = false;
        if (this.eatingRole.length > 0) {
            this.eatingTime += dt;
            let roles: RoleBase[] = this.RoleEating();
            if (roles.length > 0) {
                if (this.eatingTime >= EatingGameConfig.maxEatingTime) {
                    roles.forEach((value) => {
                        let boy = value.GetBoyManager().GetBoy();
                        if (boy) this.Eating(boy);
                        else value.RoleDeath();
                    })
                }
                return;
            }
            else {
                reset = true;
            }
        }
        if (this.eatingBoy.length > 0) {
            this.eatingTime += dt;
            let boy: Boy = this.BoyEating();
            if (boy) {
                if (this.eatingTime >= EatingGameConfig.maxEatingTime) {
                    this.Eating(boy);
                }
                return;
            }
            else {
                reset = true;
            }
        }
        if (reset)
            this.eatingTime = 0;
    }

    private BoyEating(): Boy {
        for (let i = this.eatingBoy.length - 1; i >= 0; i--) {
            let boy: Boy = this.eatingBoy[i];
            if (!boy.GetRole()) return boy;
            if (boy.GetRole().beEatingRole == this) return boy;
        }
        return null;
    }

    private RoleEating(): RoleBase[] {
        let roles: RoleBase[] = [];
        for (let i = 0; i < this.eatingRole.length; i++) {
            let role = this.eatingRole[i];
            if (role.beEatingRole == this) {
                roles.push(role);
            }
        }
        return roles;
    }

    private Eating(boy: Boy) {
        if (boy.GetRole())
            console.log(boy.GetRole().Ai);
        this.eatingTime = 0;
        if (boy.GetRole()) boy.GetRole().GetBoyManager().DeleteBoy(boy);
        this.boyManager.AddBoy(boy);
    }

    public RoleDeath() {
        //角色死亡
        EatingGame.Instance.roleManager.DeleteRole(this);
        this.node.destroy();
    }

    private UpdateRadius(dt: number) {
        this.node.getComponents(cc.CircleCollider).forEach((value) => {
            if (1 == value.tag) value.radius = EatingUtil.Lerp(this.node.getComponent(cc.CircleCollider).radius, this.boyManager.firshRoundR + 10 + this.boyManager.roundR * (this.roleLevel - 1), dt);
        })
    }

    update(dt) {
        if (this.Ai) this.AiMove(dt);
        this.UpdateEat(dt);
        this.UpdateRotation();
        this.UpdateRadius(dt);
    }
}
