import RoleBase from "./Base/RoleBase";
import Boy from "./Boy";
import CameraHolder from "./CameraHolder";
import EatingGameConfig from "./EatingGameConfig";
import EatingGameSounds from "./EatingGameSounds";
import EatingNodePool, { nodePoolEnum } from "./EatingNodePool";
import Player from "./Player";
import RoleManager from "./RoleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGame extends cc.Component {
    @property(CameraHolder)
    cameraHolder: CameraHolder = null;
    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    boyPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    boyVisualPrefab: cc.Prefab = null;
    @property([cc.Prefab])
    visualPrefabs: cc.Prefab[] = [];
    @property(cc.Node)
    wallNode: cc.Node = null;
    @property(EatingGameSounds)
    public eatingGameSounds: EatingGameSounds = null;
    @property(cc.Prefab)
    addPrefab: cc.Prefab = null;
    public boyCount = 0;
    public player: Player;
    public roleManager: RoleManager;
    private boyId: number = 0;
    private roleId: number = 0;
    public eatingNodePool: EatingNodePool;

    private bigPlayerRoleOne: RoleBase[] = [];
    private bigPlayerRole: RoleBase[] = [];
    private lessPlayerRoleOntCount: number = 0;
    private lessPlayerRole: RoleBase[] = [];
    public destroyedTime = 0;
    public dangqiandt: number = 0;

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
    }

    protected start(): void {
        this.InitGame();
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

    public InitGame() {
        this.roleManager = new RoleManager();
        this.InitNodePool();
        let newPlayer = this.GetRole(true);
        newPlayer.zIndex = 10;
        newPlayer.setParent(this.node);
        this.player = newPlayer.getComponent(Player);
        this.cameraHolder.player = this.player;
        this.player.Init(this, 1, false);
        this.roleManager.AddRole(this.player);
    }

    private InitNodePool() {
        this.eatingNodePool = new EatingNodePool();
        this.eatingNodePool.CreatNodePool(nodePoolEnum.boy, this.boyPrefab, "Boy");
        this.eatingNodePool.CreatNodePool(nodePoolEnum.boyVisual, this.boyVisualPrefab);
        this.eatingNodePool.CreatNodePool(nodePoolEnum.role, this.rolePrefab, "RoleBase");
        this.eatingNodePool.CreatNodePool(nodePoolEnum.playerVisual, this.visualPrefabs[0]);
        for (let i = 1; i <= 10; i++) {
            this.eatingNodePool.CreatNodePool(this.eatingNodePool.GetVisualNodePool(i), this.visualPrefabs[i]);
        }
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
        let boy = newBoy.getComponent(Boy);
        boy.Init(this);
        boy.inGame = true;
        newBoy.setParent(this.node);
        newBoy.setPosition(this.node.convertToNodeSpaceAR(pos));
    }

    public GetBoy() {
        let newBoy = this.eatingNodePool.GetNode(nodePoolEnum.boy);
        newBoy.zIndex = 50;
        let boy = newBoy.getComponent(Boy);
        boy.ChangeTarget(null, cc.v2(0, 0));
        boy.id = this.boyId;
        this.boyId++;
        return newBoy
    }

    public GameOver() {
        this.boyCount = 0;
        this.node.children.forEach((value) => {
            if ("Boy" == value.name) value.destroy();
        })
        this.player.node.destroy();
        this.player = null;
        this.roleManager.GetRoles().forEach((value) => {
            value.GetBoyManager()
            value.node.destroy();
        })
        this.roleManager.ClearRole();
        this.boyId = 0;
        this.roleId = 0;
        this.eatingNodePool.ClearPool();
        this.bigPlayerRoleOne = [];
        this.bigPlayerRole = [];
        this.lessPlayerRoleOntCount = 0;;
        this.lessPlayerRole = [];
        this.destroyedTime = 0;
        setTimeout(() => {
            this.InitGame();
        }, 3000);
    }

    public GetRole(isPlayer: boolean = false) {
        let newRole = this.eatingNodePool.GetNode(nodePoolEnum.role);
        let role;
        if (isPlayer) {
            newRole.getComponent(RoleBase).destroy();
            role = newRole.addComponent(Player);
        } else {
            role = newRole.getComponent(RoleBase);
        }
        role.id = this.roleId;
        this.roleId++;
        return newRole;
    }

    private CreatRole(count: number, level: number) {
        if (count <= 0) return;
        for (let i = 0; i < count; i++) {
            let a = Date.now();
            if (this.roleManager.GetRoles().length - 1 >= EatingGameConfig.maxEnemyRole) return;
            let newRole = this.GetRole();
            let role = newRole.getComponent(RoleBase);
            newRole.setParent(this.node);
            let pos = this.GetInWallPos();
            newRole.setPosition(newRole.parent.convertToNodeSpaceAR(pos));
            role.radius = 60 + 30 * (level - 1);
            for (; this.cameraHolder.RoleInPlayerHorizons(role);) {
                pos = this.GetInWallPos();
                newRole.setPosition(newRole.parent.convertToNodeSpaceAR(pos));
                role.radius = 60 + 30 * (level - 1);
            }
            // pos = cc.v2(0, 0);
            // newRole.setPosition(pos);
            role.Init(this, level);
            this.roleManager.AddRole(role);
            // console.log("创建role的时间", Date.now() - a);
        }
    }

    private UpdateRole(dt: number) {
        if (!this.player || !cc.isValid(this.player)) return;
        let roles = this.roleManager.GetRoles();
        this.bigPlayerRoleOne = [];
        this.bigPlayerRole = [];
        let equalsPlayerRoleCount: number = 0;
        this.lessPlayerRoleOntCount = 0;
        this.lessPlayerRole = [];
        roles.forEach((value) => {
            if ((value.GetLevel() - this.player.GetLevel()) > 1) {
                // value.RoleDeath();
                this.bigPlayerRole.push(value);
            }
            else if (1 == (value.GetLevel() - this.player.GetLevel())) {
                this.bigPlayerRoleOne.push(value);
            }
            else if (0 == (value.GetLevel() - this.player.GetLevel()) && value != this.player) {
                equalsPlayerRoleCount++;
            }
            else if (0 > (value.GetLevel() - this.player.GetLevel())) {
                if (-1 == (value.GetLevel() - this.player.GetLevel())) this.lessPlayerRoleOntCount++;
                this.lessPlayerRole.push(value);
            }
        })
        this.destroyedTime += dt;
        this.DestroyedRole();
        let playerLevel: number = this.player.GetLevel();
        this.CreatRole(EatingGameConfig.bigPlayerRoleCount - this.bigPlayerRoleOne.length, playerLevel + 1)
        this.CreatRole(EatingGameConfig.equalsPlayerRoleCount - equalsPlayerRoleCount, playerLevel);
        if (playerLevel - 1 > 0) this.CreatRole(EatingGameConfig.lessPlayerRoleOnt - this.lessPlayerRoleOntCount, playerLevel - 1);
    }

    private DestroyedRole() {
        this.destroyedTime = 0;
        for (let i = 0; i < this.bigPlayerRole.length; i++) {
            if (!this.cameraHolder.RoleInPlayerHorizons(this.bigPlayerRole[i]) && this.bigPlayerRole[i].beDeth == false) {
                // console.log("销毁比我大很多的", this.dangqiandt);
                this.bigPlayerRole[i].RoleDeath();
                return;
            }
        }
        for (let i = 0; i < this.bigPlayerRoleOne.length; i++) {
            if (this.bigPlayerRoleOne.length > EatingGameConfig.bigPlayerRoleCount && this.bigPlayerRoleOne[i].beDeth == false) {
                // console.log("销毁比我大的", this.dangqiandt);
                this.bigPlayerRoleOne[i].RoleDeath();
                return;
            }
        }
        for (let i = 0; i < this.lessPlayerRole.length; i++) {
            if (this.lessPlayerRole.length > EatingGameConfig.lessPlayerRoleCount && this.lessPlayerRole[i].beDeth == false) {
                // console.log("销毁比我小的", this.player.GetLevel());
                this.lessPlayerRole[i].RoleDeath();
                return;
            }
        }
    }

    public LogRoles() {
        let s = "";
        this.roleManager.GetRoles().forEach((value) => {
            let a = "," + value.id;
            s += a;
        })
        console.log(s);
    }

    protected update(dt: number): void {
        if (this.player && this.player.GetLevel() > 10) this.GameOver();
        this.dangqiandt++
        if (dt > 0.05) console.error("当前帧数", this.dangqiandt, "帧间隔", dt, "--------------------------------------------------");
        // console.log("当前有多少角色", this.roleManager.GetRoles().length);
        if (this.boyCount < EatingGameConfig.gameMaxBoy) this.CreatBoy();
        if (null != this.roleManager) this.roleManager.UpdateRoleEat();
        if (this.dangqiandt > 200) this.UpdateRole(dt);
        // this.UpdateRole(dt);
        // if (this.roleManager.GetRoles().length == 1) this.CreatRole(1, 2);
    }
}
