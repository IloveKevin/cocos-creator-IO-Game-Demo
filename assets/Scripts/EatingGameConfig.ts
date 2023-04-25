export default class EatingGameConfig {
    public static roleMoveSpeed = 300;
    public static boySpeed = 400;
    public static boyAcceleration = 1500;
    public static maxEatingTime = 0.1;
    public static bigPlayerRoleCount = 2;
    public static equalsPlayerRoleCount = 5;
    public static lessPlayerRoleCount = 10;
    public static gameMaxBoy = 20;
    public static nodePoolInitCount = {
        boy: 50,
        role: 5,
        playerVisual: 20,
        enemyVisual: 20
    }
    public static ColliderTag = {
        boy: 0,//boy
        WAIYUAN: 1,//外圆
        NEIYUAN: 2//内圆
    }
}


