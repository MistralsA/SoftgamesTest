import * as Particles from 'pixi-particles';

/**
 * Programming demo test for Softgames
 * Created by Sandra Koo
 * Started: April 2, 2019, 10:40AM EST
 * Due: April 4, 2019, 9AM EST/17:00 CET
 */
export class Fire extends PIXI.Container
{
    private app:PIXI.Application;   //The pixi application
    private emitterData:any;    //The configuration for the particle emitter
    private flameParticleEmitter:Particles.Emitter; //The emitter
    private torchHandle:PIXI.Sprite;    //A sprite to give meaning to the fire

    constructor(currentApp:PIXI.Application)
    {
        super();
        this.app = currentApp;

        this.makeAssets();
        this.updatePosition();
    }

    private makeAssets():void
    {
        this.torchHandle = new PIXI.Sprite(PIXI.loader.resources["assets/TorchHandle.png"].texture);
        this.addChild(this.torchHandle);

        this.emitterData = {"alpha":{"list":[{"value":1,"time":0},{"value":0,"time":1}],"isStepped":false},
                        "scale":{"list":[{"value":0.1,"time":0},{"value":0.25,"time":0.5},{"value":0.01,"time":1}],"isStepped":false},
                        "color":{"list":[{"value":"FF2200","time":0},{"value":"FF2200","time":0.35},{"value":"FFFF00","time":1}],"isStepped":false},
                        "speed":{"start":1,"end":500},"startRotation":{"min":268,"max":271},"noRotation":true,"rotationSpeed":{"min":-10,"max":10},
                        "lifetime":{"min":0,"max":2},"blendMode":"normal","frequency":0.001,"emitterLifetime":-1,"maxParticles":10,"pos":{"x":0,"y":0},
                        "addAtBack":false,"spawnType":"circle","spawnCircle":{"x":0,"y":0,"r":5}};
        var flameTexture:PIXI.Texture = PIXI.loader.resources["assets/flame.png"].texture;
        var flameTexture2:PIXI.Texture = PIXI.loader.resources["assets/flame2.png"].texture;
        this.flameParticleEmitter = new Particles.Emitter(this, [flameTexture, flameTexture2], this.emitterData);
    }

    public startFire():void
    {
        this.app.ticker.add(this.emitterUpdate);
        this.flameParticleEmitter.emit = true;
    }

    public stopFire():void
    {
        this.app.ticker.remove(this.emitterUpdate);
        this.flameParticleEmitter.emit = false;
    }

    /**
     * Positions it so the emitter and the torch handle is at the center
     */
    public updatePosition():void
    {
        var torchPosition:PIXI.Point = new PIXI.Point(this.app.screen.width*0.5, this.app.screen.height*0.6);
        this.flameParticleEmitter.updateOwnerPos(torchPosition.x, torchPosition.y + 200);
        this.torchHandle.x = torchPosition.x- 25;
        this.torchHandle.y = torchPosition.y;
    }

    /**
     * Emitter's ticker update
     */
    private emitterUpdate = (delta:number):void => 
    {
        this.flameParticleEmitter.update(delta);
    }
}