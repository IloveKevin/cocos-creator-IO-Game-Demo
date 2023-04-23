import RoleBase from "./Base/RoleBase";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGame extends cc.Component {
    public static Instance: EatingGame;
    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;
    @property([cc.Prefab])
    visualPrefabs: cc.Prefab[] = [];
    @property(cc.Node)
    wallNode: cc.Node = null;

    onLoad() {
        EatingGame.Instance = this;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
    }

    protected start(): void {
        let player = cc.instantiate(this.rolePrefab)
        player.setParent(this.node);
        player.addComponent(Player).Init(this.visualPrefabs[0], false);
        let role = cc.instantiate(this.rolePrefab)
        role.setParent(this.node);
        role.addComponent(RoleBase).Init(this.visualPrefabs[1]);
    }
    public InWall(worldPos: cc.Vec2): boolean {
        return this.wallNode.getBoundingBoxToWorld().contains(worldPos);
    }
    public GetInWallPos(): cc.Vec2 {
        let wallPos = this.wallNode.parent.convertToWorldSpaceAR(this.wallNode.getPosition());
        return cc.v2((Math.random() - 0.5) * this.wallNode.width + wallPos.x, Math.random() - 0.5 * this.wallNode.height + wallPos.y);
    }
}
