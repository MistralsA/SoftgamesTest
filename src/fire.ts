import * as particles from 'pixi-particles';

export class Fire extends PIXI.Container
{
    private emitterData:any;
    private flameParticleEmitter:particles.Emitter;
    private app:PIXI.Application;
    private torchHandle:PIXI.Sprite;

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
        this.flameParticleEmitter = new particles.Emitter(this, [flameTexture, flameTexture2], this.emitterData);
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

    public updatePosition():void
    {
        var torchPosition:PIXI.Point = new PIXI.Point(this.app.screen.width*0.4, this.app.screen.height*0.8);
        this.flameParticleEmitter.updateOwnerPos(torchPosition.x, torchPosition.y);
        this.torchHandle.x = torchPosition.x- 25;
        this.torchHandle.y = torchPosition.y- 200;
    }

    private emitterUpdate = (delta:number):void => {
        this.flameParticleEmitter.update(delta);
    }
}