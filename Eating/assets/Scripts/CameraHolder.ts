import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Node])
    cameras: cc.Node[] = [];

    private ModifyCamera() {
        this.cameras.forEach((value) => {
            value.setPosition(this.node.parent.convertToNodeSpaceAR(Player.Instance.node.parent.convertToWorldSpaceAR(Player.Instance.node.getPosition())));
        })
    }

    update(dt) {
        this.ModifyCamera();
    }
}
