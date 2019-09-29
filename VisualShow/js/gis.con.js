/*---------------------------
title：openlayers的地图应用通用库
author：cqy
datetime：2019-09-24
 ----------------------------*/
(function () {
    window.GISCON = GISCON = {};

    //常用量
    GISCON.CONST = {
        server: "http://127.0.0.1/api/",
        server1: "http://127.0.0.1/gis/",
        mapsUrl: "http://172.16.221.114/js3/",
        mapsUrlWx: "http://172.16.221.114/js3/"
    };

    /*---ajax封装-------
    例：ananas.ajaxHandler("file/GetImageLists", { type: "TxImage" }).done(function (data) {}).fail(function (res) { });
    ---------------*/
    GISCON.ajaxHandler = function (url, param) {
        return $.post(url + "?time=" + (new Date()).getTime(), param).then(function (data) {
            if (data.result == "success") {
                return data.data;
            } else {
                return $.Deferred().reject(data);
            }
        }, function (err) {
            // 失败回调
            console.log(err.status); // 打印状态码
        });
    };

    /*----GISCON扩展方法 主文件：gis.con.js------*/
    //GIS地图方法
    var _GIS = function () {
        this.init();
    }

    _GIS.prototype = {
        init: function () {
            this.layers();
            this.initMAP();
            this.drawing();
            this.initEvent();
        },
        layers: function () {
            var StreetMapUrl = GISCON.CONST.mapsUrl + '{z}/{x}/{y}.png';
            var HybridMapUrl = GISCON.CONST.mapsUrlWx + '{z}/{x}/{y}.png';
            //街道图
            this.StreetMap = new ol.layer.Tile({
                visible: false,
                source: new ol.source.XYZ({
                    url: StreetMapUrl,
                }),
                zIndex: 0
            });

            //混合图
            this.HybridMap = new ol.layer.Tile({
                visible: true,
                source: new ol.source.XYZ({
                    url: HybridMapUrl,
                }),
                zIndex: 0
            });

            //区域图层
            var markVectorSource = new ol.source.Vector();
            this.layer = new ol.layer.Vector({
                source: markVectorSource,
                zIndex: 2
            });


            //气象图层
            var sceneSource = new ol.source.Vector();
            this.sceneLayer = new ol.layer.Vector({
                source: sceneSource,
                zIndex: 2
            });

            //电厂图层
            var plantSource = new ol.source.Vector();
            this.plantLayer = new ol.layer.Vector({
                source: plantSource,
                zIndex: 2
            });
            this.plantSource = plantSource;

            //变电站图层
            var subSource = new ol.source.Vector();
            this.subLayer = new ol.layer.Vector({
                source: subSource,
                zIndex: 2
            });

            //换流站图层
            var ConSubSource = new ol.source.Vector();
            this.ConSubLayer = new ol.layer.Vector({
                source: ConSubSource,
                zIndex: 2
            });

            //直流线路图层
            var DCLineSource = new ol.source.Vector();
            this.DCLineLayer = new ol.layer.Vector({
                source: DCLineSource,
                zIndex: 2
            });

            //交流线路图层
            var ACLineSource = new ol.source.Vector();
            this.ACLineLayer = new ol.layer.Vector({
                source: ACLineSource,
                zIndex: 2
            });

            //厂站文字图层
            var textSource = new ol.source.Vector();
            this.textLayer = new ol.layer.Vector({
                visible: false,
                source: textSource,
                zIndex: 2
            });
            this.textSource = textSource;
            //搜索图层
            var searchSource = new ol.source.Vector();
            this.searchLayer = new ol.layer.Vector({
                source: searchSource,
                zIndex: 2
            });

            //交流杆塔线路
            var acLineTowerSource = new ol.source.Vector();
            this.acLineTowerLayer = new ol.layer.Vector({
                source: acLineTowerSource,
                zIndex: 2
            });
            //交流杆塔图标
            var acIconTowerSource = new ol.source.Vector();
            this.acIconTowerLayer = new ol.layer.Vector({
                visible: false,
                source: acIconTowerSource,
                zIndex: 2
            });

            //直流杆塔线路
            var dcLineTowerSource = new ol.source.Vector();
            this.cLineTowerLayer = new ol.layer.Vector({
                source: dcLineTowerSource,
                zIndex: 2
            });

            //直流杆塔图标
            var dcIconTowerSource = new ol.source.Vector();
            this.dcIconTowerLayer = new ol.layer.Vector({
                visible: false,
                source: dcIconTowerSource,
                zIndex: 2
            });

            //交直流线路
            var dcacSource = new ol.source.Vector();
            this.dcacLayer = new ol.layer.Vector({
                source: dcacSource,
                zIndex: 2
            });

            //交直流杆塔图标
            var dcacIconSource = new ol.source.Vector();
            this.dcacIconLayer = new ol.layer.Vector({
                visible: false,
                source: dcacIconSource,
                zIndex: 2
            });

        },
        initMAP: function () {
            var _this = this;
            //转换百度坐标
            var bdCenter = coordtransform.bd09togcj02(103.227205, 34.629795);
            //设置中心点  
            var center = ol.proj.transform(bdCenter, 'EPSG:4326', 'EPSG:3857');
            //创建地图视图
            this.view = new ol.View({
                center: center,
                zoom: 5,
                minZoom: 5,
                maxZoom: 15
            });
            //创建地图对象
            this.map = new ol.Map({
                controls: ol.control.defaults({
                    attribution: false,
                    rotate: false,
                }),
                view: _this.view,
                layers: [
                    _this.StreetMap,
                    _this.HybridMap,
                    _this.plantLayer
                ],
                target: 'map'
            });
            //this.map.addControl(new ol.control.ZoomSlider()); //缩放控件
            //this.map.addControl(new ol.control.OverviewMap()); //鸟瞰图控件
        },
        drawing: function () {
            var bs = this.getLngLat();
            //调用数据绘制          
            this.getDataDraw(GISCON.CONST.server1 + "GetMgMapsController/getPlantMapDatas",{
                "lowerLeftCornerLongtitude": bs.bsswLng,
                "lowerLeftCornerLatitude": bs.bsswLat,
                "topRightCornerLongtitude": bs.bsneLng,
                "topRightCornerLatitude": bs.bsneLat,
                "relId": "10000000-001",
                "status": "1001,1002,1003",
                "acCodes": "1000kV,750kV",
                "plants": "1001,1002,1004,1005,1003,1006"
            });
        },
        getDataDraw:function(url,param){
            var _this=this;
            GISCON.ajaxHandler(url, param).done(function (data) {
                    var plantSource = _this.plantSource;
                    var textSource = _this.textSource;
                    plantSource.clear();
                    var plantText = textSource.getFeatures();
                    for (var i = 0; i < plantText.length; i++) {
                        if (plantText[i].N.text == "发电厂") {
                            textSource.removeFeature(plantText[i]);
                        }
                    }
                    for (var i = 0; i < data.length; i++) {
                        var id = data[i].id;
                        var name = data[i].name;
                        var lng = data[i].longitude;
                        var lat = data[i].latitude;
                        var type_name = data[i].type_name;
                        var voltage_type = data[i].voltage_type;
                        var lngLatBd = coordtransform.bd09togcj02(lng, lat);
                        var features = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.transform(lngLatBd, 'EPSG:4326', 'EPSG:3857')),
                            id: id,
                            name: name,
                            voltage_type: voltage_type,
                            type_name: type_name
                        });
                        var plantStyle = _this.selectPlantIcon(voltage_type, type_name);
                        features.setStyle(plantStyle);
                        plantSource.addFeature(features);

                        //添加文字
                        var textFeatures = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.transform(lngLatBd, 'EPSG:4326', 'EPSG:3857')),
                            text: '发电厂',
                        });
                        var textStyle = new ol.style.Style({
                            text: new ol.style.Text({
                                text: name,
                                font: 'bold 12px 微软雅黑',
                                offsetY: 20,
                                fill: new ol.style.Fill({
                                    color: "#1c3e77"
                                }),
                                stroke: new ol.style.Stroke({
                                    color: "#FFFFFF",
                                    width: 2
                                })
                            })
                        })
                        textFeatures.setStyle(textStyle);
                        textSource.addFeature(textFeatures);
                }
            }).fail(function (res) { 

            });
        },
        selectPlantIcon: function (voltage_type, type_name) {
            return plant[voltage_type + type_name];
        },
        getLngLat: function () {
            //获取对角线的经纬度
            var map = this.map;
            var bs = {};
            var quarter = map.getView().calculateExtent(map.getSize());
            var lowerLeftBd = coordtransform.bd09togcj02(quarter[0], quarter[1]);
            var topRightBd = coordtransform.bd09togcj02(quarter[2], quarter[3]);
            var lowerLeft = ol.proj.transform(lowerLeftBd, 'EPSG:3857', 'EPSG:4326');
            var topRight = ol.proj.transform(topRightBd, 'EPSG:3857', 'EPSG:4326');
            var bsswLng = lowerLeft[0];
            var bsswLat = lowerLeft[1];
            var bsneLng = topRight[0];
            var bsneLat = topRight[1];
            bs.bsswLng = parseFloat(bsswLng).toFixed(4);
            bs.bsswLat = parseFloat(bsswLat).toFixed(4);
            bs.bsneLng = parseFloat(bsneLng).toFixed(4);
            bs.bsneLat = parseFloat(bsneLat).toFixed(4);
            return bs;
        },
        initEvent: function () {

        }
    }

    //输出方法
    GISCON.gis = _GIS;

}());