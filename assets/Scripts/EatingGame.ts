import CameraHolder from "./CameraHolder";
import RoleManager from "./RoleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGame extends cc.Component {
    public static Instance: EatingGame;
    private boyMaxCount = 100;
    public boyCount = 0;
    @property(CameraHolder)
    cameraHolder: CameraHolder = null;
    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    boyPrefab: cc.Prefab = null;
    @property([cc.Prefab])
    visualPrefabs: cc.Prefab[] = [];
    @property(cc.Node)
    wallNode: cc.Node = null;
    public player;
    public roleManager: RoleManager;
    private boyId: number = 0;
    private roleId: number = 0;

    onLoad() {
        EatingGame.Instance = this;
        this.roleManager = new RoleManager();
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
    }

    protected start(): void {
        let newPlayer = this.GetRole(true);
        newPlayer.setParent(this.node);
        this.player = newPlayer.getComponent("Player");
        this.cameraHolder.player = this.player;
        this.player.Init(this.visualPrefabs[0], 1, false);
        this.roleManager.AddRole(this.player);
        for (let i = 0; i < 2; i++) {
            let role = this.GetRole();
            role.setParent(this.node);
            role.setPosition(200, 0);
            let RroleBase = role.getComponent("RoleBase");
            RroleBase.Init(this.visualPrefabs[1], 2);
            this.roleManager.AddRole(RroleBase);
        }
    }
    public InWall(worldPos: cc.Vec2): boolean {
        return this.wallNode.getBoundingBoxToWorld().contains(worldPos);
    }
    public GetInWallPos(): cc.Vec2 {
        let wallPos = this.wallNode.parent.convertToWorldSpaceAR(this.wallNode.getPosition());
        return cc.v2((Math.random() - 0.5) * this.wallNode.width + wallPos.x, (Math.random() - 0.5) * this.wallNode.height + wallPos.y);
    }

    private CreatBoy() {
        this.boyCount++;
        let pos = this.GetInWallPos();
        let newBoy = this.GetBoy();
        newBoy.setParent(this.node);
        newBoy.setPosition(this.node.convertToNodeSpaceAR(pos));
    }

    public GetBoy() {
        let newBoy = cc.instantiate(this.boyPrefab);
        let boy = newBoy.getComponent("Boy");
        boy.id = this.boyId;
        this.boyId++;
        return newBoy
    }

    public GetRole(isPlayer: boolean = false) {
        let newRole = cc.instantiate(this.rolePrefab);
        let role;
        if (isPlayer) {
            role = newRole.addComponent("Player");
        } else {
            role = newRole.addComponent("RoleBase");
        }
        role.id = this.roleId;
        this.roleId++;
        return newRole;
    }

    protected update(dt: number): void {
        if (this.boyCount < this.boyMaxCount) this.CreatBoy();
        if (null != this.roleManager) this.roleManager.UpdateRoleEat();
    }
}
