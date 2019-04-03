import TWEEN, { Tween } from '@tweenjs/tween.js';
import { DisplayObject } from 'pixi.js';
import "pixi-layers";
import { Layer, Group } from 'pixi-layers';

export class Cards extends PIXI.display.Layer
{
    private sortingGroup:any;
    private cardList:PIXI.Sprite[];
    private app:PIXI.Application;
    private cardDimensions:PIXI.Rectangle;
    private allTweens:TWEEN.Tween[];
    private cardStackY:number = 50;

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

    private createCards():void
    {
        for (var i = 0; i < 144; i++)
        {
            var card:PIXI.Sprite = this.createCard(i);
            this.cardList.push(card);
        }
    }

    private arrangeCards():void
    {
        var xPos:number = (this.app.screen.width - this.cardDimensions.width)/2;
        var nextY:number = (this.app.screen.height - this.cardDimensions.height)/2;
        for (var i = this.cardList.length - 1; i > -1; i--)
        {
            var card:PIXI.Sprite = this.cardList[i];

            card.x = xPos;
            card.y = nextY;
            card.zOrder = i;
            card.parentGroup = this.sortingGroup;
            this.addChild(card);
        }
    }

    private createCard(index:number):PIXI.Sprite
    {
        var card:PIXI.Sprite;
        card = new PIXI.Sprite();
        //card = new PIXI.Sprite(PIXI TEXTURE HERE);

        var temporaryTexture:PIXI.Graphics = new PIXI.Graphics();

        var c:number = Math.floor(Math.random() * 0xFFFFFF);
        var textColor:number = 0;
        if (c < 0x777777) { textColor = 0xFFFFFF; }
        temporaryTexture.beginFill(c);
        temporaryTexture.lineStyle(2, 0x555555);
        temporaryTexture.drawRect(0, 0, this.cardDimensions.width, this.cardDimensions.height)
        temporaryTexture.endFill();
        var topTxt:PIXI.Text = new PIXI.Text("" + index, {fill: textColor, fontSize: 18, align: "center"});
        var botTxt:PIXI.Text = new PIXI.Text("" + index, {fill: textColor, fontSize: 18, align: "center"});
        botTxt.x = (this.cardDimensions.width - botTxt.width);
        botTxt.y = (this.cardDimensions.height - botTxt.height);
        temporaryTexture.addChild(topTxt);
        temporaryTexture.addChild(botTxt);
        card.addChild(temporaryTexture);

        return card;
    }

    public stopAnimation():void
    {
        for (var i = 0; i < this.allTweens.length; i++)
        {
            this.allTweens[i].stopChainedTweens();
            this.allTweens[i].stop();
        }
        this.allTweens = [];
    }

    public startFromBeginning():void
    {
        this.stopAnimation();
        this.arrangeCards();
    }

    public startAnimation():void
    {
        this.startFromBeginning();

        var xPos:number = 10;
        var nextY = this.cardStackY + (this.cardList.length*this.cardDimensions.height*0.2);
        var startingTween:boolean = false;
        for (var i = this.cardList.length - 1; i > -1; i--)
        {
            var card:PIXI.Sprite = this.cardList[i];
            var obj:any = {x: xPos, y: nextY};
            var tempTween2:TWEEN.Tween = new TWEEN.Tween(card).to({y:nextY}, 1000);
            if (!startingTween) {
                startingTween = true;
                //tempTween2.onComplete(this.tweenCards)
                tempTween2.onComplete(()=>{this.tweenCard(this.cardList[0]);});
            }
            var tempTween:TWEEN.Tween = new TWEEN.Tween(card)
                .to({x:xPos}, 1000)
                .chain(tempTween2)
                .start();

            card.zOrder = i;
            card.parentGroup = this.sortingGroup;
            this.addChild(card);

            nextY -= this.cardDimensions.height*0.2;
        }
    }

    private tweenCard = (card:PIXI.Sprite) =>
    {
        var index:number = this.cardList.indexOf(card);
        var originX:number = 10;
        var originY = this.cardStackY + (this.cardList.length*this.cardDimensions.height*0.2);
        
        var travelTime:number = 2000;
        var targetY:number = this.cardStackY;
        var targetX:number = this.app.screen.width - (this.cardDimensions.width * 1.3);

        for (var i = 0; i < this.cardList.length; i++)
        {
            if (i == index) { 
                var tempTween:TWEEN.Tween = new TWEEN.Tween(card)
                .to({x: targetX, y:targetY}, travelTime)
                .onStart(()=> {
                    this.bringToFront(card);
                })
                .onComplete(() => {
                    if (index+1 != this.cardList.length) 
                    {
                        this.tweenCard(this.cardList[index+1]);
                    }
                })
                .start();
                this.allTweens.push(tempTween);
                continue; 
            }
            var pickedCard:PIXI.Sprite = this.cardList[i];
            
            var miniTargetY:number = 0;
            if (i < index)
            {
                miniTargetY = pickedCard.y + this.cardDimensions.height*0.2;
            }
            else if (i > index)
            {
                miniTargetY = pickedCard.y - this.cardDimensions.height*0.2;
            }
            
            var tempTween:TWEEN.Tween = new TWEEN.Tween(pickedCard)
            .to({y: miniTargetY}, travelTime/2)
            .start();
            this.allTweens.push(tempTween);
        }
    }

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
            if (startTween == null) {
                startTween = tempTween;
            }
            else {
                lastTween.chain(tempTween);
            }
            this.allTweens.push(tempTween);

            tempTween.to({x: xPos, y:nextY}, 2000)
                .onStart(()=> {
                    this.bringToFront(card);
                })
                .delay(1000);
            
            lastTween = tempTween;

            nextY -= this.cardDimensions.height*0.2;
        }
        startTween.start();
    }

    private bringToFront = (disp:DisplayObject) => {
        for (var i = 0; i < this.cardList.length; i++)
        {
            this.cardList[i].zOrder--;
        }
        disp.zOrder = this.cardList.length+1;
    }
}