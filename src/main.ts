import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import {Menu} from "./menu";
import {Cards} from "./cards";
import { MixedText } from "./mixText";


/**
 * Todo:
 * Fire
 * FPS
 * Fancy tween for cards
 */
export class Main {
    private sq:PIXI.Graphics;
    private game:PIXI.Application;

    private menu:Menu;
    private cards:Cards;
    private mixText:MixedText;

    constructor() {
        window.onload = () => {
            this.startLoadingAssets();
        };
    }

    private startLoadingAssets(): void {
        const loader = PIXI.loader;
        loader.add("assets/round_nodetailsOutline.json");
        loader.on("complete", () => {
            this.onAssetsLoaded();
        });
        loader.load();
    }

    private onAssetsLoaded(): void {
        this.createrenderer();
    }

    private createrenderer(): void {
        var div:HTMLElement = document.getElementById("container");
        this.game = new PIXI.Application({
            backgroundColor: 0x222222,
            // backgroundColor: 0xffff00,
            height: 800,
            width: 600
        });
        this.game.stage = new PIXI.display.Stage();

        this.sq = new PIXI.Graphics();
        this.sq.beginFill(0x0000FF);
        this.sq.drawRect(-25, -25, 50, 50);
        this.sq.endFill();
        this.sq.x = 200;
        this.sq.y = 200;
        this.game.stage.addChild(this.sq);

        this.menu = new Menu();
        this.menu.whenMenuChanged = this.whenMenuChanged;

        this.cards = new Cards(this.game);

        this.mixText = new MixedText(this.game);
        
        this.game.stage.addChild(this.menu);
        div.appendChild(this.game.view);
        this.whenMenuChanged(1);

        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(() => {
            this.animate();
        });

        this.sq.rotation += 0.01;
        TWEEN.update();
        this.game.renderer.render(this.game.stage);
    }

    private removeAll()
    {
        this.game.stage.removeChild(this.cards);
        this.game.stage.removeChild(this.mixText);
        
        this.cards.stopAnimation();
        this.mixText.stopAndClearAutoAppend();
    }

    private whenMenuChanged = (index:number):void =>
    {
        this.removeAll();
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
                break;
        }
    }
}

(function() {
    const game: Main = new Main();
})();
