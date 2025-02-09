//the class play is responsible for all of the physics and movement



class Play extends Phaser.Scene{
    constructor(){
        super("playScene")
    }

    create(){
        //tile sprite, initializes the canvas basically
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)

        // initalizes the background 
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)

        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)
        this.p1Rocket = new Rocket(this,game.config.width/2,game.config.height-borderUISize-borderPadding,'rocket').setOrigin(0.5,0)


        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0)
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0)
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0)

        //golden ship
        this.ship04 = new Spaceship(this, game.config.width + borderUISize*9, borderUISize*7 + borderPadding*6, 'golden', 0, 100).setOrigin(0, 0)
        this.ship04.moveSpeed = game.settings.spaceshipSpeed * 1.5


        //define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

        //initialize score 
        this.p1Score = 0


        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)

        // GAME OVER flag
        this.gameOver = false

        // 60-second play clock
        scoreConfig.fixedWidth = 0
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← for Menu', scoreConfig).setOrigin(0.5)
            this.gameOver = true
        }, null, this)


        //display time

         //Display the time remaining
         this.timeTotal = game.settings.gameTimer;

         //time config
         let timeConfig = {
             fontFamily: 'Courier',
             fontSize: '28px',
             backgroundColor: '#F3B141',
             color: '#843605',
             align: 'right',
             padding: {
                 top: 5,
                 bottom: 5,
             },
             fixedWidth: 100
         }
         this.timeRemain = this.add.text(game.config.width/1.2, borderUISize + borderPadding * 2, this.timeTotal / 1000, timeConfig).setOrigin(0.5, 0);
 
         //decrease time
         this.timeDecrease = this.time.addEvent({
             delay: 1000,
             callback: () =>{
                 this.timeTotal -= 1000,
                 this.timeRemain.text = this.timeTotal / 1000;
             },
             callBackScope: this,
             loop: true
         })

         let musicConfig = {
            volume:0.5,
            loop:true
         }

         this.music = this.sound.add('music',musicConfig)

         if(!this.gameOver){
            this.music.play()
         }
         else{
            this.music.stop()
         }

    }

    update() {
        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.music.stop();
            this.scene.restart();
        }
    
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.music.stop()
            this.scene.start("menuScene");
        }
    
        this.starfield.tilePositionX -= 4;
        this.p1Rocket.update();
        this.ship01.update(); // update spaceships (x3)
        this.ship02.update();
        this.ship03.update();
        this.ship04.update();
    
        // check collisions
        if (this.checkCollision(this.p1Rocket, this.ship04)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship04);
        }
        if (this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }

       
        if (!this.gameOver) {
            
            // Update game objects if the game is not over
            this.p1Rocket.update(); // update rocket sprite
            this.ship01.update();   // update spaceships (x3)
            this.ship02.update();
            this.ship03.update();
            this.ship04.update();
        }
    }
    
    

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
          rocket.x + rocket.width > ship.x && 
          rocket.y < ship.y + ship.height &&
          rocket.height + rocket.y > ship. y) {
          return true
        } else {
          return false
        }
      }

      shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode')             // play explode animation
        boom.on('animationcomplete', () => {   // callback after anim completes
          ship.reset()                         // reset ship position
          ship.alpha = 1                       // make ship visible again
          boom.destroy()                       // remove explosion sprite
        })
           
        
                // score add and text update
        this.p1Score += ship.points
        this.timeTotal += 3000; // Add 2 seconds for a successful hit
        this.timeRemain.text = this.timeTotal / 1000
        this.scoreLeft.text = this.p1Score
        this.sound.play('sfx-explosion')  

      }

}