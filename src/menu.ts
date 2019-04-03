import { DisplayObject } from "pixi.js";

/**
 * Programming demo test for Softgames
 * Created by Sandra Koo
 * Started: April 2, 2019, 10:40AM EST
 * Due: April 4, 2019, 9AM EST/17:00 CET
 */
export class Menu extends PIXI.Container
{
    private displayBar:PIXI.Graphics;   //The dropdown's top most bar
    private displayText:PIXI.Text;      //The dropdown's top most text
    private dropDownOptions:PIXI.Graphics[];    //The dropdowns
    private currentDropDownOption:number = 0;   //Current option
    private dropDownOpened:Boolean = false;     //Toggle for when the drop down opens or closes
    public whenMenuChanged:Function;    //The callback function that main.ts will call
    private calculatedHeight:number;    //The calculated height of the menu bar

    constructor() 
    {
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
        var txt:string[] = ["Cards", "Mixed Text", "Fire"]; //The options in text

        var displayStyle:PIXI.TextStyleOptions =    //Text style
        {
            align: "left",
            fill: 0xFFFFFF,
            fontSize: 18,
        }
        var color_blue:number = 0x3e44d2;
        var color_darkGrey:number = 0x343661;
        var longestWidth:number = 0;
        var tallestHeight:number = 0;
        var optionTexts:PIXI.Text[] = [];
        /**
         * Create the text first and figure out the boundings
         */
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

        /**
         * Creating the options and stacking them on top of each other
         */
        var nextY:number = tallestHeight;
        var downArrowFiller:number = 15;
        var xPadding:number = 5;
        for (i = 0; i < optionTexts.length; i++)
        {
            var option:PIXI.Graphics = new PIXI.Graphics();
            option.beginFill(color_blue);
            option.lineStyle(2, color_darkGrey);
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

        /**
         * The top most selection is created
         */
        this.displayText = new PIXI.Text("", displayStyle);
        this.displayText.x = xPadding;
        this.displayBar.beginFill(color_blue);
        this.displayBar.lineStyle(2, color_darkGrey);
        this.displayBar.drawRect(0, 0, longestWidth + (xPadding*2) + downArrowFiller, tallestHeight);
        this.displayBar.endFill();
        this.displayBar.addChild(this.displayText);
        this.displayBar.interactive = true;
        this.displayBar.cursor = "pointer";
        
        this.displayBar.x = this.displayBar.y = 0;
        this.calculatedHeight = nextY;
    }

    /**
     * Adds the options onto the container
     */
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

    /**
     * Removes the options from the container but not the top most one
     */
    private removeDropDown():void
    {
        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            this.removeChild(this.dropDownOptions[i]);
        }
    }

    /**
     * Event listeners for clicking is set up here
     */
    private turnOnListener():void
    {
        this.displayBar.addListener("pointerdown", this.onDisplayBarClick);
        
        for (var i = 0; i < this.dropDownOptions.length; i++)
        {
            this.dropDownOptions[i].addListener("pointerdown", this.onDropDownClick);
        }
    }

    /**
     * The function that is called when the top most bar is clicked
     */
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
    
    /**
     * The function when the options are clicked
     */
    private onDropDownClick = (e:PIXI.interaction.InteractionEvent):void => 
    {
        var targetOption:PIXI.Graphics = this.findOption(e.target); //Determines if the event is valid
        if (targetOption == null) { return; }

        this.setOptionAsCurrent(targetOption);
    }

    /**
     * Sets the option as current based on which one came in
     * @param targetOption 
     */
    private setOptionAsCurrent(targetOption:PIXI.Graphics):void
    {
        this.removeDropDown();

        var index:number = this.dropDownOptions.indexOf(targetOption);
        this.currentDropDownOption = index; //Current selection is the index of the option

        var displayText:string = (targetOption.getChildAt(0) as PIXI.Text).text; //Get the text
        this.setDisplayText(displayText);   //Put it in the top bar
        this.dropDownOpened = false;

        //The callback function is called from here
        if (this.whenMenuChanged != null)
        {
            this.whenMenuChanged(this.currentDropDownOption);
        }
    }

    /**
     * The top most bar's text is changed to the option with a down arrow
     * @param str 
     */
    private setDisplayText(str:string):void
    {
        this.displayText.text = str + "▼";
    }

    /**
     * Set the current option by number
     * @param index 
     */
    private setOption(index:number):void
    {
        if (index > this.dropDownOptions.length || index < 0) { return; }
        this.setOptionAsCurrent(this.dropDownOptions[index]);
    }

    /**
     * Determines if the DisplayObject is a part of the options
     * @param e 
     */
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

    /**
     * Returns the height of the menu
     */
    public getHeight():number
    {
        return this.calculatedHeight
    }
}