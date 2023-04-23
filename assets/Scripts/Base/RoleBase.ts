import Boy from "../Boy";
import BoyManager from "../BoyManager";
import EatingGame from "../EatingGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoleBase extends cc.Component {
    protected Ai: boolean;//是否是电脑
    protected boyManager: BoyManager;
    protected roleLevel: number = 1;
    public visualPrefab: cc.Prefab;
    private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
    onLoad() {
        this.boyManager = new BoyManager(this);
    }

    public Init(visualPrefab: cc.Prefab, isAi: boolean = true) {
        this.visualPrefab = visualPrefab;
        this.Ai = isAi;
        let visual = cc.instantiate(this.visualPrefab);
        visual.setParent(this.node.getChildByName("Visual"));
        visual.setPosition(0, 0);
        // if (!isAi) {
        this.node.setPosition(0, 0);
        // }
    }

    public GetLevel() {
        return this.roleLevel;
    }

    public SetLevel(level: number) {
        this.roleLevel = level;
        this.node.getComponent(cc.CircleCollider).radius = 50 + 20 * (level - 1);
    }

    public GetBoyManager() {
        return this.boyManager;
    }

    onCollisionStay(other: cc.Collider, self: cc.Collider) {
        let otherBoy = other.node.getComponent(Boy)
        let otherRole = other.node.getComponent(RoleBase)
        if (null != otherBoy) {
            //检测到一个boy
            if (null == otherBoy.GetRole()) this.boyManager.AddBoy(otherBoy);
            else if (otherBoy.GetRole().GetLevel() < this.roleLevel) {
                this.boyManager.AddBoy(otherBoy);
                otherBoy.GetRole().GetBoyManager().DeleteBoy(otherBoy);
            }
        }
        if (null != otherRole && otherRole.GetLevel() < this.roleLevel) {
            //碰到另一个角色,且它的等级更小
            let boy = otherRole.GetBoyManager().GetBoy()
            if (null != boy) {
                //另一个角色还有boy
                otherRole.GetBoyManager().DeleteBoy(boy);
                this.boyManager.AddBoy(boy);
            }
            else {
                //另一个角色没有boy
                otherRole.RoleDeath();
            }
        }
    }

    private AiMove(dt) {
        if (!this.aiMovePos.equals(cc.Vec2.ZERO)) {
            this.aiMovePos = EatingGame.Instance.GetInWallPos();
        }
        let pos = this.node.parent.convertToNodeSpaceAR(this.aiMovePos);
        let dir = pos.normalize();
        this.node.setPosition(this.node.getPosition().add(dir.mul(dt * 100)));
        if (this.node.getPosition().sub(pos).mag() <= 10) this.aiMovePos = cc.Vec2.ZERO;
    }

    public RoleDeath() {
        //角色死亡
    }

    update(dt) {
        if (this.Ai) this.AiMove(dt);
        this.node.getComponent(cc.CircleCollider).radius = 50 + 20 * (this.roleLevel - 1);
    }
}
