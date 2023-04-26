import EatingUtil from "./EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraHolder extends cc.Component {
    @property([cc.Node])
    cameras: cc.Node[] = [];
    public player;
    private zoomRatio = 1;
    private ModifyCamera(dt: number) {
        if (!this.player || !cc.isValid(this.player)) return;
        this.cameras.forEach((value) => {
            value.setPosition(this.node.parent.convertToNodeSpaceAR(this.player.node.parent.convertToWorldSpaceAR(this.player.node.getPosition())));
            value.getComponent(cc.Camera).zoomRatio = EatingUtil.Lerp(value.getComponent(cc.Camera).zoomRatio, this.zoomRatio, dt);
        })
    }

    public InPlayerHorizons(worldPos): boolean {
        let camera = this.cameras[0];
        let HorizonsSize = cc.v2(cc.winSize.width, cc.winSize.height).mul(1 / camera.getComponent(cc.Camera).zoomRatio);
        console.log(HorizonsSize.x, HorizonsSize.y);
        if (worldPos.x < ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).x) - HorizonsSize.x / 2) ||
            worldPos.x > ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).x) + HorizonsSize.x / 2) ||
            worldPos.y > ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).y) + HorizonsSize.y / 2) ||
            worldPos.y < ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).y) - HorizonsSize.y / 2)) return false;
        return true;
    }

    public RoleInPlayerHorizons(role): boolean {
        let camera = this.cameras[0];
        let cameraWorldPos: cc.Vec2 = camera.parent.convertToWorldSpaceAR(camera.getPosition());
        let roleWorldPos: cc.Vec2 = role.node.parent.convertToWorldSpaceAR(role.node.getPosition());
        let HorizonsSize = cc.v2(cc.winSize.width, cc.winSize.height).mul(1 / camera.getComponent(cc.Camera).zoomRatio);
        let cameraRect: cc.Rect = cc.Rect.fromMinMax(cc.v2(cameraWorldPos.x - HorizonsSize.x / 2, cameraWorldPos.y - HorizonsSize.y / 2), cc.v2(cameraWorldPos.x + HorizonsSize.x / 2, cameraWorldPos.y + HorizonsSize.y / 2));
        let roleRect: cc.Rect = cc.Rect.fromMinMax(cc.v2(roleWorldPos.x - role.radius, roleWorldPos.y - role.radius), cc.v2(roleWorldPos.x + role.radius, roleWorldPos.y + role.radius))
        if (cameraRect.intersects(roleRect)) return true;
        return false;
    }

    public SetZoomRatio(level) {
        let zoomRatio: number;
        if (level <= 2) zoomRatio = 1;
        else if (level <= 4) zoomRatio = 0.9;
        else if (level <= 6) zoomRatio = 0.8;
        else if (level <= 8) zoomRatio = 0.7;
        else {
            zoomRatio = 0.6;
        }
        this.zoomRatio = zoomRatio;
    }

    update(dt) {
        this.ModifyCamera(dt);
    }
}
