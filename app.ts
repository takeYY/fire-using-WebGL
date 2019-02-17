///<reference path="./node_modules/@types/three/index.d.ts"/>
///<reference path="./node_modules/@types/dat-gui/index.d.ts"/>

class ThreeJSTest {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private geometry: THREE.Geometry;
    private material: THREE.PointsMaterial;
    private cube: THREE.Mesh;
    private light: THREE.Light;
    private screenWidth: number = 640;
    private screenHeight: number = 480;
    private controls: GuiControl;
    private orbitControl: THREE.OrbitControls;
    private cloud :THREE.Points;
    private pvelocity:THREE.Vector3[];
    private num:number = 10000;
    private theta:number[] = new Array(this.num);
    private rand:number[] = new Array(this.num);

    constructor() {
        this.createRenderer();
        this.createScene();
    } 

    private createRenderer() {
        // dat.GUI
        var gui = new dat.GUI({ autoPlace: false, width: 256 });
        var guielement = document.createElement("div");
        guielement.id = "dat-gui";
        guielement.appendChild(gui.domElement);
        document.getElementById("viewport").appendChild(guielement);


        this.controls = new GuiControl();
//        var gui = new dat.GUI();
        gui.add(this.controls,'transparent').onChange((e:boolean)=>{
            this.material.transparent = e;
        });
        gui.add(this.controls,'opacity',0,1).onChange((e:number)=>{
            this.material.opacity = e;
        });
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        this.renderer.setClearColor(new THREE.Color(0x000000));
        document.getElementById("viewport").appendChild(this.renderer.domElement);
    }  

    private createScene() {
        this.scene = new THREE.Scene();
        for(var i = 0; i< this.theta.length; i++){
            this.theta[i] = this.random(0.1,0.5);
            this.rand[i] = this.random(0.01,0.05);
        }
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.cube = new THREE.Mesh(this.geometry, this.material);
        //this.scene.add(this.cube);
        this.camera = new THREE.PerspectiveCamera(75, this.screenWidth /   
 this.screenHeight, 0.1, 1000);
        this.camera.position.x = 30;
        this.camera.position.y = 30;
        this.camera.position.z = 30;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.orbitControl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.light = new THREE.DirectionalLight(0xffffff);
        var lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
        this.createParticle();
    }
    
    public random(min:number,max:number){
        return Math.random()*(max+1-min)+min;
    }

    public createParticle(){
        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load('particles.png');
        //Geometry
        var geo = new THREE.Geometry();
        //Material
        this.material = new THREE.PointsMaterial({size:10,map:texture,blending:THREE.AdditiveBlending,color:0xffffff,
        depthWrite:false,transparent:true});
        //particle
        var max = 200;
        var min = -200;
        this.pvelocity = [];
        for(var x = 0; x<this.num; x++){
            var X = Math.random()*(max+1-min)+min;
            X = Math.random()*(25+1+25)-25;
            var Y = Math.cos(Math.random()*(max+1-min)+min);
            var Z = Math.sin(Math.random()*(max+1-min)+min);
            Z = Math.random()*(25+1+25)-25;
            if(Math.pow(X,2)+Math.pow(Z,2)<25*25){
                this.pvelocity.push(new THREE.Vector3(this.random(0.1,0.3),this.random(0.1,0.3),this.random(0.1,0.3)));
                var particle = new THREE.Vector3(X,Y,Z);
                geo.vertices.push(particle);
                geo.colors.push(new THREE.Color(Math.random() * 0x00ffff));
            }
            /*
            this.pvelocity.push(new THREE.Vector3(this.random(0.1,0.3),this.random(0.1,0.3),this.random(0.1,0.3)));
            var particle = new THREE.Vector3(X,Y,Z);
            geo.vertices.push(particle);
            geo.colors.push(new THREE.Color(Math.random() * 0x00ffff));
            */
        }
        //THREE.points
        this.cloud = new THREE.Points(geo,this.material);
        //Scene
        this.scene.add(this.cloud);
    }

    public reCreateParticle(){
        var geo = new THREE.Geometry();
        var particleNum = this.controls.particleNum,
            transparent = this.controls.transparent,
            opacity = this.controls.opacity;
        this.material = new THREE.PointsMaterial({size:4,vertexColors:THREE.VertexColors,opacity:opacity,transparent:transparent});
        var n = Math.sqrt(particleNum);
        var max = 100;
        var min = -100;
        for(var x = 0; x<n;x++){
            for(var y = 0; y<n;y++){
                var X = Math.random()*(max+1-min)+min;
                var Y = Math.random()*(max+1-min)+min;
                var Z = Math.random()*(max+1-min)+min;
                var particle = new THREE.Vector3(X,Y,Z);
                geo.vertices.push(particle);
                geo.colors.push(new THREE.Color(Math.random() * 0x00ffff));
            }
        }
        this.cloud = new THREE.Points(geo,this.material);
        this.scene.add(this.cloud);
    }

    public render() {
        var geo = <THREE.Geometry>this.cloud.geometry;
        var vertices = geo.vertices;
        for(var i=0;i<vertices.length;i++){
            if(200<vertices[i].y){
                vertices[i].y = 0;
            }
            else{
                vertices[i].y = vertices[i].y+this.pvelocity[i].y;
                vertices[i].x += 2*Math.cos(this.theta[i]);
                vertices[i].z += -2*Math.sin(this.theta[i]);
                this.theta[i] += this.rand[i];
            }
        }
        geo.verticesNeedUpdate = true;
        this.orbitControl.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

}

class GuiControl {
    public transparent: boolean;
    public opacity: number;
    public particleNum:number;
    constructor() {
       this.transparent = false;
       this.opacity = 1;
       this.particleNum = 100;
    }
}



window.onload = () => {
    var threeJSTest = new ThreeJSTest();
    threeJSTest.render(); 
};