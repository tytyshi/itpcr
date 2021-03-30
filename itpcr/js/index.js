let glScene

window.onload = async () => {
    console.log("Window loaded.");
    console.log("Creating three.js scene...");
    glScene = new Scene();
};


class Scene {
    constructor() {
        this.scene = new THREE.Scene();


        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = window.devicePixelRatio;

        this.camera = new THREE.PerspectiveCamera(
            50,
            this.width / this.height,
            0.5,
            5000
        );
        this.camera.position.set(0, 0, 3);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer(
            { antialiasing: true, }
        );
        // this.renderer.setClearColor(new THREE.Color("black"));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);

        //Push the canvas to the DOM
        let domElement = document.getElementById("canvas-container");
        domElement.append(this.renderer.domElement);

        window.addEventListener("resize", (e) => this.onWindowResize(e), false);


        // Helpers
        this.scene.add(new THREE.GridHelper(500, 500));
        this.scene.add(new THREE.AxesHelper(10));
        this.addLights();
        this.addLightsRep();

        createEnvironment(this.scene);
        
        

        //enviornment mapping and texture
        this.r = new THREE.CubeTextureLoader().setPath('../assets/cubemap/');

        this.textureCube = this.r.load([
           'px.png','nx.png',
            'py.png','ny.png',
            'pz.png','nz.png',
        ]);
        this.textureCube.mapping = THREE.CubeRefractionMapping;
    
        //add material texture to 3d geometry


        //adding enviornment to background
        this.scene.background = this.textureCube; 

        //add mouse interation
        document.addEventListener("mousemove", (e) => this.onDocumentMouseMove(e), false);

        // Start the loop
        this.frameCount = 0;
        this.update();

    }


    addLights() {
        console.log("addlights");
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        this.pointLight = new THREE.PointLight(0xffffff, 2);
        this.scene.add(this.pointLight);
    }

    addLightsRep(){
        this.sphere = new THREE.SphereGeometry (100,16,8);
        
        this.mesh = new THREE.Mesh (this.sphere, new THREE.MeshBasicMaterial({color:0xffffff}));
        this.mesh.scale.set(0.05,0.05,0.05);
        this.pointLight.add(this.mesh);
    }
    update() {
        // console.log("update environments");
        requestAnimationFrame(() => this.update());
        this.frameCount++;

        updateEnvironment();
        this.render();
    }

    render() {
        this.timer = 0.0001 * Date.now();

        this.camera.position.x += (this.mouseX - this.camera.position.x)*0.05;
        this.camera.position.y += (this.mouseY - this.camera.position.y)*0.05;
        this.camera.lookAt (this.scene.position);

        this.pointLight.position.x = 1500 * Math.cos( this.timer );
		this.pointLight.position.z = 1500 * Math.sin( this.timer );
    
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize(e) {
        this.windowHalfX = window.innerWidth/ 2;
        this.windowHalfY = window.innerHeight/ 2;

        this.width = window.innerWidth;
        this.height = Math.floor(window.innerHeight - window.innerHeight * 0.3);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }

    onDocumentMouseMove(e){
   
        this.mouseX = ( this.clientX - this.windowHalfX ) * 4;
		this.mouseY = ( this.clientY - this.windowHalfY ) * 4;
    }
    
}

let myModel;

// function onDocumentMouseMove(event){
//     this.mouseX = (event.clientX - this.windowHalfX) / 100;
//     this.mouseY = (event.clientY - this.windowHalfY) / 100;

// }

function createEnvironment(scene) {
    console.log("Adding environment");
    loadModel(scene);
}

function updateEnvironment() {


}

function loadModel(scene) {
    // model
    const onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
    };

    const onError = function () {
        console.log("got errors");
    };

    const manager = new THREE.LoadingManager();

    // new THREE.PLYLoader(manager)
    //     .load('../assets/ITPCR/itpcr.ply', function(geometry)){
    //         geometry.preload();
    //         geometry.computeVertexNormals();

    //         myModel = geometry;

    //         material = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: this.textureCube, refractionRatio: 0.95, reflectivity:0.9 } );
    //         mesh = new THREE.Mesh(geometry, material);

    //         mesh.position.y = - 0.2;
    //         mesh.position.z = 0.3;
    //         mesh.rotation.x = - Math.PI / 2;
    //         mesh.scale.multiplyScalar( 0.001 );

    //         mesh.castShadow = true;
    //         mesh.receiveShadow = true;

    //         scene.add(mesh); 
        // }
    new THREE.MTLLoader(manager)
        .setPath("../assets/ITPCR/")
        .load("itpcr.mtl", function (materials) {
            materials.preload();
            material = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: this.textureCube, refractionRatio: 0.95, reflectivity:0.9 } );
            mesh = new THREE.Mesh();

            scene.add(material);

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath("../assets/ITPCR/")
                .load(
                    "itpcr.obj",
                    function (object) {
                        console.log("load model");
                        myModel = object;
                        object.position.set(-6, -3, -10);
                        // object.rotation.y = Math.PI / 3;
                        // object.rotation.x = Math.PI / 12;
                        scene.add(object);
                    },
                    onProgress,
                    onError
                );
        });

    }
