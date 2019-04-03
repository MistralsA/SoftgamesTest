import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import {Menu} from "./menu";
import {Cards} from "./cards";
import { MixedText } from "./mixText";
import { Fire } from "./fire";

/**
 * Programming demo test for Softgames
 * Created by Sandra Koo
 * Started: April 2, 2019, 10:40AM EST
 * Due: April 4, 2019, 9AM EST/17:00 CET
 */
export class Main 
{
    private game:PIXI.Application;

    private menu:Menu;  //The drop down menu
    private currentMenuSelection:number;    //Current menu selection
    private cards:Cards;    //The cards scene
    private mixText:MixedText;  //The mixed text scene
    private fire:Fire;      //The fire scene

    private headerContainer:HTMLElement; //The html component for the fps and credits

    constructor() 
    {
        window.onload = () => 
        {
            this.startLoadingAssets();
        };
    }

    private startLoadingAssets(): void 
    {
        const loader = PIXI.loader;
        loader.add("assets/round_nodetailsOutline.json");
        loader.add("assets/Flame.png");
        loader.add("assets/Flame2.png");
        loader.add("assets/TorchHandle.png");
        loader.add("assets/GlitterCross.png");
        loader.on("complete", () => 
        {
            this.onAssetsLoaded();
        });
        loader.load();
    }

    private onAssetsLoaded(): void 
    {
        this.createrenderer();
    }

    private createrenderer(): void 
    {
        var div:HTMLElement = document.getElementById("container");
        this.headerContainer = document.getElementById("header");
        this.game = new PIXI.Application(
        {
            backgroundColor: 0x222222,
            height: window.innerHeight,
            width: window.innerWidth
        });
        this.game.stage = new PIXI.display.Stage();

        this.menu = new Menu();
        this.menu.whenMenuChanged = this.whenMenuChanged;   //A callback function for the menu for when the menu is changed

        this.cards = new Cards(this.game);

        this.mixText = new MixedText(this.game);
        this.mixText.safeHeight = this.menu.getHeight();    //Giving a safe distance in the Y axis to prevent colliding with the menu

        this.fire = new Fire(this.game);
        
        window.onresize = this.onResize;
        
        this.game.stage.addChild(this.menu);
        div.appendChild(this.game.view);
        this.whenMenuChanged(0);    //Sets it to cards scene

        this.animate(0);
    }

    private animate(delta:number): void 
    {
        requestAnimationFrame((del:number) => 
        {
            this.animate(del);
        });

        this.updateFPS();   //Updates the FPS

        TWEEN.update(); //Updates tweens
        this.game.renderer.render(this.game.stage);
    }

    /**
     * Clears the stage and stops the scenes
     */
    private removeAll()
    {
        this.game.stage.removeChild(this.cards);
        this.game.stage.removeChild(this.mixText);
        this.game.stage.removeChild(this.fire);
        
        this.cards.stopAnimation();
        this.mixText.stopAndClearAutoAppend();
        this.fire.stopFire();
    }

    /**
     * Adds the scene into the stage and starts its animation
     */
    private whenMenuChanged = (index:number):void =>
    {
        this.removeAll();
        this.currentMenuSelection = index;
        switch(index)
        {
            case 0: 
                //cards
                this.game.stage.addChild(this.cards);
                this.cards.startAnimation();
                break;
            case 1:
                //Mixed Text
                this.game.stage.addChild(this.mixText);
                this.mixText.autoAppend();
                break;
            case 2: 
                //Fire
                this.game.stage.addChild(this.fire);
                this.fire.startFire();
                break;
        }
    }

    private updateFPS():void
    {
        var fps:string = this.game.ticker.FPS.toFixed(2);

        this.headerContainer.innerHTML = "<p>FPS: " + fps + "<br/>Softgames Demo by: Sandra Koo</p>";
    }

    private onResize = () => 
    {
        this.game.renderer.resize(window.innerWidth, window.innerHeight);
        switch (this.currentMenuSelection)
        {
            case 1: this.mixText.render();
            case 2: this.fire.updatePosition();
        }
    }
}

(function() {
    const game: Main = new Main();
})();
