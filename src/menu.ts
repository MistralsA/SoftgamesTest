import { DisplayObject } from "pixi.js";

export class Menu extends PIXI.Container
{
    private displayBar:PIXI.Graphics;
    private displayText:PIXI.Text;
    private dropDownOptions:PIXI.Graphics[];
    private currentDropDownOption:number = 0;
    private dropDownOpened:Boolean = false;
    public whenMenuChanged:Function;


    constructor() {
        super();
        this.displayBar = new PIXI.Graphics();
        this.dropDownOptions = [];

        this.initMenu();
    }

    private initMenu():void
    {
        this.drawDisplay();
        this.assembleDropDown();
        this.turnOnListener();
        this.setOption(0);
    }

    private drawDisplay():void
    {
        var txt:string[] = ["Cards", "Mixed Text", "Fire"];


        var displayStyle:PIXI.TextStyleOptions = 
        {
            align: "left",
            fill: 0xFFFFFF,
            fontSize: 18,
        }
        var color_blue:number = 0x3e44d2;
        var longestWidth:number = 0;
        var tallestHeight:number = 0;
        var optionTexts:PIXI.Text[] = [];
        for (var i = 0; i < txt.length; i++)
        {
            var optionText:PIXI.Text = new PIXI.Text(txt[i], displayStyle);
            if (longestWidth < optionText.width)
            {
                longestWidth = optionText.width;
            }
            if (tallestHeight < optionText.height)
            {
                tallestHeight = optionText.height;
            }
            optionTexts.push(optionText);
        }

        var nextY:number = tallestHeight;
        var downArrowFiller:number = 15;
        var xPadding:number = 5;
        for (i = 0; i < optionTexts.length; i++)
        {
            var option:PIXI.Graphics = new PIXI.Graphics();
            option.beginFill(color_blue);
            option.lineStyle(2, 0x343661);
            option.drawRect(0, 0, longestWidth + (xPadding*2) + downArrowFiller, tallestHeight);
            option.endFill();
            optionTexts[i].x = xPadding;
            option.addChild(optionTexts[i]);
            option.interactive = true;
            option.cursor = "pointer";
            
            option.x = 0;
            option.y = nextY;
            
            nextY += tallestHeight;
            this.dropDownOptions.push(option);
        }

        this.displayText = new PIXI.Text("", displayStyle);
        this.displayText.x = xPadding;
        this.displayBar.beginFill(color_blue);
        this.displayBar.lineStyle(2, 0x343661);
        this.displayBar.drawRect(0, 0, longestWidth + (xPadding*2) + downArrowFiller, tallestHeight);
        this.displayBar.endFill();
        this.displayBar.addChild(this.displayText);
        this.displayBar.interactive = true;
        this.displayBar.cursor = "pointer";
        
        this.displayBar.x = this.displayBar.y = 0;
    }

    private assembleDropDown():void
    {
        this.currentDropDownOption = 0;

        this.addChild(this.displayBar);

        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            var option:PIXI.Graphics = this.dropDownOptions[i];
            this.addChild(option);
        }
    }

    private removeDropDown():void
    {
        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            this.removeChild(this.dropDownOptions[i]);
        }
    }

    private turnOnListener():void
    {
        this.displayBar.addListener("pointerdown", this.onDisplayBarClick);
        
        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            this.dropDownOptions[i].addListener("pointerdown", this.onPreDropDownClick);
        }
    }

    private onDisplayBarClick = ():void => 
    {
        if (this.dropDownOpened)
        {
            this.removeDropDown();
            this.dropDownOpened = false;
        }
        else 
        {
            this.assembleDropDown();
            this.dropDownOpened = true;
        }
    }
    
    private onPreDropDownClick = (e:PIXI.interaction.InteractionEvent):void => 
    {
        var targetOption:PIXI.Graphics = this.findOption(e.target);
        if (targetOption == null) { return; }

        this.onDropDownClick(targetOption);
    }

    private onDropDownClick(targetOption:PIXI.Graphics):void
    {
        this.removeDropDown();

        var index:number = this.dropDownOptions.indexOf(targetOption);
        this.currentDropDownOption = index;

        var displayText:string = (targetOption.getChildAt(0) as PIXI.Text).text;
        this.dropDownOpened = false;
        this.setDisplayText(displayText);

        if (this.whenMenuChanged != null)
        {
            this.whenMenuChanged(this.currentDropDownOption);
        }
    }

    private setDisplayText(str:string):void
    {
        this.displayText.text = str + "▼";
    }

    private setOption(index:number):void
    {
        if (index > this.dropDownOptions.length || index < 0) { return; }
        this.onDropDownClick(this.dropDownOptions[index]);
    }

    private findOption(e:DisplayObject):PIXI.Graphics
    {
        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            if (e == this.dropDownOptions[i])
            {
                return this.dropDownOptions[i];
            }
        }
        return null;
    }
}