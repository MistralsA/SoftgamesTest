import TWEEN from '@tweenjs/tween.js';
import { DisplayObject } from 'pixi.js';
import "pixi-layers";

/**
 * Programming demo test for Softgames
 * Created by Sandra Koo
 * Started: April 2, 2019, 10:40AM EST
 * Due: April 4, 2019, 9AM EST/17:00 CET
 */
export class Cards extends PIXI.display.Layer
{
    private app:PIXI.Application;   //The base pixi application
    private sortingGroup:any;   //PIXI.display.Group, for sorting zOrder
    private cardList:PIXI.Sprite[]; //Collection of cards
    private cardDimensions:PIXI.Rectangle;  //Used for calculating positions
    private allTweens:TWEEN.Tween[];    //An array of all the tweens so they can be restarted
    private cardStackY:number = 75;     //The position of Y without colliding with anything

    constructor(currentApp:PIXI.Application)
    {
        super();
        this.app = currentApp;

        this.allTweens = [];
        this.cardList = [];
        this.cardDimensions = new PIXI.Rectangle(0, 0, 75, 100);

        this.sortingGroup = new PIXI.display.Group(0, false);
        this.group.enableSort = true;

        this.initCards();
    }

    private initCards():void
    {
        this.createCards();
    }

    /**
     * Cards are created here
     */
    private createCards():void
    {
        for (var i = 0; i < 144; i++)
        {
            var card:PIXI.Sprite = this.createCard(i);
            this.cardList.push(card);
        }
    }

    /**
     * Cards are returned as a PIXI.Sprite.
     * They can be using a texture or drawn inside.
     * @param index 
     */
    private createCard(index:number):PIXI.Sprite
    {
        var card:PIXI.Sprite;
        card = new PIXI.Sprite();
        // card = new PIXI.Sprite(PIXI TEXTURE HERE);    //An actual sprite texture can be used

        ////////////////////////////////
        // Drawing the card
        var glitterCross:PIXI.Sprite = new PIXI.Sprite(PIXI.loader.resources["assets/GlitterCross.png"].texture);
        var temporaryTexture:PIXI.Graphics = new PIXI.Graphics();
        var c:number = Math.floor(Math.random() * 0xFFFFFF); //random colour for card
        var textColor:number = 0;   //Black text
        if (c < 0x777777) { textColor = 0xFFFFFF; } //If card colour is too dark, change the text to white
        temporaryTexture.beginFill(c);
        temporaryTexture.lineStyle(2, 0x555555);
        temporaryTexture.drawRect(0, 0, this.cardDimensions.width, this.cardDimensions.height)
        temporaryTexture.endFill();
        var topTxt:PIXI.Text = new PIXI.Text("" + index, {fill: textColor, fontSize: 18, align: "center"});
        var botTxt:PIXI.Text = new PIXI.Text("" + index, {fill: textColor, fontSize: 18, align: "center"});
        glitterCross.x = this.cardDimensions.width - glitterCross.width;
        topTxt.x = 2;
        botTxt.x = (this.cardDimensions.width - botTxt.width);
        botTxt.y = (this.cardDimensions.height - botTxt.height);
        temporaryTexture.addChild(glitterCross);
        temporaryTexture.addChild(topTxt);
        temporaryTexture.addChild(botTxt);
        card.addChild(temporaryTexture);
        //End of drawing
        //////////////////////////////////

        return card;
    }

    /**
     * Positions cards in the middle of the stage on top of each other
     */
    private arrangeCards():void
    {
        var xPos:number = (this.app.screen.width - this.cardDimensions.width)/2;
        var nextY:number = (this.app.screen.height - this.cardDimensions.height)/2;
        for (var i = this.cardList.length - 1; i > -1; i--)
        {
            var card:PIXI.Sprite = this.cardList[i];

            card.x = xPos;
            card.y = nextY;
            card.rotation = 0;
            card.zOrder = i;
            card.parentGroup = this.sortingGroup;
            this.addChild(card);
        }
    }

    /**
     * Stops all the tweens
     */
    public stopAnimation():void
    {
        for (var i = 0; i < this.allTweens.length; i++)
        {
            this.allTweens[i].stopChainedTweens();
            this.allTweens[i].stop();
        }
        this.allTweens = [];
    }

    /**
     * Stops whatever is tweening and arranges it to the middle
     */
    private startFromBeginning():void
    {
        this.stopAnimation();
        this.arrangeCards();
    }

    /**
     * Called from Main.ts
     */
    public startAnimation():void
    {
        this.startFromBeginning();  //Moves it to the middle

        //Tweens all cards from the middle to the side and creates a visible stack
        var xPos:number = 10;
        var nextY = this.cardStackY + (this.cardList.length*this.cardDimensions.height*0.2);
        var startingTween:boolean = false;
        for (var i = this.cardList.length - 1; i > -1; i--)
        {
            var card:PIXI.Sprite = this.cardList[i];
            var obj:any = {x: xPos, y: nextY};
            var tempTween2:TWEEN.Tween = new TWEEN.Tween(card).to({y:nextY}, 1000);
            if (!startingTween) 
            {
                startingTween = true;
                //tempTween2.onComplete(this.tweenCards)
                tempTween2.onComplete(()=>
                {
                    this.tweenCard(this.cardList[0]);   //At the end it starts moving the cards
                });
            }
            var tempTween:TWEEN.Tween = new TWEEN.Tween(card)
                .to({x:xPos}, 1000)
                .chain(tempTween2)
                .start();
            
            this.allTweens.push(tempTween);
            this.allTweens.push(tempTween2);

            card.zOrder = i;
            card.parentGroup = this.sortingGroup;
            this.addChild(card);

            nextY -= this.cardDimensions.height*0.2;
        }
    }

    /**
     * Tweens a single card from one side of the stack to the other
     * The other cards in both stacks will move up or down to keep the top card/just added card on stage
     */
    private tweenCard = (card:PIXI.Sprite) =>
    {
        var index:number = this.cardList.indexOf(card);
        var originX:number = 10;

        var halfScreenPoint:PIXI.Point = new PIXI.Point(this.app.screen.width*0.6, this.app.screen.height*0.7);
        
        var travelTime:number = 2000;
        var targetY:number = this.cardStackY;
        var targetX:number = this.app.screen.width - (this.cardDimensions.width * 1.3);

        for (var i = 0; i < this.cardList.length; i++)
        {
            if (i == index) 
            { 
                //Tweens the card to the other side, with some rotation and dipping in the Y position
                var tempTween:TWEEN.Tween = new TWEEN.Tween(card)
                .to({x: [halfScreenPoint.x, halfScreenPoint.x, targetX], y:[halfScreenPoint.y, targetY], rotation:[0, 0, Math.PI, 2*Math.PI]}, travelTime)
                .onStart(()=> 
                {
                    this.bringToFront(card);
                })
                .interpolation(TWEEN.Interpolation.Bezier)
                .onComplete(() => 
                {
                    if (index+1 != this.cardList.length)
                    {
                        var obj:any = {x:0};
                        var tTween:TWEEN.Tween = new TWEEN.Tween(obj)   //Delays the next card from flying out 
                            .to({x:1}, 1000)
                            .onComplete(() => 
                            {
                                this.tweenCard(this.cardList[index+1]);
                            })
                            .start();
                        this.allTweens.push(tTween);
                    }
                })
                .start();
                this.allTweens.push(tempTween);
                continue; 
            }
            var pickedCard:PIXI.Sprite = this.cardList[i];
            
            var miniTargetY:number = 0;
            var miniTargetX:number = originX;
            if (i < index)
            {
                miniTargetY = pickedCard.y + this.cardDimensions.height*0.2;    //Cards on the right stack move down
                miniTargetX = targetX;  //In case resizing causes position shifts, this will bring it back
            }
            else if (i > index)
            {
                miniTargetY = pickedCard.y - this.cardDimensions.height*0.2;    //Cards on the left stack move up
            }
            
            var tempTween:TWEEN.Tween = new TWEEN.Tween(pickedCard)
            .to({x: miniTargetX, y: miniTargetY}, travelTime/2)
            .start();
            this.allTweens.push(tempTween);
        }
    }

    /*
    Another method of tweening cards to the other side. This one uses chains instead of onComplete

    private tweenCards = ():void =>
    {
        var nextY:number = this.app.screen.height - this.cardDimensions.height;
        var xPos:number = this.app.screen.width - (this.cardDimensions.width * 1.3);
        var lastTween:TWEEN.Tween;
        var startTween:TWEEN.Tween;
        for (var i = 0; i < this.cardList.length; i++)
        {
            var card:PIXI.Sprite = this.cardList[i];
            var tempTween:TWEEN.Tween = new TWEEN.Tween(card);
            if (startTween == null) 
            {
                startTween = tempTween;
            }
            else 
            {
                lastTween.chain(tempTween);
            }
            this.allTweens.push(tempTween);

            tempTween.to({x: xPos, y:nextY}, 2000)
                .onStart(()=> 
                {
                    this.bringToFront(card);
                })
                .delay(1000);
            
            lastTween = tempTween;

            nextY -= this.cardDimensions.height*0.2;
        }
        startTween.start();
    }
    */

    /**
     * Modifies the Z order of all cards.
     */
    private bringToFront = (disp:DisplayObject) => 
    {
        for (var i = 0; i < this.cardList.length; i++)
        {
            this.cardList[i].zOrder--;
        }
        disp.zOrder = this.cardList.length+1;
    }
}