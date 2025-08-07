import Phaser, { Physics } from "phaser";

const sizes = {
  width: 480,
  height: 480,
};

const speedDown = 500; // y ekseninde aşağı doğru çekim değeri

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");

class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 50; // sepet hızı yer çekiminden 50 fazla
    this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
    this.bgMusic;
    this.coinMusic;
    this.emitter;
  }

  preload() {
    this.load.image("bg", "assets/bg.png"); // arkaplan görseli bg adıyla tanımlandı
    this.load.image("tree", "assets/tree.png");
    this.load.image("basket", "assets/basket.png");
    this.load.image("apple", "assets/apple.png");
    this.load.audio("bgMusic", "assets/bgMusic.mp3");
    this.load.audio("coinMusic", "assets/coinMusic.wav");
    this.load.image("stars", "assets/stars.png");
  }

  create() {
    this.scene.pause("game-scene");

    this.coinMusic = this.sound.add("coinMusic");
    this.coinMusic.setVolume(0.7);
    this.bgMusic = this.sound.add("bgMusic", { loop: true });
    this.bgMusic.setVolume(0.3);
    this.bgMusic.play();

    this.add
      .image(0, 0, "bg")
      .setOrigin(0, 0)
      .setDisplaySize(sizes.width, sizes.height);
    // bg görselini 0, 0 koordinata ve 0, 0 orjine 640, 480 boyutlarında yerleştir
    this.add
      .image(sizes.width / 2, sizes.height - 380, "tree")
      .setDisplaySize(700, 700);
    this.player = this.physics.add
      .image(0, sizes.height - 125, "basket")
      .setOrigin(0, 0)
      .setDisplaySize(80, 64);
    this.player.setImmovable(true); // sepet hareket edebilir
    this.player.body.allowGravity = false; // sepet yer çekiminden etkilenmeyecek
    this.player.setCollideWorldBounds(true); // oyun ekranı dışına çıkamaz
    this.player.setSize(400, 1); // sepet görselinin kenarlarında çarpışma olmasın diye hitbox küçültüldü

    this.target = this.physics.add
      .image(0, 0, "apple")
      .setOrigin(0, 0)
      .setDisplaySize(28, 28);

    this.target.setMaxVelocity(0, speedDown);

    this.physics.add.overlap(
      // çarpışma olayında targetHit fonksiyonunu çalıştır
      this.target,
      this.player,
      this.targetHit,
      null,
      this
    );

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "24px Consolas",
      fill: "#ffffff",
    });

    this.textTime = this.add.text(20, 10, "Time: 60", {
      font: "24px Consolas",
      fill: "#ffffff",
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);

    this.emitter = this.add.particles(this.player.x, this.player.y, "stars", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.04,
      duration: 100,
      emitting: false,
    });
  }

  update() {
    this.emitter.setPosition(this.player.x + 35, this.player.y + 10);
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText(`Time: ${Math.round(this.remainingTime).toString()}`);

    if (this.target.y >= sizes.height) {
      this.target.setY(0); // elma düştükten sonra yukarı tekrar getirilir
      this.target.setX(this.getRandomX() - 5); // yeni düşecek elmanin x konumu rastgele
    }

    const { left, right } = this.cursor;

    if (left.isDown) {
      // sağ ve sol ok tuşları basıldıkça x ekseninde sağa ve sola hareket
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * sizes.width);
  }

  targetHit() {
    this.coinMusic.play();
    this.emitter.start();
    this.target.setY(0);
    this.target.setX(this.getRandomX() - 5);
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  }

  gameOver() {
    this.bgMusic.stop();
    this.sys.game.destroy(true);
    gameEndScoreSpan.textContent = this.points;
    gameEndDiv.style.display = "flex";
  }
}

const config = {
  type: Phaser.WEBGL, // webgl kullanılacak
  width: sizes.width,
  height: sizes.height,
  canvas: document.getElementById("gameCanvas"), // canvas id ile belirtildi
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: false,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  game.scene.resume("game-scene");
});
