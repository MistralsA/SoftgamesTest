import { DisplayObject, Rectangle} from "pixi.js";
import TWEEN from "@tweenjs/tween.js";

/**
 * Programming demo test for Softgames
 * Created by Sandra Koo
 * Started: April 2, 2019, 10:40AM EST
 * Due: April 4, 2019, 9AM EST/17:00 CET
 */
export class MixedText extends PIXI.Container
{
    private app:PIXI.Application;   //The pixi application
    private currentString:string;   //The current string of all appended words

    private textStyle:PIXI.TextStyleOptions;    //Saved text style
    private autoAppendDelayer:TWEEN.Tween;      //A tween for it to auto append words

    private currentWords:DisplayObject[];   //A list of current words and their displays
    private temporarySpace:DisplayObject;   //A placeholder for the " " text in size 18 font

    public safeHeight:number;   //The safe height to avoid crashing into the menu

    constructor(currentApp:PIXI.Application) 
    {
        super();
        this.app = currentApp;
        this.currentString = "";
        this.currentWords = [];

        this.textStyle = 
        {
            align: "left",
            fill: 0xFFFFFF,
            fontSize: 18
        };
        
        this.temporarySpace = this.renderText(" ");
    }

    /**
     * Clears all words and stops the auto appending
     */
    public stopAndClearAutoAppend()
    {
        if (this.autoAppendDelayer != null) 
        {
            this.autoAppendDelayer.stop();
        }
        this.autoAppendDelayer = null

        this.clearWords();
    }

    /**
     * Removes all words
     */
    public clearWords()
    {
        this.removeChildren();
        for (var i = 0; i < this.currentWords.length; i++)
        {
            this.currentWords[i].destroy();
        }
        this.currentWords = [];
    }

    /**
     * Auto-appends words from an array that contains: 
     * - words
     * - emojis
     * - images with a special bracket (to denote it will use a sprite)
     */
    public autoAppend():void
    {
        this.stopAndClearAutoAppend();  //Clears everything first
        var randomString:string[] =
        [
            "Create", "144", "sprites", "(NOT", "graphics", "object)", "that", "are", "stack", "on", "each", "other", "like", "cards", 
            "(so", "object", "above", "covers", "bottom", "one,", "but", "not", "completely).", "Every", "second", "1", "object", "from", 
            "libraries", "how", "you", "would", "use", "them", "in", "a", "real", "project", "🤩", "🤔", "🤨", "😐", "😑", "😶", 
            "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", 
            "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
            "{{bear}}", "{{buffalo}}", "{{chick}}", "{{chicken}}", "{{cow}}", "{{crocodile}}", "{{dog}}", "{{duck}}", 
            "{{elephant}}", "{{frog}}", "{{giraffe}}", "{{goat}}", "{{gorilla}}", "{{hippo}}", "{{horse}}", "{{monkey}}", 
            "{{moose}}", "{{narwhal}}", "{{owl}}", "{{panda}}", "{{parrot}}", "{{penguin}}", "{{pig}}", "{{rabbit}}", "{{rhino}}", 
            "{{sloth}}", "{{snake}}", "{{walrus}}", "{{whale}}", "{{zebra}}"
        ];
        
        this.demoTripleAppend(randomString);    //The first time it'll randomly append a string instead of waiting 2s for the next append
        var counter:any = {x: 0};
        this.autoAppendDelayer = new TWEEN.Tween(counter)
            .to({x: 1}, 2000)   //2 second delay
            .onUpdate(() => 
            {
                if (counter.x == 1) 
                {
                    counter.x = 0;
                    this.demoTripleAppend(randomString);    //Appends strings
                }
            })
            .repeat(Infinity)
            .start();
    }

    /**
     * Appends 3 random strings from the array above
     * @param randomString 
     */
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

    /**
     * Appends string, one at a time. If immediate render is on, it'll start rendering
     * @param str 
     * @param immediateRender 
     */
    public append(str:string, immediateRender:boolean = false):void
    {
        this.currentString += str + " ";
        this.parseText(str);

        if (immediateRender)
        {
            this.render();
        }
    }

    /**
     * Parses the string that comes in and makes a DisplayObject out of it
     * @param str 
     */
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
        else 
        {
            obj = this.renderText(str);
        }
        this.currentWords.push(obj);
    }

    /**
     * Renders all words that were currently added. 
     * Places them within the stage and avoids spilling words over on the X axis.
     * Will go infinitely downwards in the Y axis.
     * Will determine each line height as the biggest object in that line
     */
    public render():void
    {
        var temporarySpaceBounds:Rectangle = this.temporarySpace.getBounds();   //The bounds for the space character
        var startX:number = 10;
        var nextX:number = startX;
        var nextY:number = this.safeHeight;
        var maxX:number = this.app.renderer.width - nextY;  //The max amount of space the words can be placed before spilling over
        var highestY:number = 0;
        for (var i = 0; i < this.currentWords.length; i++)
        {
            var disp:DisplayObject = this.currentWords[i];
            var dispBounds:Rectangle = disp.getBounds();
            if (nextX + dispBounds.width + temporarySpaceBounds.width > maxX)   //The addition of the new word goes beyond the maximum space
            {
                nextY += highestY;  //Go to new line
                highestY = 0;   //Reset the highest
                nextX = startX; //Go back to the left
            }

            disp.x = nextX; //Positions display
            disp.y = nextY;

            this.addChild(disp);    //Adds it in

            nextX += dispBounds.width + temporarySpaceBounds.width; //Increments
            if (highestY < dispBounds.height)
            {
                highestY = dispBounds.height;
            }
        }
    }

    /**
     * Creates a PIXI text for text (and emoji)
     * @param str 
     */
    private renderText(str:string):DisplayObject
    {
        var txt:PIXI.Text = new PIXI.Text(str, this.textStyle);
        return txt;
    }

    /**
     * Creates a PIXI Sprite for the display that needs to be a sprite
     * First it tries to find the sprite, and if it fails then it'll render a text with the failed text inside
     * @param str 
     */
    private renderImage(str:string):DisplayObject
    {
        var texture:PIXI.Texture = PIXI.loader.resources["assets/round_nodetailsOutline.json"].textures[str+".png"];
        if (texture == null)
        {
            return this.renderText(str);
        }
        else 
        {
            var spr:PIXI.Sprite = new PIXI.Sprite(texture);
            var currentTextSize:number = this.textStyle.fontSize as number;
            var scale:number = (1 - 0.2) * (currentTextSize - 18) / (58 - 18) + 0.2;    //Scales the size of the sprite according to the font size from 0.2 to 1
            spr.scale.x = spr.scale.y = scale;
            return spr;
        }
    }
}