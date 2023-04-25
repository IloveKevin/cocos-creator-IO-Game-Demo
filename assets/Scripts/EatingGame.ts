import CameraHolder from "./CameraHolder";
import EatingGameConfig from "./EatingGameConfig";
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
        // let level = 2;
        // for (let i = 0; i < 2; i++) {
        //     let role = this.GetRole();
        //     role.setParent(this.node);
        //     role.setPosition(200, 0);
        //     let RroleBase = role.getComponent("RoleBase");
        //     RroleBase.Init(this.visualPrefabs[1], level);
        //     this.roleManager.AddRole(RroleBase);
        // }
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

    private CreatRole(count: number, level: number) {
        if (count <= 0) return;
        for (let i = 0; i < count; i++) {
            let newRole = this.GetRole();
            let role = newRole.getComponent("RoleBase");
            newRole.setParent(this.node);
            let pos = this.GetInWallPos();
            for (; this.cameraHolder.InPlayerHorizons(pos);) {
                pos = this.GetInWallPos();
            }
            newRole.setPosition(newRole.parent.convertToNodeSpaceAR(pos));
            role.Init(this.visualPrefabs[1], level);
            this.roleManager.AddRole(role);
        }
    }

    private UpdateRole() {
        let roles = this.roleManager.GetRoles();
        let bigPlayerRole = [];
        let equalsPlayerRoleCount: number = 0;
        roles.forEach((value) => {
            if ((value.GetLevel() - this.player.GetLevel()) > 1 && !this.cameraHolder.InPlayerHorizons(value.node.parent.convertToWorldSpaceAR(value.node.getPosition()))) {
                value.RoleDeath();
            }
            else if (1 == (value.GetLevel() - this.player.GetLevel())) {
                bigPlayerRole.push(value);
            }
            else if (0 == (value.GetLevel() - this.player.GetLevel())) {
                equalsPlayerRoleCount++;
            }
        })
        for (let i = 0; i < bigPlayerRole.length; i++) {
            if (bigPlayerRole.length > EatingGameConfig.bigPlayerRoleCount && this.cameraHolder.InPlayerHorizons(bigPlayerRole[i].node.parent.convertToWorldSpaceAR(bigPlayerRole[i].node.getPosition()))) {
                bigPlayerRole[i].RoleDeath();
            }
        }
        let playerLevel: number = this.player.GetLevel();
        this.CreatRole(EatingGameConfig.bigPlayerRoleCount - bigPlayerRole.length, playerLevel + 1)
        this.CreatRole(EatingGameConfig.equalsPlayerRoleCount - equalsPlayerRoleCount, playerLevel);
    }

    protected update(dt: number): void {
        if (this.boyCount < this.boyMaxCount) this.CreatBoy();
        if (null != this.roleManager) this.roleManager.UpdateRoleEat();
        this.UpdateRole();
    }
}
