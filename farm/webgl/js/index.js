
var main = {
    elf:[],
    init: function(){
        this.renderer = new THREE.WebGLRenderer({
            canvas:document.getElementById("renderCanvas"),
            antialias: true,
            alpha: true
        });
        //创建渲染器
        this.renderer.setClearColor(0x333333);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //添加canvas
        // this.canvas = this.renderer.domElement;
        // document.body.appendChild(this.canvas);
        //创建场景        
        this.scene  = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        // 二维坐标用来转化鼠标参数
        this.mouse = new THREE.Vector2();

        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();
        //事件监听
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        window.addEventListener('resize', this.onWindowResize, false);
        this.buildLightSystem();//添加光源线
        this.buildAuxSystem();//添加坐标系统
        this.animation();
        
    },
    initModel:function(){
        var urls = [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ];
        var JPGCubeMap = new THREE.CubeTextureLoader().setPath( 'https://www.thingjs.com/static/skyboxes/BlueSky/' ).load( urls );
        this.scene.background = JPGCubeMap;
        // this.scene.background = new THREE.Color( 0xcce0ff );
        // this.scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
        this.initLargeGroud();
        this.addDaeMod();
    },
    loadControls:function(){
        //创建场景Controls
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        controls.screenSpacePanning = true;
        controls.enableDamping = true
        controls.dampingFactor = 0.25
        controls.rotateSpeed = 0.35
    },
    buildLightSystem:function(){
        /*
        AmbientLight: 环境光，基础光源，它的颜色会被加载到整个场景和所有对象的当前颜色上。
        PointLight：点光源，朝着所有方向都发射光线
        SpotLight ：聚光灯光源：类型台灯，天花板上的吊灯，手电筒等
        DirectionalLight：方向光，又称无限光，从这个发出的光源可以看做是平行光.
        */
        // 初始化相机配置
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(600,200, -200);//缩放、上下、左右
        this.camera.lookAt(this.scene.position);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
        directionalLight.position.set(300, 1000, 500);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;

        var d = 300;
        directionalLight.shadow.camera = new THREE.OrthographicCamera(-d, d, d, -d, 500, 1600);
        directionalLight.shadow.bias = 0.0001;
        directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight)

        var light = new THREE.AmbientLight(0xffffff, 0.6);
       // this.LightHelper = new THREE.DirectionalLightHelper(directionalLight);
        this.scene.add(this.LightHelper);
        this.scene.add(light)
        this.loadControls();
      
    },
    animation:function(){
        //this.LightHelper.update(); 
        requestAnimationFrame(this.animation.bind(this));
        var delta = this.clock.getDelta();
        if ( this.elf.length>0) {
            for(j = 0,len=this.elf.length; j < len; j++) {
                var obj=this.elf[j];
                var speed= obj.speed;
                obj.rotation.x += delta *speed;
            }
        }
        this.renderer.render(this.scene, this.camera);
    },
    render:function(){
        // 鼠标位置向摄像机位置发射一条射线
        main.raycaster.setFromCamera(main.mouse,main.camera);
        // 设置射线影响的范围
        var intersects = main.raycaster.intersectObjects(main.mall.children);
        if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);
        }
        } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
        }
        main.renderer.render(main.scene, main.camera);
    },
    onDocumentMouseMove:function(){
        event.preventDefault();
        main.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        main.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    onWindowResize: function(){
        main.camera.aspect = window.innerWidth / window.innerHeight;
        main.camera.updateProjectionMatrix();
        main.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    initLargeGroud:function(){
        var groundTexture = new THREE.TextureLoader().load( 'css/grasslight-big.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;
        var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );
        groundMaterial.side = THREE.DoubleSide;  
        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add( mesh );
    },
    //辅助系统: 网格和坐标
    buildAuxSystem:function(){
        var axisHelper = new THREE.AxesHelper(2000);
        this.scene.add(axisHelper);
        var width=600;
        var split=8;
        var gridHelperx = new THREE.GridHelper(width,split)//长宽600等分60格1格等于10
        var gridHelpery = new THREE.GridHelper(width,split)
        var gridHelperz = new THREE.GridHelper(width,split)
        gridHelperx.rotateX(-Math.PI / 2);
        gridHelperz.rotateZ(Math.PI / 2);
        this.scene.add(gridHelperx);
        this.scene.add(gridHelpery);
        this.scene.add(gridHelperz);
    },
    createFS:function(loader,pos){
        loader.load("model/fshang.dae", function (object) {
            object.scene.castShadow = true;
            object.scene.receiveShadow = true;
            object.scene.scale.set(1,1,1);
            object.scene.position.set(pos[0],pos[1],pos[2]);
            object.scene.speed=0;
            main.elf.push(object.scene);
            main.scene.add(object.scene);
        });
    },
    createCai:function(pos){
        var map = new THREE.TextureLoader().load( 'css/timg.jpg' );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(50, 5);
        var shape = new THREE.CubeGeometry(720,0, 70);
        var material = new THREE.MeshLambertMaterial({
            map:map,
            emissive: 0x333333,
        });
        var cai = new THREE.Mesh(shape, material);
        cai.position.set(pos[0],pos[1],pos[2]);
        cai.receiveShadow = true;
        cai.castShadow = true;
        this.scene.add(cai);
    },
    addDaeMod:function(){
        var loader = new THREE.ColladaLoader();
        var daeurl="model/house.dae";
        loader.load(daeurl, function (object) {
            object.scene.castShadow = true;
            object.scene.receiveShadow = true;
            object.scene.scale.set(1,1,1);
            object.scene.position.set(0,0,0);
            main.scene.add(object.scene);
        });
        loader.load("model/top.dae", function (object) {
            object.scene.castShadow = true;
            object.scene.receiveShadow = true;
            object.scene.scale.set(1,1,1);
            object.scene.position.set(0,0,0);
            object.scene.name="top";
            main.scene.add(object.scene);
        });

        loader.load("model/camera.dae", function (object) {
            object.scene.castShadow = true;
            object.scene.receiveShadow = true;
            object.scene.scale.set(1,1,1);
            object.scene.position.set(399,100,30);
            main.scene.add(object.scene);
        });

        this.createFS(loader,[380,63,72]);
        this.createFS(loader,[380,63,-68]);
        this.createFS(loader,[-410,63,72]);
        this.createFS(loader,[-410,63,-68]);
        this.createCai([-12,10,0]);
        this.createCai([-12,10,-110]);
        this.createCai([-12,10,110]);
    }
};

