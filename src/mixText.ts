import { DisplayObject, Rectangle, RenderTarget, BaseRenderTexture, RenderTexture, TextStyle } from "pixi.js";
import TWEEN from "@tweenjs/tween.js";

export class MixedText extends PIXI.Container
{
    private app:PIXI.Application;
    private currentString:string;

    private textStyle:PIXI.TextStyleOptions;
    private autoAppendDelayer:TWEEN.Tween;

    private currentWords:DisplayObject[];
    private temporarySpace:DisplayObject;

    public safeHeight:number;

    constructor(currentApp:PIXI.Application) {
        super();
        this.app = currentApp;
        this.currentString = "";
        this.currentWords = [];
        
        this.temporarySpace = this.renderText(" ");

        this.textStyle = {
            align: "left",
            fill: 0xFFFFFF,
            fontSize: 18
        };
    }

    public stopAndClearAutoAppend()
    {
        if (this.autoAppendDelayer != null) 
        {
            this.autoAppendDelayer.stop();
        }
        this.autoAppendDelayer = null

        this.clearWords();
    }

    public clearWords()
    {
        this.removeChildren();
        for (var i = 0; i < this.currentWords.length; i++)
        {
            this.currentWords[i].destroy();
        }
        this.currentWords = [];
    }

    public autoAppend():void
    {
        this.stopAndClearAutoAppend();
        var randomString:string[] = [
            "Create", "144", "sprites", "(NOT", "graphics", "object)", "that", "are", "stack", "on", "each", "other", "like", "cards", 
            "(so", "object", "above", "covers", "bottom", "one,", "but", "not", "completely).", "Every", "second", "1", "object", "from", 
            "libraries", "how", "you", "would", "use", "them", "in", "a", "real", "project", "🤩", "🤔", "🤨", "😐", "😑", "😶", 
            "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", 
            "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
            "{{bear}}", "{{buffalo}}", "{{chick}}", "{{chicken}}", "{{cow}}", "{{crocodile}}", "{{dog}}", "{{duck}}", 
            "{{elephant}}", "{{frog}}", "{{giraffe}}", "{{goat}}", "{{gorilla}}", "{{hippo}}", "{{horse}}", "{{monkey}}", 
            "{{moose}}", "{{narwhal}}", "{{owl}}", "{{panda}}", "{{parrot}}", "{{penguin}}", "{{pig}}", "{{rabbit}}", "{{rhino}}", 
            "{{sloth}}", "{{snake}}", "{{walrus}}", "{{whale}}", "{{zebra}}"];
        
        this.demoTripleAppend(randomString);
        var counter:any = {x: 0};
        this.autoAppendDelayer = new TWEEN.Tween(counter)
            .to({x: 1}, 2000)
            .onUpdate(() => {
                if (counter.x == 1) 
                {
                    counter.x = 0;
                    this.demoTripleAppend(randomString);
                }
            })
            .repeat(Infinity)
            .start();
    }

    private demoTripleAppend(randomString:string[])
    {
        this.textStyle.fontSize = 18 + (Math.floor(Math.random() * 100) % 40);
        var num1:number = Math.floor((Math.random() * 100)) % randomString.length;
        this.append(randomString[num1]);
        
        this.textStyle.fontSize = 18 + (Math.floor(Math.random() * 100) % 40);
        var num2:number = Math.floor((Math.random() * 100)) % randomString.length;
        this.append(randomString[num2]);
        
        this.textStyle.fontSize = 18 + (Math.floor(Math.random() * 100) % 40);
        var num3:number = Math.floor((Math.random() * 100)) % randomString.length;
        this.append(randomString[num3], true);
    }

    public append(str:string, immediateRender:boolean = false):void
    {
        this.currentString += str + " ";
        this.parseText(str);

        if (immediateRender)
        {
            this.render();
        }
    }

    public parseText(str:string):void
    {
        this.removeChildren();

        var currentCopy:string[] = this.currentString.split(" ");
        var obj:DisplayObject;
        if (str.indexOf("{{") > -1) 
        {
            var fragment = str.replace("{{", "").replace("}}", "");
            obj = this.renderImage(fragment);
        }
        else {
            obj = this.renderText(str);
        }
        this.currentWords.push(obj);
    }

    public render():void
    {
        var temporarySpaceBounds:Rectangle = this.temporarySpace.getBounds();
        var startX:number = 10;
        var nextX:number = startX;
        var nextY:number = this.safeHeight;
        var maxX:number = this.app.renderer.width - nextY;
        var highestY:number = 0;
        for (var i = 0; i < this.currentWords.length; i++)
        {
            var disp:DisplayObject = this.currentWords[i];
            var dispBounds:Rectangle = disp.getBounds();
            if (nextX + dispBounds.width + temporarySpaceBounds.width > maxX)
            {
                nextY += highestY;
                highestY = 0;
                nextX = startX;
            }

            disp.x = nextX;
            disp.y = nextY;

            this.addChild(disp);

            nextX += dispBounds.width + temporarySpaceBounds.width;
            
            if (highestY < dispBounds.height)
            {
                highestY = dispBounds.height;
            }
        }
    }

    private renderText(str:string):DisplayObject
    {
        var txt:PIXI.Text = new PIXI.Text(str, this.textStyle);
        return txt;
    }

    private renderImage(str:string):DisplayObject
    {
        var texture:PIXI.Texture = PIXI.loader.resources["assets/round_nodetailsOutline.json"].textures[str+".png"];
        if (texture == null)
        {
            return this.renderText(" ");
        }
        else {
            var spr:PIXI.Sprite = new PIXI.Sprite(texture);
            var currentTextSize:number = this.textStyle.fontSize as number;
            var scale:number = (1 - 0.2) * (currentTextSize - 18) / (58 - 18) + 0.2;
            spr.scale.x = spr.scale.y = scale;
            return spr;
        }
    }
}