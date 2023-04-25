import CameraHolder from "./CameraHolder";
import EatingGameConfig from "./EatingGameConfig";
import EatingNodePool, { nodePoolEnum } from "./EatingNodePool";
import RoleManager from "./RoleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGame extends cc.Component {
    public static Instance: EatingGame;
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
    public eatingNodePool: EatingNodePool;

    onLoad() {
        EatingGame.Instance = this;
        this.roleManager = new RoleManager();
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
        let a = Date.now();
        this.InitNodePool();
    }

    protected start(): void {
        let newPlayer = this.GetRole(true);
        newPlayer.setParent(this.node);
        this.player = newPlayer.getComponent("Player");
        this.cameraHolder.player = this.player;
        this.player.Init(this.visualPrefabs[0], 1, false);
        this.roleManager.AddRole(this.player);
        // this.CreatRole(20, 1);
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

    private InitNodePool() {
        this.eatingNodePool = new EatingNodePool();
        this.eatingNodePool.CreatNodePool(nodePoolEnum.boy, this.boyPrefab);
        this.eatingNodePool.CreatNodePool(nodePoolEnum.role, this.rolePrefab);
        this.eatingNodePool.CreatNodePool(nodePoolEnum.playerVisual, this.visualPrefabs[0]);
        this.eatingNodePool.CreatNodePool(nodePoolEnum.enemyVisual, this.visualPrefabs[1]);
        this.eatingNodePool.Init();
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
        let boy = newBoy.getComponent("Boy");
        boy.inGame = true;
        newBoy.setParent(this.node);
        newBoy.setPosition(this.node.convertToNodeSpaceAR(pos));
    }

    public GetBoy() {
        let newBoy = this.eatingNodePool.GetNode(nodePoolEnum.boy);
        let boy = newBoy.getComponent("Boy");
        boy.ChangeTarget(null, cc.v2(0, 0));
        boy.id = this.boyId;
        this.boyId++;
        return newBoy
    }

    public GetRole(isPlayer: boolean = false) {
        let newRole = this.eatingNodePool.GetNode(nodePoolEnum.role);
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
            // newRole.setPosition(0, 0);
            role.Init(this.visualPrefabs[1], level);
            this.roleManager.AddRole(role);
        }
    }

    private UpdateRole() {
        if (!this.player || !cc.isValid(this.player)) return;
        let roles = this.roleManager.GetRoles();
        let bigPlayerRole = [];
        let equalsPlayerRoleCount: number = 0;
        let lessPlayerRoleCount = [];
        roles.forEach((value) => {
            if ((value.GetLevel() - this.player.GetLevel()) > 1 && !this.cameraHolder.InPlayerHorizons(value.node.parent.convertToWorldSpaceAR(value.node.getPosition()))) {
                value.RoleDeath();
            }
            else if (1 == (value.GetLevel() - this.player.GetLevel())) {
                bigPlayerRole.push(value);
            }
            else if (0 == (value.GetLevel() - this.player.GetLevel()) && value != this.player) {
                equalsPlayerRoleCount++;
            }
            else if (0 > (value.GetLevel() - this.player.GetLevel())) {
                lessPlayerRoleCount.push(value);
            }
        })
        for (let i = 0; i < bigPlayerRole.length; i++) {
            if (bigPlayerRole.length > EatingGameConfig.bigPlayerRoleCount && this.cameraHolder.InPlayerHorizons(bigPlayerRole[i].node.parent.convertToWorldSpaceAR(bigPlayerRole[i].node.getPosition()))) {
                bigPlayerRole[i].RoleDeath();
            }
        }
        for (let i = 0; i < lessPlayerRoleCount.length; i++) {
            if (lessPlayerRoleCount.length > EatingGameConfig.lessPlayerRoleCount && this.cameraHolder.InPlayerHorizons(lessPlayerRoleCount[i].node.parent.convertToWorldSpaceAR(lessPlayerRoleCount[i].node.getPosition()))) {
                lessPlayerRoleCount[i].RoleDeath();
            }
        }
        let playerLevel: number = this.player.GetLevel();
        this.CreatRole(EatingGameConfig.bigPlayerRoleCount - bigPlayerRole.length, playerLevel + 1)
        this.CreatRole(EatingGameConfig.equalsPlayerRoleCount - equalsPlayerRoleCount, playerLevel);
    }

    protected update(dt: number): void {
        console.log(this.roleManager.GetRoles().length);
        if (this.boyCount < EatingGameConfig.gameMaxBoy) this.CreatBoy();
        let a = Date.now()
        if (null != this.roleManager) this.roleManager.UpdateRoleEat();
        if (Date.now() - a > 100) console.log("处理eat逻辑的时间", Date.now() - a > 100);
        this.UpdateRole();
        // if (this.roleManager.GetRoles().length == 1) this.CreatRole(10, 1);
    }
}
