export default class EatingGameConfig {
    public static roleMoveSpeed = 300;
    public static boySpeed = 400;
    public static boyAcceleration = 3000;
    public static maxEatingTime = 0.05;
    public static bigPlayerRoleCount = 2;
    public static equalsPlayerRoleCount = 3;
    public static lessPlayerRoleOnt = 2;
    public static lessPlayerRoleCount = 5;
    public static maxEnemyRole = 15;
    public static gameMaxBoy = 20;
    public static nodePoolInitCount = {
        boy: 20,
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


