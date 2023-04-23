import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraHolder extends cc.Component {
    public static Instance: CameraHolder;
    @property([cc.Node])
    cameras: cc.Node[] = [];

    protected onLoad(): void {
        CameraHolder.Instance = this;
    }
    private ModifyCamera() {
        if (!Player.Instance) return;
        this.cameras.forEach((value) => {
            value.setPosition(this.node.parent.convertToNodeSpaceAR(Player.Instance.node.parent.convertToWorldSpaceAR(Player.Instance.node.getPosition())));
        })
    }

    public InPlayerHorizons(worldPos): boolean {
        let pos = this.node.parent.convertToNodeSpaceAR(worldPos);
        let camera = this.cameras[0];
        let HorizonsSize = cc.v2(cc.winSize.width * 2, cc.winSize.height * 2).mul(camera.getComponent(cc.Camera).zoomRatio);
        if (worldPos.x < ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).x) - HorizonsSize.x / 2) ||
            worldPos.x > ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).x) + HorizonsSize.x / 2) ||
            worldPos.y > ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).y) + HorizonsSize.y / 2) ||
            worldPos.y < ((camera.parent.convertToWorldSpaceAR(camera.getPosition()).y) - HorizonsSize.y / 2)) return false;
        return true;
    }

    update(dt) {
        this.ModifyCamera();
    }
}
