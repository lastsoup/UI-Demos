//发电厂
var plantArray = [{name:'1000kV火电',img:'/huodianchang/1000.png'},
				 {name:'750kV火电',img:'/huodianchang/750.png'},
				 {name:'500kV火电',img:'/huodianchang/500.png'},
				 {name:'330kV火电',img:'/huodianchang/330.png'},
				 {name:'220kV火电',img:'/huodianchang/220.png'},
				 {name:'110kV火电',img:'/huodianchang/110.png'},
				 {name:'66kV火电',img:'/huodianchang/66.png'},
				 {name:'60kV火电',img:'/huodianchang/66.png'},
				 {name:'35kV火电',img:'/huodianchang/35.png'},
				 {name:'all火电',img:'/huodianchang/1.png'},
				 {name:'other火电',img:'/huodianchang/30.png'},

				 {name:'1000kV水电',img:'/shuidianchang/1000.png'},
				 {name:'750kV水电',img:'/shuidianchang/750.png'},
				 {name:'500kV水电',img:'/shuidianchang/500.png'},
				 {name:'330kV水电',img:'/shuidianchang/330.png'},
				 {name:'220kV水电',img:'/shuidianchang/220.png'},
				 {name:'110kV水电',img:'/shuidianchang/110.png'},
				 {name:'66kV水电',img:'/shuidianchang/66.png'},
				 {name:'60kV水电',img:'/shuidianchang/66.png'},
				 {name:'35kV水电',img:'/shuidianchang/35.png'},
				 {name:'all水电',img:'/shuidianchang/1.png'},
				 {name:'other水电',img:'/shuidianchang/30.png'},

				 {name:'1000kV抽蓄',img:'/chouxu/1000.png'},
				 {name:'750kV抽蓄',img:'/chouxu/750.png'},
				 {name:'500kV抽蓄',img:'/chouxu/500.png'},
				 {name:'330kV抽蓄',img:'/chouxu/330.png'},
				 {name:'220kV抽蓄',img:'/chouxu/220.png'},
				 {name:'110kV抽蓄',img:'/chouxu/110.png'},
				 {name:'66kV抽蓄',img:'/chouxu/66.png'},
				 {name:'60kV抽蓄',img:'/chouxu/66.png'},
				 {name:'35kV抽蓄',img:'/chouxu/35.png'},
				 {name:'all抽蓄',img:'/chouxu/1.png'},
				 {name:'other抽蓄',img:'/chouxu/30.png'},
				 
				 {name:'1000kV风电',img:'/fengdianchang/1000.png'},
				 {name:'750kV风电',img:'/fengdianchang/750.png'},
				 {name:'500kV风电',img:'/fengdianchang/500.png'},
				 {name:'330kV风电',img:'/fengdianchang/330.png'},
				 {name:'220kV风电',img:'/fengdianchang/220.png'},
				 {name:'110kV风电',img:'/fengdianchang/110.png'},
				 {name:'66kV风电',img:'/fengdianchang/66.png'},
				 {name:'60kV风电',img:'/fengdianchang/66.png'},
				 {name:'35kV风电',img:'/fengdianchang/35.png'},
				 {name:'all风电',img:'/fengdianchang/1.png'},
				 {name:'other风电',img:'/fengdianchang/30.png'},
				 
				 {name:'1000kV光伏',img:'/guangfu/1000.png'},
				 {name:'750kV光伏',img:'/guangfu/750.png'},
				 {name:'500kV光伏',img:'/guangfu/500.png'},
				 {name:'330kV光伏',img:'/guangfu/330.png'},
				 {name:'220kV光伏',img:'/guangfu/220.png'},
				 {name:'110kV光伏',img:'/guangfu/110.png'},
				 {name:'66kV光伏',img:'/guangfu/66.png'},
				 {name:'60kV光伏',img:'/guangfu/66.png'},
				 {name:'35kV光伏',img:'/guangfu/35.png'},
				 {name:'all光伏',img:'/guangfu/1.png'},
				 {name:'other光伏',img:'/guangfu/30.png'},
				 //核电
				 {name:'1000kV核电',img:'/hedian/1000.png'},
				 {name:'750kV核电',img:'/hedian/750.png'},
				 {name:'500kV核电',img:'/hedian/500.png'},
				 {name:'330kV核电',img:'/hedian/330.png'},
				 {name:'220kV核电',img:'/hedian/220.png'},
				 {name:'110kV核电',img:'/hedian/110.png'},
				 {name:'66kV核电',img:'/hedian/66.png'},
				 {name:'60kV核电',img:'/hedian/66.png'},
				 {name:'35kV核电',img:'/hedian/35.png'},
				 {name:'all核电',img:'/hedian/1.png'},
				 {name:'other核电',img:'/hedian/30.png'}
				 ];

var plant = {};
for(var i=0;i<plantArray.length;i++){
	plant[plantArray[i].name] = new ol.style.Style({
        image: new ol.style.Icon({
            src: 'css/images/fadiantypes'+plantArray[i].img
        })
	})
}
//变电
var subArray = [
			{name:'1000kV变电站',img:'/biandian/1000.png'},
			{name:'750kV变电站',img:'/biandian/750.png'},
			{name:'500kV变电站',img:'/biandian/500.png'},
			{name:'330kV变电站',img:'/biandian/330.png'},
			{name:'220kV变电站',img:'/biandian/220.png'},
			{name:'110kV变电站',img:'/biandian/110.png'},
			{name:'66kV变电站',img:'/biandian/66.png'},
			{name:'60kV变电站',img:'/biandian/66.png'},
			{name:'35kV变电站',img:'/biandian/35.png'},
			{name:'other变电站',img:'/biandian/30.png'},
			{name:'all变电站',img:'/biandian/1.png'},
			
			{name:'1000kV牵引站',img:'/qianyin/1000.png'},
			{name:'750kV牵引站',img:'/qianyin/750.png'},
			{name:'500kV牵引站',img:'/qianyin/500.png'},
			{name:'330kV牵引站',img:'/qianyin/330.png'},
			{name:'220kV牵引站',img:'/qianyin/220.png'},
			{name:'110kV牵引站',img:'/qianyin/110.png'},
			{name:'66kV牵引站',img:'/qianyin/66.png'},
			{name:'60kV牵引站',img:'/qianyin/66.png'},
			{name:'35kV牵引站',img:'/qianyin/35.png'},
			{name:'other牵引站',img:'/qianyin/30.png'},
			{name:'all牵引站',img:'/qianyin/1.png'},
			
			{name:'1000kV开关站',img:'/kaiguan/1000.png'},
			{name:'750kV开关站',img:'/kaiguan/750.png'},
			{name:'500kV开关站',img:'/kaiguan/500.png'},
			{name:'330kV开关站',img:'/kaiguan/330.png'},
			{name:'220kV开关站',img:'/kaiguan/220.png'},
			{name:'110kV开关站',img:'/kaiguan/110.png'},
			{name:'66kV开关站',img:'/kaiguan/66.png'},
			{name:'60kV开关站',img:'/kaiguan/66.png'},
			{name:'35kV开关站',img:'/kaiguan/35.png'},
			{name:'other开关站',img:'/kaiguan/30.png'},
			{name:'all开关站',img:'/kaiguan/1.png'}
];
var substation = {};
for(var i=0;i<subArray.length;i++){
	substation[subArray[i].name] = new ol.style.Style({
        image: new ol.style.Icon({
            src: '../common/style/images'+subArray[i].img
        })
	})
}
//换流
var conversubArray = [
	{name:'±1100kV换流站',img:'/huanliu/1100.png'},
	{name:'±1000kV换流站',img:'/huanliu/1100.png'},
	{name:'±800kV换流站',img:'/huanliu/1100.png'},
	{name:'±660kV换流站',img:'/huanliu/1000.png'},
	{name:'other换流站',img:'/huanliu/800.png'},
	{name:'all换流站',img:'/huanliu/1.png'}
];
var conversub = {};
for(var i=0;i<conversubArray.length;i++){
	conversub[conversubArray[i].name] = new ol.style.Style({
        image: new ol.style.Icon({
            src: '../common/style/images'+conversubArray[i].img
        })
	})
}

//杆塔
var towersIcon = new ol.style.Style({
    image: new ol.style.Icon({
        src: '../common/style/images/others/ganta.png'
    })
});

//默认点
var defIcon = new ol.style.Style({
    image: new ol.style.Icon({
        src: '../common/style/images/others/deflautgy1.png'
    })
});

//面样式

var PolygonStyle = [
	new ol.style.Style({
    	stroke: new ol.style.Stroke({//要素边界样式
               width: 2,
               color: "blue"
              }),
//      zIndex:0,//CSS中的zIndex，即叠置的层次，为数字类型。
//        fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
//     		color:'orange' 	
//        })
    })
];

//直流线路样式
var DCLineStyle = [
	{name:'±1100kV1001',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±1100kV1002',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±1100kV1003',color:'#0000FF',lineDash:[0]},
	{name:'±1100kV1004',color:'#0000FF',lineDash:[0]},
	
	{name:'±1000kV1001',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±1000kV1002',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±1000kV1003',color:'#0000FF',lineDash:[0]},
	{name:'±1000kV1004',color:'#0000FF',lineDash:[0]},
	
	{name:'±800kV1001',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±800kV1002',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
	{name:'±800kV1003',color:'#0000FF',lineDash:[0]},
	{name:'±800kV1004',color:'#0000FF',lineDash:[0]},
	
	{name:'±660kV1001',color:'#FA7D08',lineDash:[1,2,3,4,5,6]},
	{name:'±660kV1002',color:'#FA7D08',lineDash:[1,2,3,4,5,6]},
	{name:'±660kV1003',color:'#FA7D08',lineDash:[0]},
	{name:'±660kV1004',color:'#FA7D08',lineDash:[0]},
	
	{name:'other1001',color:'#FF0000',lineDash:[1,2,3,4,5,6]},
	{name:'other1002',color:'#FF0000',lineDash:[1,2,3,4,5,6]},
	{name:'other1003',color:'#FF0000',lineDash:[0]},
	{name:'other1004',color:'#FF0000',lineDash:[0]}
];

var dcline = {};
for(var i=0;i<DCLineStyle.length;i++){
	dcline[DCLineStyle[i].name] = new ol.style.Style({
    	stroke: new ol.style.Stroke({
           width: 2,
           color: DCLineStyle[i].color,
           lineDash:DCLineStyle[i].lineDash
          })
	})
}

//交流线路样式
var ACLineStyle = [
		{name:'1000kV1001',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
		{name:'1000kV1002',color:'#0000FF',lineDash:[1,2,3,4,5,6]},
		{name:'1000kV1003',color:'#0000FF',lineDash:[0]},
		{name:'1000kV1004',color:'#0000FF',lineDash:[0]},

		{name:'750kV1001',color:'#FA800A',lineDash:[1,2,3,4,5,6]},
		{name:'750kV1002',color:'#FA800A',lineDash:[1,2,3,4,5,6]},
		{name:'750kV1003',color:'#FA800A',lineDash:[0]},
		{name:'750kV1004',color:'#FA800A',lineDash:[0]},
		
		{name:'500kV1001',color:'#FF0000',lineDash:[1,2,3,4,5,6]},
		{name:'500kV1002',color:'#FF0000',lineDash:[1,2,3,4,5,6]},
		{name:'500kV1003',color:'#FF0000',lineDash:[0]},
		{name:'500kV1004',color:'#FF0000',lineDash:[0]},
		
		{name:'330kV1001',color:'#2FA2FF',lineDash:[1,2,3,4,5,6]},
		{name:'330kV1002',color:'#2FA2FF',lineDash:[1,2,3,4,5,6]},
		{name:'330kV1003',color:'#2FA2FF',lineDash:[0]},
		{name:'330kV1004',color:'#2FA2FF',lineDash:[0]},
		
		{name:'220kV1001',color:'#C000C0',lineDash:[1,2,3,4,5,6]},
		{name:'220kV1002',color:'#C000C0',lineDash:[1,2,3,4,5,6]},
		{name:'220kV1003',color:'#C000C0',lineDash:[0]},
		{name:'220kV1004',color:'#C000C0',lineDash:[0]},
		
		{name:'110kV1001',color:'#FFAAFF',lineDash:[1,2,3,4,5,6]},
		{name:'110kV1002',color:'#FFAAFF',lineDash:[1,2,3,4,5,6]},
		{name:'110kV1003',color:'#FFAAFF',lineDash:[0]},
		{name:'110kV1004',color:'#FFAAFF',lineDash:[0]},
		
		{name:'66kV1001',color:'#FFFF00',lineDash:[1,2,3,4,5,6]},
		{name:'66kV1002',color:'#FFFF00',lineDash:[1,2,3,4,5,6]},
		{name:'66kV1003',color:'#FFFF00',lineDash:[0]},
		{name:'66kV1004',color:'#FFFF00',lineDash:[0]},
		
		{name:'60kV1001',color:'#FFFF00',lineDash:[1,2,3,4,5,6]},
		{name:'60kV1002',color:'#FFFF00',lineDash:[1,2,3,4,5,6]},
		{name:'60kV1003',color:'#FFFF00',lineDash:[0]},
		{name:'60kV1004',color:'#FFFF00',lineDash:[0]},
		
		{name:'35kV1001',color:'#FFCC00',lineDash:[1,2,3,4,5,6]},
		{name:'35kV1002',color:'#FFCC00',lineDash:[1,2,3,4,5,6]},
		{name:'35kV1003',color:'#FFCC00',lineDash:[0]},
		{name:'35kV1004',color:'#FFCC00',lineDash:[0]},
		
		{name:'other1001',color:'#E2AB06',lineDash:[1,2,3,4,5,6]},
		{name:'other1002',color:'#E2AB06',lineDash:[1,2,3,4,5,6]},
		{name:'other1003',color:'#E2AB06',lineDash:[0]},
		{name:'other1004',color:'#E2AB06',lineDash:[0]},
]

var acline = {};
for(var i=0;i<ACLineStyle.length;i++){
	acline[ACLineStyle[i].name] = new ol.style.Style({
    	stroke: new ol.style.Stroke({
           width: 2,
           color: ACLineStyle[i].color,
           lineDash:ACLineStyle[i].lineDash
          })
	})
}


var towerLevel = {
		level5:'100',
		level6:'90',
		level7:'80',
		level8:'60',
		level9:'50',
		level10:'40',
		level11:'20',
		level12:'10',
		level13:'1',
		level14:'1',
		level15:'1'
}



