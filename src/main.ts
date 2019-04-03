import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import {Menu} from "./menu";
import {Cards} from "./cards";
import { MixedText } from "./mixText";
import { Fire } from "./fire";


/**
 * Todo:
 * Fancy tween for cards
 */
export class Main 
{
    private game:PIXI.Application;

    private menu:Menu;
    private cards:Cards;
    private mixText:MixedText;
    private fire:Fire;
    private currentMenuSelection:number;

    private headerContainer:HTMLElement;

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
        loader.add("assets/flame.png");
        loader.add("assets/flame2.png");
        loader.add("assets/TorchHandle.png");
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
        this.menu.whenMenuChanged = this.whenMenuChanged;

        this.cards = new Cards(this.game);

        this.mixText = new MixedText(this.game);
        this.mixText.safeHeight = this.menu.getHeight();

        this.fire = new Fire(this.game);
        
        window.onresize = this.onResize;
        
        this.game.stage.addChild(this.menu);
        div.appendChild(this.game.view);
        this.whenMenuChanged(0);

        this.animate(0);
    }

    private animate(delta:number): void 
    {
        requestAnimationFrame((del:number) => 
        {
            this.animate(del);
        });

        this.updateFPS();

        TWEEN.update();
        this.game.renderer.render(this.game.stage);
    }

    private removeAll()
    {
        this.game.stage.removeChild(this.cards);
        this.game.stage.removeChild(this.mixText);
        this.game.stage.removeChild(this.fire);
        
        this.cards.stopAnimation();
        this.mixText.stopAndClearAutoAppend();
        this.fire.stopFire();
    }

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
        if (this.currentMenuSelection == 1) //mixed Text
        {
            this.mixText.render();
        }
    }
}

(function() {
    const game: Main = new Main();
})();
