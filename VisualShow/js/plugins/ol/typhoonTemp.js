/**
 * @classdesc 在地图上播放台风路径
 * @param options
 * @param options.bmap
 *            {bxmap.Map}
 * @param options.enableNodeClick
 *            {Boolean} 是否开启台风数据节点点击事件，默认为true
 * @param options.showInfoWindow
 *            {Boolean} 是否显示默认的信息弹框，默认为true，只有enableNodeClick为true时才有效
 * @fires nodeclicked
 * @extends {ol.Object}
 * @constructor
 */
bxmap.Typhoon = function(options) {
	ol.Object.call(this);

	var opts = options || {};
	/**
	 * @description 播放状态，true - 正在播放中
	 * @readonly
	 * @type {Boolean}
	 */
	this.playing = false;

	/**
	 * @description 是否为投影坐标系
	 * @public
	 * @type {Boolean}
	 */
	this.isProjected = true;

	/**
	 * @description 台风实际路径数据
	 * @readonly
	 * @type {Array}
	 */
	this.path = [];

	/**
	 * @description 是否开启台风数据节点点击事件
	 * @readonly
	 * @type {Boolean}
	 */
	this.enableNodeClick = opts.enableNodeClick == null ? true
			: opts.enableNodeClick;

	/**
	 * @description 是否显示默认的信息弹框
	 * @readonly
	 * @type {Boolean}
	 */
	this.showInfoWindow = opts.showInfoWindow == null ? true
			: opts.showInfoWindow;

	/**
	 * @description 地图
	 * @readonly
	 * @type {bxmap.Map}
	 */
	this.bmap = null;

	/**
	 * @description 用于存储绘制的24小时、48小时警戒线
	 * @readonly
	 * @type {bxmap.layer.Vector}
	 */
	this.picketLineLayer = null;

	/**
	 * @description 用于存储台风实际路线节点
	 * @readonly
	 * @type {bxmap.layer.Vector}
	 */
	this.realNodesLayer = null;

	/**
	 * @description 用于存储台风预报路线节点
	 * @readonly
	 * @type {bxmap.layer.Vector}
	 */
	this.forecastNodesLayer = null;

	/**
	 * @description 用于存储不交互的数据，包括台风实际路线、预报路线、风圈和台风图标
	 * @type {bxmap.layer.Vector}
	 * @private
	 */
	this.resourceLayer = null;

	/**
	 * @description 根据预报时间分组的中国预报数据[{YBSJ: "", data: info}]
	 * @type {Array} [{YBSJ: "", data: info}]
	 * @private
	 */
	this._forecastGroupPaths = null;

	/**
	 * @description 点击台风节点信息弹框
	 * @type {bxmap.overlay.Popup}
	 */
	this.infoWindow = new bxmap.overlay.Popup({
		showClose : false,
		positioning : 'bottom-center',
		panToCenter : false
	});

	// 初始化样式
	this.styles = this.createStyles();

	// 初始化图层
	this._initializeLayers();
	// 设置地图
	this.setMap(opts.bmap);

	// 开启台风节点点击事件
	if (this.enableNodeClick) {
		this.enableNodeDetected();
	}
	// 绘制默认警戒线
	this.drawDefaultPicketLine();
}
ol.inherits(bxmap.Typhoon, ol.Object);

/**
 * @description 创建样式
 * @return {JSON}
 */
bxmap.Typhoon.prototype.createStyles = function() {
	var output = {};
	// 台风节点
	output["TyphoonNodes_Unselected"] = {
		"热带低压" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngRddy
			})
		}),
		"热带风暴" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngRdfb
			})
		}),
		"强热带风暴" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngQrdfb
			})
		}),
		"台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngTf
			})
		}),
		"强台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngQtf
			})
		}),
		"超强台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 0.8,
				scale : 0.8,
				src : bxmap.Resource.TyphoonPngCqtf
			})
		})
	};
	output["TyphoonNodes_Selected"] = {
		"热带低压" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngRddy
			})
		}),
		"热带风暴" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngRdfb
			})
		}),
		"强热带风暴" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngQrdfb
			})
		}),
		"台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngTf
			})
		}),
		"强台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngQtf
			})
		}),
		"超强台风" : new ol.style.Style({
			image : new ol.style.Icon({
				opacity : 1,
				scale : 1,
				src : bxmap.Resource.TyphoonPngCqtf
			})
		})
	};

	return output;
}

/**
 * @description 初始化图层
 * @param bmap
 * @private
 */
bxmap.Typhoon.prototype._initializeLayers = function() {
	// 24小时48小时警戒线
	this.picketLineLayer = new bxmap.layer.Vector({
		source : new ol.source.Vector()
	});
	// 台风实际路线节点
	this.realNodesLayer = new bxmap.layer.Vector({
		source : new ol.source.Vector(),
		property : "symbol",
		style : null,
		context : function(feature) {
			return feature["symbol"];
		}
	});
	var symbolizer = new bxmap.symbol.UniqueValueSymbolizer();
	var styles = this.styles;
	symbolizer.addRule({
		ruleName : "default",
		styles : styles["TyphoonNodes_Unselected"]
	});
	symbolizer.addRule({
		ruleName : "selected",
		styles : styles["TyphoonNodes_Selected"]
	});
	symbolizer.addRule({
		ruleName : "unselected",
		styles : styles["TyphoonNodes_Unselected"]
	});
	this.realNodesLayer.setSymbolizer(symbolizer);

	// 台风预测路线节点
	this.forecastNodesLayer = new bxmap.layer.Vector({
		source : new ol.source.Vector(),
		property : "symbol",
		style : null,
		context : function(feature) {
			return feature["symbol"];
		}
	});
	symbolizer = new bxmap.symbol.UniqueValueSymbolizer();
	symbolizer.addRule({
		ruleName : "default",
		styles : styles["TyphoonNodes_Unselected"]
	});
	symbolizer.addRule({
		ruleName : "selected",
		styles : styles["TyphoonNodes_Selected"]
	});
	symbolizer.addRule({
		ruleName : "unselected",
		styles : styles["TyphoonNodes_Unselected"]
	});
	this.forecastNodesLayer.setSymbolizer(symbolizer);

	// 其他数据
	this.resourceLayer = new bxmap.layer.Vector({
		source : new ol.source.Vector()
	});
}

/**
 * @description 设置地图
 * @param bmap
 *            {bxmap.Map}
 */
bxmap.Typhoon.prototype.setMap = function(bmap) {
	if (this.bmap && this.bmap == bmap)
		return;
	if (this.bmap) {
		var map = this.bmap.getMap();
		map.removeOverlay(this.infoWindow);
		map.removeLayer(this.picketLineLayer);
		map.removeLayer(this.resourceLayer);
		map.removeLayer(this.forecastNodesLayer);
		map.removeLayer(this.realNodesLayer);
	}

	if (bmap) {
		var map = bmap.getMap();
		map.addOverlay(this.infoWindow);
		map.addLayer(this.picketLineLayer);
		map.addLayer(this.resourceLayer);
		map.addLayer(this.forecastNodesLayer);
		map.addLayer(this.realNodesLayer);
	}
	this.bmap = bmap;
	if (this.bmap) {
		// 根据地图坐标系判断是否为经纬度坐标系
		var view = this.bmap.getMap().getView();
		var sourceProj = view.getProjection();
		if (sourceProj.getUnits() == 'degrees') {
			this.isProjected = false;
		}
	}
}

/**
 * @description 绘制默认警戒线
 */
bxmap.Typhoon.prototype.drawDefaultPicketLine = function() {
	// 警戒线数据
	var picketLine24 = '';
	var picketLine48 = '';
	if (this.isProjected) {
		picketLine24 = 'LINESTRING(14137575.3307 4028802.0261, 14137575.3307 2391878.5879, 12245143.9873 1689200.1396)';
		picketLine48 = 'LINESTRING(14694172.7847 4028802.0261, 14694172.7847 1689200.1396, 11688546.5333 0)';
	} else {
		picketLine24 = 'LINESTRING(127 34, 127 21, 110 15)';
		picketLine48 = 'LINESTRING(132 34, 132 15, 105 0)';
	}
	var WKTReader = new ol.format.WKT();
	var feature24 = WKTReader.readFeature(picketLine24);
	var feature48 = WKTReader.readFeature(picketLine48);

	feature24.setStyle(new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : '#ff0000',
			width : 1
		})
	}));

	feature48.setStyle(new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : '#ffff99',
			width : 1
		})
	}));

	this.picketLineLayer.getSource().addFeatures([ feature24, feature48 ]);
}

/**
 * @description 播放台风，如果isProjected设置为true，自动将台风数据转为3857坐标系
 * @param bh -
 *            {String} 台风编号
 * @param interval -
 *            {Number} 播放速度
 */
bxmap.Typhoon.prototype.play = function(bh, interval) {
	var paths = bxmap.Typhoon.getTyphoonPath(bh);
	this.playTyphoonPath(paths, interval);
}

/**
 * @description 播放台风，如果isProjected设置为true，方法内部会自动将经纬度转为投影坐标系
 * @param paths -
 *            {Array} 通过bxmap.Typhoon.getTyphoonPath获取，[0]-实际路径;[1]-预报路径
 * @param interval -
 *            {Number} 播放速度，默认150毫秒
 */
bxmap.Typhoon.prototype.playTyphoonPath = function(paths, interval) {
	// 清空数据
	this.clearData([ this.picketLineLayer ]);
	// 预处理数据
	this._preHandle(paths);

	var self = this;
	var realPath = this.path = paths[0], // 实际路线
	chinaYbData = self._subChinaYbData(paths[1]); // 中国预报路线
	self._forecastGroupPaths = self._groupByYBSJ(chinaYbData); // 根据预报时间分组的数据

	// 跳转定位
	var start = [ Number(realPath[0].X), Number(realPath[1].Y) ];
	var view = this.bmap.getMap().getView();
	view.setCenter(start);
	view.setZoom(5);

	// 初始化台风路线实际、预报路线
	this._initWindPath();
	// 初始化风圈对象
	this._initWindCircle();

	var interval = interval || 150;
	var index = 0;
	self._timer = setInterval(function() {
		// 结束条件
		if (index >= realPath.length) {
			clearInterval(self._timer);
			self.playing = false;
			return;
		}
		self.playing = true; // 正在播放中

		var node = realPath[index]; // 实际位置节点
		var curPosition = [ node.X, node.Y ];
		var nextPostion = []; // 下一个点
		if (index < (realPath.length - 1)) {
			var nextNode = realPath[index + 1];
			nextPostion = [ Number(nextNode.X), Number(nextNode.Y) ];
		}

		// 创建风圈
		self.setWindCircle(node);
		// 创建实际路线
		var realPathLine = self._realPathFeature.getGeometry();
		if (nextPostion.length) {
			if (index == 0) {
				realPathLine.setCoordinates([ curPosition, nextPostion ]);
			} else {
				realPathLine.appendCoordinate(nextPostion);
			}
		}

		// 创建实际路线节点
		var realNodeFeature = new ol.Feature({
			geometry : new ol.geom.Point(curPosition)
		});
		realNodeFeature["symbol"] = bxmap.Typhoon.getTyphoonLevel(node.ZXFS);
		realNodeFeature["nodeData"] = node; // 关联台风数据
		realNodeFeature.setId(node.RQSJ); // 设置id
		self.realNodesLayer.getSource().addFeature(realNodeFeature);

		// 加载预报数据到地图上（包括预报路线和预报节点）
		self.addForecastDataToMap(node);

		index++;
	}, interval);
}

/**
 * @description 预处理台风路线数据，台风坐标系存储于XY
 * @param paths
 * @private
 */
bxmap.Typhoon.prototype._preHandle = function(paths) {
	// 地图为投影坐标系时需要将经纬度转为EPSG:3857
	if (this.isProjected) {
		// 将经纬度转为EPSG:3857
		function toEPSG3857(arr) {
			for (var i = 0; i < arr.length; i++) {
				var record = arr[i];
				var p = ol.proj.fromLonLat([ Number(record.JD),
						Number(record.WD) ]);
				record.X = p[0];
				record.Y = p[1];
			}
		}

		toEPSG3857(paths[0]);// 实际路线
		toEPSG3857(paths[1]);// 预报路线
	} else {
		function setXY(arr) {
			for (var i = 0; i < arr.length; i++) {
				var record = arr[i];
				var p = [ Number(record.JD), Number(record.WD) ];
				record.X = p[0];
				record.Y = p[1];
			}
		}

		setXY(paths[0]);// 实际路线
		setXY(paths[1]);// 预报路线
	}
}

/**
 * @description 仅清空台风数据
 * @param excepts -
 *            {Array<bxmap.layer.Vector>} 例外图层，哪些图层数据不清空
 */
bxmap.Typhoon.prototype.clearData = function(excepts) {
	// 清空定时器
	clearInterval(this._timer);
	// 清空台风实际路径
	this.path = [];
	// 不在播放
	this.playing = false;

	// 关闭弹框
	this.infoWindow && this.infoWindow.close();

	excepts = excepts || [];
	// 实际路线节点
	if (this.realNodesLayer
			&& !bxmap.common.exist(this.realNodesLayer, excepts)) {
		this.realNodesLayer.getSource().clear(true);
	}
	// 预报路线节点
	if (this.forecastNodesLayer
			&& !bxmap.common.exist(this.forecastNodesLayer, excepts)) {
		this.forecastNodesLayer.getSource().clear(true);
	}
	// 台风实际路线、预报路线和台风图标
	if (this.resourceLayer && !bxmap.common.exist(this.resourceLayer, excepts)) {
		this.resourceLayer.getSource().clear(true);
	}
	// 24小时、48小时警戒线
	if (this.picketLineLayer
			&& !bxmap.common.exist(this.picketLineLayer, excepts)) {
		this.picketLineLayer.getSource().clear(true);
	}
}

/**
 * @description 清除图层
 */
bxmap.Typhoon.prototype.clear = function() {
	// 清空定时器
	clearInterval(this._timer);
	// 清空台风实际路径
	this.path = [];
	// 不在播放
	this.playing = false;

	// 关闭弹框
	this.infoWindow && this.infoWindow.close();

	var map = this.bmap.getMap();
	if (map) {
		// 实际路线节点
		this.realNodesLayer && map.removeLayer(this.realNodesLayer);
		// 预报路线节点
		this.forecastNodesLayer && map.removeLayer(this.forecastNodesLayer);
		// 台风实际路线、预报路线和台风图标
		this.resourceLayer && map.removeLayer(this.resourceLayer);
		// 24小时、48小时警戒线
		this.picketLineLayer && map.removeLayer(this.picketLineLayer);
	}
}

/**
 * @description 设置风圈
 * @param node -
 *            {JSON}
 *            格式{"WD":"20.9","JD":"116.2","EN7Radii":"220","ES7Radii":"220","WS7Radii":"260","WN7Radii":"240","EN10Radii":"50","ES10Radii":"80","WS10Radii":"80","WN10Radii":"50"}
 */
bxmap.Typhoon.prototype.setWindCircle = function(node) {
	if (node == null)
		return;

	var n = node;
	var center = [ n.X, n.Y ];
	// 台风位置
	this._typhoonFeature.setGeometry(new ol.geom.Point([ Number(center[0]),
			Number(center[1]) ]));

	// 7级风圈
	if (n.EN7Radii) {
		var path = this.getSectorPoints(center, n.EN7Radii, 0, 90, 30);
		this._windEN7.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windEN7.setGeometry(null);
	}
	if (n.ES7Radii) {
		var path = this.getSectorPoints(center, n.ES7Radii, 90, 180, 30);
		this._windES7.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windES7.setGeometry(null);
	}
	if (n.WS7Radii) {
		var path = this.getSectorPoints(center, n.WS7Radii, 180, 270, 30);
		this._windWS7.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windWS7.setGeometry(null);
	}
	if (n.WN7Radii) {
		var path = this.getSectorPoints(center, n.WN7Radii, 270, 360, 30);
		this._windWN7.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windWN7.setGeometry(null);
	}
	// 10级风圈
	if (n.EN10Radii) {
		var path = this.getSectorPoints(center, n.EN10Radii, 0, 90, 30);
		this._windEN10.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windEN10.setGeometry(null);
	}
	if (n.ES10Radii) {
		var path = this.getSectorPoints(center, n.ES10Radii, 90, 180, 30);
		this._windES10.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windES10.setGeometry(null);
	}
	if (n.WS10Radii) {
		var path = this.getSectorPoints(center, n.WS10Radii, 180, 270, 30);
		this._windWS10.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windWS10.setGeometry(null);
	}
	if (n.WN10Radii) {
		var path = this.getSectorPoints(center, n.WN10Radii, 270, 360, 30);
		this._windWN10.setGeometry(new ol.geom.Polygon([ path ]));
	} else {
		this._windWN10.setGeometry(null);
	}
}

/**
 * @description 创建台风要素
 * @return {ol.Feature}
 */
bxmap.Typhoon.prototype.createTyphoonFeature = function() {
	var feature = new ol.Feature();
	feature.setStyle(new ol.style.Style({
		image : new ol.style.Icon({
			src : bxmap.Resource.TyphoonPng
		})
	}));
	return feature;
}

/**
 * @description 逆时针计算扇形风圈的点集合
 * @param center -
 *            {Array<String|Number>}中心点，例如[117.23,23.123]
 * @param radius -
 *            {String|Number} 半径km
 * @param startAngle -
 *            {String|Number} 起始角度（单位°）
 * @param endAngle -
 *            {String|Number} 结束角度（单位°）
 * @param pointNum -
 *            {String|Number} 返回构成的弧点个数，默认30
 * @return {Array}
 */
bxmap.Typhoon.prototype.getSectorPoints = function(center, radius, startAngle,
		endAngle, pointNum) {
	radius = Number(radius) * 1000;

	if (!this.isProjected) {
		var MetersPerUnit = 111319.49079327358; // 1度多少米
		radius = radius
		/MetersPerUnit;//转化为度
	}
	center = [ Number(center[0]), Number(center[1]) ];
	startAngle = Number(startAngle);
	endAngle = Number(endAngle);
	pointNum = Number(pointNum || 30);

	var sin;
	var cos;
	var x;
	var y;
	var angle;
	var points = new Array();
	var pointsLL = new Array();
	var lonlat = center;
	points.push([ center[0], center[1] ]);
	for (var i = 0; i <= pointNum; i++) {
		angle = startAngle + (endAngle - startAngle) * i / pointNum;
		sin = Math.sin(angle * Math.PI / 180);
		cos = Math.cos(angle * Math.PI / 180);
		x = center[0] + radius * sin;
		y = center[1] + radius * cos;

		points[i + 1] = [ x, y ];
	}
	points.push([ center[0], center[1] ]);
	for (var j = 0; j < points.length; j++) {
		pointsLL[j] = points[j];
	}

	return pointsLL;
}

/**
 * @description 加载预报数据到地图上（包括预报路线和预报节点），预报时间分组数据必需已计算，例如在play方式之后使用
 * @param node
 */
bxmap.Typhoon.prototype.addForecastDataToMap = function(node) {
	// 清空预报路线节点
	this.forecastNodesLayer.getSource().clear();
	// 根据预报时间分组的数据
	var forecastGroupPaths = this._forecastGroupPaths;
	if (!forecastGroupPaths || !forecastGroupPaths.length)
		return;

	// 获取预报数据
	var ybData = this._getForecastData(node, forecastGroupPaths);
	// 创建预报路线节点
	var coords = this._addForecastNodesToMap(ybData);
	// 创建预报路线
	if (coords.length) {
		coords.unshift([ Number(node.X), Number(node.Y) ]); // 添加该位置为首节点
	}
	this._forecastPathFeature.getGeometry().setCoordinates(coords);
}

/**
 * @description 开启实际节点、预测节点点击事件
 * @private
 */
bxmap.Typhoon.prototype.enableNodeDetected = function() {
	this.disableNodeDetected();

	// 实际路线节点图层
	var layer = this.realNodesLayer;
	layer.registerDetectingFeature(this.bmap);
	layer.on("afterselect", this._handleRealLayerNodeClick, this);

	// 预测路线节点图层
	layer = this.forecastNodesLayer;
	layer.registerDetectingFeature(this.bmap);
	layer.on("afterselect", this._handleForecastLayerNodeClick, this);

	this.enableNodeClick = true;
}

/**
 * @description 取消实际节点、预测节点点击事件
 * @private
 */
bxmap.Typhoon.prototype.disableNodeDetected = function() {
	// 实际路线节点图层
	var layer = this.realNodesLayer;
	layer.unregisterDetectingFeature(this.bmap);
	layer.un("afterselect", this._handleRealLayerNodeClick, this);

	// 预测路线节点图层
	layer = this.forecastNodesLayer;
	layer.unregisterDetectingFeature(this.bmap);
	layer.un("afterselect", this._handleForecastLayerNodeClick, this);

	this.enableNodeClick = false;
}

/**
 * @description 实际路线节点点击事件
 * @param evt
 * @private
 */
bxmap.Typhoon.prototype._handleRealLayerNodeClick = function(evt) {
	// //正在播放中不允许点击操作
	// if (this.playing) return;

	// 当前点击的真实路径节点
	this._clickedRealNode = evt.feature;

	// 取消选中要素
	if (!evt.feature) {
		this.infoWindow && this.infoWindow.close();
		return;
	}

	var feature = evt.feature;
	var node = feature["nodeData"];

	// 播放状态下风圈位置不再重新设置
	if (!this.playing) {
		// 显示风圈和预报数据
		this.setWindCircle(node);
		// 加载预报数据到地图上（包括预报路线和预报节点）
		this.addForecastDataToMap(node);
	}

	// 信息弹框
	if (this.showInfoWindow) {
		var html = this._getRealInfoHtml(node);
		var coord = feature.getGeometry().getCoordinates();

		// 台风名称 + 时间
		var name = node.TFM, date = this._formateTyphoonTime(node.RQSJ);
		var title = '<span style="font-weight:bold;font-size:14px;">' + name
				+ '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + date;
		this.infoWindow.show(coord, html, title);
	}

	// 触发nodeclicked
	this.dispatchEvent({
		type : 'nodeclicked',
		target : this,
		feature : feature
	});
}

/**
 * @description 预测路线节点点击事件
 * @param evt
 * @private
 */
bxmap.Typhoon.prototype._handleForecastLayerNodeClick = function(evt) {
	// 正在播放中不允许点击操作
	if (this.playing)
		return;

	// 避免真实路径节点弹框信息被关闭
	if (!evt.feature && this._clickedRealNode) {
		return;
	}

	// 取消选中要素
	if (!evt.feature) {
		this.infoWindow && this.infoWindow.close();
		return;
	}

	var feature = evt.feature;
	// 信息弹框
	if (this.showInfoWindow) {
		var node = feature["nodeData"];
		var html = this._getForecastInfoHtml(node);
		var coord = feature.getGeometry().getCoordinates();
		// 预报台 + 时间
		var name = node.TM, date = this._formateTyphoonTime(node.RQSJ);
		var title = '<span style="font-weight:bold;font-size:14px;">' + name
				+ '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + date + '&nbsp;预报';
		this.infoWindow.show(coord, html, title);
	}

	// 触发nodeclicked
	this.dispatchEvent({
		type : 'nodeclicked',
		target : this,
		feature : feature
	});
}

/**
 * 将台风时间格式化为 8月20日5时5分5秒
 * 
 * @param time
 *            {String} 时间格式为：YYYY-MM-DD HH:mm:ss
 * @return {String}
 * @private
 */
bxmap.Typhoon.prototype._formateTyphoonTime = function(time) {
	// YYYY-MM-DD HH:mm:ss
	// 处理为8月20日5时5分5秒
	var output = "";
	var MM = time.substr(5, 2);
	if (MM == "00")
		return output;
	MM = (Number(MM) < 10 ? MM.substr(1) : MM) + "月";
	var DD = time.substr(8, 2);
	DD = (Number(DD) < 10 ? DD.substr(1) : DD) + "日";

	var ss = time.substr(17, 2);
	ss = ss !== "00" ? ((Number(ss) < 10 ? ss.substr(1) : ss) + "秒") : "";

	var mm = time.substr(14, 2);
	mm = mm !== "00" ? ((Number(mm) < 10 ? mm.substr(1) : mm) + "分")
			: (ss ? "0分" : "");

	var HH = time.substr(11, 2);
	HH = HH !== "00" ? ((Number(HH) < 10 ? HH.substr(1) : HH) + "时")
			: (mm ? "0时" : "");

	output = MM + DD + HH + mm + ss;

	return output;
}

/** 获取台风详细信息模版* */
bxmap.Typhoon.prototype._getRealInfoHtml = function(node) {
	var data = node || {};

	var tfmc = data.TFM + "(" + data.TFBH + ")", // 台风名称
	zxwz = data.JD + "°|" + data.WD + "°", // 中心位置
	zxqy = (data.ZXQY || "-") + "&nbsp;百帕", // 中心气压
	zdfs = (data.ZXFS || "-") + "&nbsp;米/秒", // 最大风速
	dj = data.ZXFS ? bxmap.Typhoon.getTyphoonLevel(data.ZXFS) : "-", // 等级
	ydsd = (data.YDSD || "-") + "&nbsp;公里/小时", // 移动速度
	ydfx = (data.YDFX || "-"), qjbj = (data.RADIUS7 || "-") + "&nbsp;公里", // 七级风圈
	sjbj = (data.RADIUS10 || "-") + "&nbsp;公里"; // 十级风圈

	html = '<div style="height:167px;width:180px;color: #615e5e;">';
	html += '<div>台风名称：' + tfmc + '</div>';
	html += '<div>中心位置：' + zxwz + '</div>';
	html += '<div>最大风速：' + zdfs + '</div>';
	html += '<div>中心气压：' + zxqy + '</div>';
	html += '<div>等&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：' + dj + '</div>';
	html += '<div>移动速度：' + ydsd + '</div>';
	html += '<div>移动方向：' + ydfx + '</div>';
	html += '<div>七级风圈半径：' + qjbj + '</div>';
	html += '<div>十级风圈半径：' + sjbj + '</div>';
	html += '</div>';
	return html;
}
/**
 * 
 * @param node
 * @return {String}
 * @private
 */
bxmap.Typhoon.prototype._getForecastInfoHtml = function(node) {
	var data = node || {};

	var ybt = data.TM, // 预报台
	fbsj = this._formateTyphoonTime(data.YBSJ), // 发布时间
	ybsj = this._formateTyphoonTime(data.RQSJ), // 预报时间
	zxwz = data.JD + "°|" + data.WD + "°", // 中心位置
	zxqy = (data.ZXQY || "-") + "&nbsp;百帕", // 中心气压
	zdfs = (data.ZXFS || "-") + "&nbsp;米/秒", // 最大风速
	dj = data.ZXFS ? bxmap.Typhoon.getTyphoonLevel(data.ZXFS) : "-"; // 等级

	var html = '<div style="height:129px;width:180px;color: #615e5e;">';
	html += '<div>预报台：' + ybt + '</div>';
	html += '<div>发布时间：' + fbsj + '</div>';
	html += '<div>预报时间：' + ybsj + '</div>';
	html += '<div>中心位置：' + zxwz + '</div>';
	html += '<div>中心气压：' + zxqy + '</div>';
	html += '<div>最大风速：' + zdfs + '</div>';
	html += '<div">等&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：' + dj + '</div>';
	html += '</div>';
	return html;
}

/**
 * @description 从预报数据中获取中国预报台风数据
 * @param ybData
 *            Array 预报数据
 * @private
 * @return Array
 */
bxmap.Typhoon.prototype._subChinaYbData = function(ybData) {
	var output = [];// 中国预报路径
	for (var i = 0; i < ybData.length; i++) {
		var record = ybData[i];
		if (record.TM == "中国") {
			output.push(record);
		}
	}
	return output;
}

/**
 * @description 获取指定位置节点的预报数据
 * @param node
 *            {JSON} 指定位置台风位置信息
 * @param forecastGroupPaths
 *            {Array} 根据预报数据分组后的中国预报数据
 * @private
 */
bxmap.Typhoon.prototype._getForecastData = function(node, forecastGroupPaths) {
	// 转为日期格式
	function ToDate(dateString) {
		var str = dateString.replace(/-/g, "/");
		return new Date(str);
	}

	var ybPath = [];
	var date1 = ToDate(node.RQSJ); // 指定位置过去时间
	var date2 = ToDate(forecastGroupPaths[0].YBSJ); // 预报时间(发布时间)
	for (var i = 0; i < forecastGroupPaths.length; i++) {
		var record = forecastGroupPaths[i];
		var date3 = ToDate(record.YBSJ); // 预报时间
		// date1以前的数据为预报数据；找到离date1时间最接近的预报数据
		if (date1 >= date3 && date3 >= date2) {
			date2 = date3;
			ybPath = record.data;
		}
	}

	ybPath = ybPath.concat([]); // 赋值数据
	return ybPath;
}

/**
 * @description 创建预报节点到地图
 * @param ybdata
 * @return {Array} 预报节点数组
 * @private
 */
bxmap.Typhoon.prototype._addForecastNodesToMap = function(ybdata) {
	var output = [];
	ybdata = ybdata || [];
	for (var i = 0; i < ybdata.length; i++) {
		var record = ybdata[i];
		// 输出经度纬度
		output.push([ Number(record.X), Number(record.Y) ]);

		// 预报数据节点
		var position = [ Number(record.X), Number(record.Y) ];
		var feature = new ol.Feature({
			geometry : new ol.geom.Point(position)
		});
		feature["symbol"] = bxmap.Typhoon.getTyphoonLevel(record.ZXFS);
		feature["nodeData"] = record;
		this.forecastNodesLayer.getSource().addFeature(feature);
	}
	return output;
}

/**
 * @description 根据预报时间（发布时间）将预报数据分组
 * @param ybChinaData
 *            {Array} 中国预报数据
 * @return {Array} 格式 [{YBSJ:"",data:[{},...]}]
 * @private
 */
bxmap.Typhoon.prototype._groupByYBSJ = function(ybChinaData) {
	ybdata = ybChinaData || [];
	var map = {}, dest = [];
	for (var i = 0; i < ybdata.length; i++) {
		var temp = ybdata[i];
		if (!map[temp.YBSJ]) {
			dest.push({
				YBSJ : temp.YBSJ,
				data : [ temp ]
			});
			map[temp.YBSJ] = dest.length - 1; // 存储数组索引
		}
		// 同一预报时间则添加
		else {
			var index = map[temp.YBSJ];
			dest[index].data.push(temp);
		}
	}
	return dest;
}

/**
 * @description 初始化台风路线要素（实际路线和预报路线）
 * @private
 */
bxmap.Typhoon.prototype._initWindPath = function() {
	// 台风实际路线
	var feat = this._realPathFeature = new ol.Feature({
		geometry : new ol.geom.LineString([])
	});
	feat.setStyle(new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : [ 30, 144, 255 ],// "#000000",
			width : 1
		})
	}));
	this.resourceLayer.getSource().addFeature(feat);

	// 台风预报路线
	feat = this._forecastPathFeature = new ol.Feature({
		geometry : new ol.geom.LineString([])
	});
	feat.setStyle(new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : "#ffd700",
			width : 2,
			lineDash : [ 10, 2, 10 ]
		// 虚线
		})
	}));
	this.resourceLayer.getSource().addFeature(feat);
}

/**
 * @description 初始化风圈要素
 * @private
 */
bxmap.Typhoon.prototype._initWindCircle = function() {
	// 风圈样式
	if (!this._windStyles) {
		this._windStyles = {
			"Seven" : new ol.style.Style({
				fill : new ol.style.Fill({
					color : [ 60, 179, 113, 0.35 ]
				}),
				stroke : new ol.style.Stroke({
					color : [ 60, 179, 113 ],
					width : 1
				}),
				image : new ol.style.Circle({
					radius : 7,
					fill : new ol.style.Fill({
						color : [ 60, 179, 113 ]
					})
				})
			}),
			"Ten" : new ol.style.Style({
				fill : new ol.style.Fill({
					color : [ 255, 20, 147, 0.35 ]
				}),
				stroke : new ol.style.Stroke({
					color : [ 255, 165, 0 ],
					width : 1
				}),
				image : new ol.style.Circle({
					radius : 7,
					fill : new ol.style.Fill({
						color : [ 255, 165, 0 ]
					})
				})
			})
		};
	}
	// 创建7级风圈要素
	this._windEN7 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windEN7.setStyle(this._windStyles.Seven);
	this._windES7 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windES7.setStyle(this._windStyles.Seven);
	this._windWS7 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windWS7.setStyle(this._windStyles.Seven);
	this._windWN7 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windWN7.setStyle(this._windStyles.Seven);
	this.resourceLayer.getSource().addFeatures(
			[ this._windEN7, this._windES7, this._windWS7, this._windWN7 ]);

	// 创建10级风圈要素
	this._windEN10 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windEN10.setStyle(this._windStyles.Ten);
	this._windES10 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windES10.setStyle(this._windStyles.Ten);
	this._windWS10 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windWS10.setStyle(this._windStyles.Ten);
	this._windWN10 = new ol.Feature({
		geometry : new ol.geom.Polygon([])
	});
	this._windWN10.setStyle(this._windStyles.Ten);
	this.resourceLayer.getSource().addFeatures(
			[ this._windEN10, this._windES10, this._windWS10, this._windWN10 ]);

	// 台风图标
	this._typhoonFeature = this.createTyphoonFeature();
	this.resourceLayer.getSource().addFeature(this._typhoonFeature);
}

/**
 * @description 根据年份获取台风列表
 * @param year
 *            {String|Number} 年份
 */
bxmap.Typhoon.getTyphoonListByYear = function(year) {
	var output = null;
	$.ajax({
		url : GLOBAL.domainRest + "/typhoon/list",
		type : "POST",
		async : false,
		data : {
			year : year
		},
		dataType : "json",
		success : function(data) {
			if (data.obj) {
				output = eval("(" + data.obj + ")");
			}
		}
	});
	return output;
}

/**
 * @description 根据名称获取台风列表
 * @param name
 *            {String} 名称
 */
bxmap.Typhoon.getTyphoonListByName = function(name) {
	var output = null;
	$.ajax({
		url : GLOBAL.domainRest + "/typhoon/list",
		type : "POST",
		async : false,
		data : {
			name : name
		},
		dataType : "json",
		success : function(data) {
			if (data.obj) {
				output = eval("(" + data.obj + ")");
			}
		}
	});
	return output;
}

/**
 * @description 获取指定台风编号的路径数据（包括实际数据和预报数据）
 * @param bh
 * @return null|[] [0]-实际路径;[1]-预报路径
 */
bxmap.Typhoon.getTyphoonPath = function(bh) {
	if (!bh)
		return null;
	var output = null;
	$.ajax({
		url : GLOBAL.domainRest + "/typhoon/getPath",
		type : "POST",
		async : false,
		data : {
			TFBH : bh
		},
		dataType : "json",
		success : function(data) {
			if (data.obj) {
				output = eval("(" + data.obj + ")");
			}
		}
	});
	return output;
}

/**
 * @description 根据风速获取台风级别
 * @param windSpeed
 *            {String|Number}
 * @return {String}
 */
bxmap.Typhoon.getTyphoonLevel = function(windSpeed) {
	var level = "";
	var speed = Number(windSpeed);
	if (isNaN(speed))
		return level;

	if (speed <= 17.1) {
		level = "热带低压";
	} else if (speed > 17.1 && speed <= 24.4) {
		level = "热带风暴";
	} else if (speed > 24.4 && speed <= 32.6) {
		level = "强热带风暴";
	} else if (speed > 32.6 && speed <= 41.4) {
		level = "台风";
	} else if (speed > 41.4 && speed <= 50.9) {
		level = "强台风";
	} else if (speed > 50.9) {
		level = "超强台风";
	}
	return level;
}

/**
 * @classdesc 台风列表弹框，依赖jDialog
 * @constructor
 */
bxmap.TyphoonListDialog = function() {
	/**
	 * @description 台风列表弹框
	 * @readonly
	 * @type {jDialog.dialog}
	 */
	this.dialog = null;

	/**
	 * @description 当前选择的年份
	 * @public
	 * @type {String}
	 */
	this.selectedYear = '';

	/**
	 * @description 台风名称查询条件
	 * @type {String}
	 */
	this.condition = '';

	/**
	 * @description 当前年份的台风列表
	 * @readonly
	 * @type Array
	 */
	this.list = [];
}

/**
 * @description 设置台风展示的地图
 * @param bmap
 *            {bxmap.Map}
 */
bxmap.TyphoonListDialog.prototype.setTyphoonMap = function(bmap) {
	this.bmap = bmap;
}

/**
 * @description 打开窗体
 */
bxmap.TyphoonListDialog.prototype.show = function() {
	var self = this;
	var html = this._getTyphoonDialogHtml();
	this.dialog = jDialog.dialog({
		title : '台风操作面板',
		width : 430,
		top : 120,
		closeable : false,
		height : 410,
		left : document.documentElement.scrollWidth - 500,
		modal : false, // 非模态，即不显示遮罩层
		content : html
	});
	// 收缩
	this._collpse();
	// $('.j-dialog-title').css({"-webkit-box-sizing": "border-box"});

	this._initYearSelect();

	this._bindingEvents();

	this.refresh();
}

/**
 * @description 关闭窗体
 */
bxmap.TyphoonListDialog.prototype.close = function() {
	if (this.dialog) {
		this.dialog.close();
	}
	if (this._typhoonObject) {
		this._typhoonObject.clear();
	}
}

/**
 * @description 刷新台风列表
 */
bxmap.TyphoonListDialog.prototype.refresh = function() {
	var list = [];
	if (this.condition) {
		list = bxmap.Typhoon.getTyphoonListByName(this.condition);
	} else {
		list = bxmap.Typhoon.getTyphoonListByYear(this.selectedYear);
	}

	// 列表html
	this._createTFListHtml(list);
}

bxmap.TyphoonListDialog.prototype._expand = function() {
	var dialog = this.dialog;
	dialog && dialog.height(700);
}
bxmap.TyphoonListDialog.prototype._collpse = function() {
	var dialog = this.dialog;
	dialog && dialog.height(410);
}

/**
 * @description 获取台风操作窗体html
 * @return {String}
 * @private
 */
bxmap.TyphoonListDialog.prototype._getTyphoonDialogHtml = function() {
	var html = '';
	html += '<div id="typhoon_div">';
	html += ' <div id="con_div">';
	html += '  <select id="year_select" style="margin:4px;width:65px"></select>';
	html += '  <span style="margin-left:5px">输入名称：</span>';
	html += '  <input type="text" id="condition_tfName" style="width:120px;height:24px" />';
	html += '  <button id="search_typhoon" style="margin-left:10px;cursor:pointer">查询</button>';
	html += ' </div>';
	html += ' <div id="typhoon_table_div" style="height:300px;">';
	html += '  <table id="typhoon_table_head" style="">';
	html += '   <thead>';
	html += '    <tr>';
	html += '     <th>选择</th>';
	html += '     <th>台风编号</th>';
	html += '     <th>台风名</th>';
	html += '     <th>英文名</th>';
	html += '    </tr>';
	html += '   </thead>';
	html += '  </table>';
	html += '  <div id="typhoon_table_body_div" style="height:260px;width:100%">';
	html += '   <div id="typhoon_data_div">';
	html += '    <div id="progressflash" class="loadflash hiden">';
	html += '     <div class="loadingFlash">';
	html += '      <span class="icon-loading" style="font-size:24px;"></span>';
	html += '     </div>';
	html += '    </div>';
	html += '    <table id="typhoon_table_body" style="margin-top:0;border:1px solid gray">';
	html += '     <tbody></tbody>';
	html += '    </table>';
	html += '   </div>';
	html += '  </div>';
	html += ' </div>';
	html += ' <div id="typhoon_track_div" style="height:280px;display: none;">';
	html += '  <div>';
	html += '   <span id="typhoonText" style="height:30px;color:#9c9c9c">台风路径信息</span>';
	html += '  </div>';
	html += '  <table id="typhoon_track_table_head" style="">';
	html += '   <thead>';
	html += '    <tr style="border-bottom:1px solid gray">';
	html += '     <th>时间</th>';
	html += '     <th>风速（米/秒）</th>';
	html += '     <th style="width:70px">等级</th>';
	html += '     <th>移动方向</th>';
	html += '    </tr>';
	html += '   </thead>';
	html += '  </table>';
	html += '  <div id="typhoon_track_table_div" style="height:250px">';
	html += '   <div id="typhoon_track_data">';
	html += '    <table id="typhoon_track_table_body" style="margin-top:0;border:1px solid gray">';
	html += '     <tbody></tbody>';
	html += '    </table>';
	html += '   </div>';
	html += '  </div>';
	html += ' </div>';
	html += '</div>';
	return html;
}

/**
 * @description 绑定窗体事件
 * @private
 */
bxmap.TyphoonListDialog.prototype._bindingEvents = function() {
	var self = this;
	// 年份改变
	$("#year_select").on("change", function() {
		// 当前年份
		self.selectedYear = $(this).val();
		// 查询条件
		self.condition = undefined;

		self.refresh();
	});

	// 查询按钮点击
	$("#search_typhoon").on("click", function() {
		// 查询条件
		self.condition = $("#condition_tfName").val();
		self.refresh();
	});

	// 勾选台风事件
	$("#typhoon_table_body_div")
			.on(
					"change",
					"input[name='TF']",
					function(e) {
						var ischecked = $(this).is(':checked');
						// 取消所有选中
						$("#typhoon_table_body_div").find("input[name='TF']")
								.prop("checked", false);
						// 设置当前选中状态
						$(this).prop("checked", ischecked);
						// 台风对象
						if (self.bmap && !self._typhoonObject) {
							self._typhoonObject = new bxmap.Typhoon({
								bmap : self.bmap
							});
							// 地图上点击节点，路径详情列表自动调整位置
							self._typhoonObject.on("nodeclicked",
									function(evt) {
										var node = evt.feature.nodeData;
										var path = evt.target.path;
										var index = -1;
										for (var i = 0; i < path.length; i++) {
											if (path[i].RQSJ == node.RQSJ) {
												index = i;
												break;
											}
										}
										if (index > -1) {
											// 移除样式
											$("#typhoon_track_data").find("tr")
													.removeClass("TFselected");
											var $elem = $(
													"#typhoon_track_data tr")
													.eq(index);
											$elem.addClass("TFselected");
											$("#typhoon_track_table_div")
													.mCustomScrollbar(
															"scrollTo", $elem,
															"first");
										}
									});
						}
						if (ischecked) {
							// 展开
							self._expand();
							var tfbh = $(this).attr("tfbh");
							self._typhoonObject.play(tfbh);
						} else {
							// 收缩
							self._collpse();
							self._typhoonObject
									.clearData([ self._typhoonObject.picketLineLayer ]);
						}

						// 台风详情
						var path = self._typhoonObject.path;
						if (path && path.length) {
							$("#typhoon_track_div").show();
							// 设置路径信息html
							self._createTFPathDetail(path);
						} else {
							$("#typhoon_track_div").hide();
						}
					});

	// 台风路径详情点击
	$("#typhoon_track_data").on(
			"click",
			"tr",
			function(e) {
				// 移除样式
				$("#typhoon_track_data").find("tr").removeClass("TFselected");
				$(this).addClass("TFselected");

				var featureId = $(this).find("td").html(); // 日期
				var typhoonObject = self._typhoonObject;
				// 可点击
				if (typhoonObject.enableNodeClick
						&& typhoonObject.realNodesLayer) {
					var feature = typhoonObject.realNodesLayer.getSource()
							.getFeatureById(featureId);
					typhoonObject.realNodesLayer.select(feature);
				}
			});
}

/**
 * @description 初始化年份
 * @private
 */
bxmap.TyphoonListDialog.prototype._initYearSelect = function() {
	var time = new Date();
	var firstDate = 1945;// 1945年以后所有台风
	var curr = time.getFullYear();
	var now = curr;
	var html = '';
	while (now >= firstDate) {
		// html+='<option value="'+now+'">'+now+'</option>';
		html += '<option style="color:#000;" value="' + now + '">' + now
				+ '</option>';
		now--;
	}
	$("#year_select").html(html);

	// 当前年份
	this.selectedYear = curr + "";
}

/**
 * @description 生成台风列表html
 * @param list
 * @private
 */
bxmap.TyphoonListDialog.prototype._createTFListHtml = function(list) {
	var html = '<tr><td colspan="4">暂无台风数据</td></tr>';
	if (list) {
		if (list.length)
			html = '';
		for (var i = 0; i < list.length; i++) {
			var tfdata = list[i];
			html += '<tr>';
			html += ' <td><input type="checkbox" name="TF" tfbh="'
					+ tfdata.TFBH + '" style="cursor: pointer;" /></td>';
			html += ' <td>' + tfdata.TFBH + '</td>';
			html += ' <td>' + tfdata.TFM + '</td>';
			html += ' <td>' + tfdata.TFME + '</td>';
			html += '</tr>';
		}
	}

	$("#typhoon_table_body tbody").html(html);
	$("#typhoon_table_body_div").mCustomScrollbar({
		theme : "minimal-dark"
	});
}

/**
 * @description 生成台风详情html
 * @param path
 * @private
 */
bxmap.TyphoonListDialog.prototype._createTFPathDetail = function(path) {
	// title
	var node = path[0];// 实际路径
	var tfm = node.TFM;
	var tfbh = node.TFBH;
	var title = tfm + '(' + tfbh + ')路径信息';
	$("#typhoonText").html(title);

	// 详情
	var html = '';
	for (var i = 0; i < path.length; i++) {
		var record = path[i];
		html += '<tr><td>' + record.RQSJ + '</td><td>' + record.ZXFS
				+ '</td><td style="width:70px">'
				+ bxmap.Typhoon.getTyphoonLevel(record.ZXFS) + '</td><td >'
				+ record.YDFX + '</td></tr>';
	}
	$("#typhoon_track_table_body tbody").html(html);
	$("#typhoon_track_table_div").mCustomScrollbar({
		theme : "minimal-dark"
	});
}