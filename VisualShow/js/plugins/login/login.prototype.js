/*
 * @author jz0202
 * @description ui组件
 * @note  依赖jquery
 * */

;(function(){
	var UITemplate = function(opts){
		this.options = $.extend(true,{},this.getDefaultConfig(),opts);
		this.uuid = $.getUID();
		this.str = '';  // 返回html的字符串形式
		this.dom = null; // 返回html的jquery对象形式
		this.uiRoot = "uiRoot" + this.uuid; // 用于绑定样式的class
		// 用于组件根元素的基本class名称
		this.RootClassBase = this.uiRoot + ' ' + this.options.config.templateName + ' RUOUIROOT '; 
		this.init();
	}
	
	/*
	 * @description 方法主入口
	 * 
	 * */
	UITemplate.prototype.init = function(){
		// 初始化dom结构 
		var result = this.templateDom();
		if(typeof result  === 'string'){
			this.str = result;
			this.dom = $(this.str);
		}else if(typeof result === 'object'){
			this.dom = result;
			this.str = this.dom[0].outerHTML;
		};
		//组件入文档树
		if(typeof this.options.config.target === 'object'){
			this.options.config.target[this.options.config.appendType](this.dom);
		}else{
			if(this.options.config.target !== ''){ // 目标容器存在时添加否则不添加
				$(this.options.config.target)[this.options.config.appendType](this.dom);
			};
		}
		
		// 获取css样式并写入页面
		this.curSkin = $.extend(true,this.templateStyle(),this.options.config.skinDefine);
		$.writeStyle(this.curSkin,this.uiRoot);
		
		// 组件内元素默认事件注册
		this.templateEvents();
		//this.helpMe();
		this.problemBtn();
		this.selfBtn();
		// 自定义事件注册
		this.defineEvents(this.options.config.event);
		//消息闪烁事件
		if(this.options.config.msg){
			this.flickerEvent();
		}
		//数据绑定
		this.bindItem();
		// 回调函数
		this.options.config.success(this);
	}
	
	/*
	 *@description 默认配置项 
	 * */
	UITemplate.prototype.getDefaultConfig = function(){
		return {
			config:{ //配置层
				templateName:'', // 组件示例化后的唯一标识，作为根元素的class名之一
				skin:0, // 使用哪一套样式
				skinDefine:{},
				target:'',// 添加dom的目标元素选择器，为空时不进行操作
				status:true,//登录状态   true已登录
				msg:false,//是否有新消息
				startTime:false,//是否开启定时器
				appendType:'append', // 添加方式，对应jq dom 操作方法，默认为append
				event:{
				},
				imgBaseUrl:Ruo.imgBaseUrl,
				success:function(obj){}
			},
			data:null/*{
				admin:'徐洪强'
			} */// 数据层
		};
	}
	
/****template*****************************************************************************************/	
	
	/*
	 * @description 定义dom基本结构
	 * @note 原则上组件所有元素均在一个元素下  组件根元素的class名称中须拼上 this.RootClassBase
	 * @note 原则上每个元素上须有class 
	 * @note 原则上html的拼接使用数组方式并返回 
	 * @note 代码中注释部分即为封装时自定义部分 ,开发时请将无关注释删除
	 * */
	UITemplate.prototype.templateDom =function(){
		var that = this;
		var dom = ['<div class="', this.RootClassBase ,' itemBox">', 
		           //反馈按钮
					  (function(){
							  var node = [
							              '<div class="feedbackBtn" title="反馈">',
							              '</div>',
							              ].join('');
							  return node;
					  })(),
//		           //帮助按钮
//					  (function(){
//							  var node = [
//							              '<div class="helpBtn" title="帮助">',
//							              '</div>',
//							              ].join('');
//							  return node;
//					  })(),
//					  //信息按钮
					  (function(){
							  var node = [
							              '<div class="layui-layer-selfBtn selfBtn" title="产品信息">',
							              '</div>',
							              ].join('');
							  return node;
					  })(),
//					//通知按钮
//					  (function(){
//							  var node = [
//							              '<div class="postBtn" title="消息">',
//							              (function(){
//							              		if(that.options.config.msg){
//							              			var dom = '<div class="redPoint noPoint"></div>';
//							              			return dom;
//							              		}
//							              	})(),
//							              '</div>',
//							              ].join('');
//							  return node;
//					  })(),
					  (function(){
						  //登录按钮
							  var node = [
							              '<div class="loginBtn">',
						              		(function(){
						              			if(that.options.config.status){
						              				var node = ['<span class="loginPic">',
						              				            '</span>',
						              				            '<span class="spanText">',
						              				          that.options.data.admin,
						              				          '</span>',
						              				            ].join('');
						              				return node;
						              				
						              			}else{
						              				return "<span class='loginPic'></span>"
						              			}
						              		})(),
							              '</div>',
							              ].join('');
							  return node;
			
					  })(),
					  //退出按钮
					/*  (function(){
						  if(that.options.config.status){
							  var node = [
							              '<div class="exitBtn">',
							              '</div>',
							              ].join('');
							  return node;
						  }
						  
					  })(),*/
					//关闭按钮
					  (function(){
						  var node = [
						              '<div class="closeBtn" title="关闭">',
						              '</div>',
						              ].join('');
						  return node;
						  
					  })(),
		           
		           
				  '</div>'].join('');
		return dom;
	}
	
	/*
	 * @description 定义事件
	 *  * @note 代码中注释部分即为封装时自定义部分 ,开发时请将无关注释删除
	 * */
	UITemplate.prototype.templateEvents = function(_isOff){
		var that = this;
		var isOff = _isOff === true?true:false;
		var userData = that.options.data.userData
		var eventData = {
				/*'.exitBtn':{  
					'click':function(e,ele,datathat){
						that.exitHandle(e,ele,data)
					}
				}*/
				'.spanText':{
					'click':function(e,el){
						if (!$.isEmptyObject(userData) && $.trim(userData["result"]).toLowerCase() == "success") {
							e.stopPropagation();
							if(that.options.data.initUserBox){
								window.top.$("#loginBox").slideToggle();
							}else{
								top.topServerFns.serverLoginEvent(userData.data.data,that.options.data.baseData);
								that.options.data.initUserBox = true;
							}
						}
					}
				},
				'.closeBtn':{
					'click':function(e,ele,data,that){
						 if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") !=-1) {
						        top.location.href="about:blank";
						        top.close();
						    } else {
						        top.opener = null;
						        top.open("", "_self");
						        top.close();
						    }
					}
				}
		};
		this.defineEvents(eventData,isOff);
	}
	//消息闪烁
	UITemplate.prototype.flickerEvent = function(){
		var that = this;
		setTimeout(function(){
			var _time = that.options.config.startTime;
			if(!_time){
				return;
			}
			var opacity = that.dom.find(".noPoint").css("opacity");
			var endopacity = opacity == 0.1 ? 1 : 0.1;
			that.dom.find(".noPoint").animate({
				"opacity":endopacity
			},100,function(){
				that.flickerEvent();
			});
		},250)
	}
	//关闭消息闪烁
	UITemplate.prototype.closeFlickerEvent = function(){
		this.options.config.startTime = false;
		this.dom.find(".noPoint").removeClass("redPoint");
	}
	
	//产品信息
	UITemplate.prototype.selfBtn = function(){
		$('.selfBtn').off('click').on('click',function(){
			$.ajax({
				url:'../getService/getProInforCard',
				type:'post',
				data:{
					objectId:'/gridgeoInfo/index.html'
				},
				success:function(msg){
					console.log(msg);
					var data = msg.data.data;
					var clientX = $(".userName")[0].offsetLeft-210;
					//clientX = clientX+880+"px";
					data = $.extend(true,{},data,{offset:["40px",clientX+"px"]});
					var dataStr = JSON.stringify({
						type:'renderCard',
						data:data
					});
					window.top.postMessage(dataStr,"*");
					
				}
			})
		})
	}
	//问题反馈
	UITemplate.prototype.problemBtn = function(){
		var that = this;
		$(".feedbackBtn").unbind("click").bind("click", function() {
				$.ajax({
					url : "../DubboFeedback/getFeedbackUrl",
					type : "post",
					success : function(feedBackData) {
						if (null != feedBackData && "object" == typeof (feedBackData)) {
							if (feedBackData.STATUS.toLowerCase() == "fail") {
								alert(feedBackData.MSG);
							} else {
								var value = that.options.data;
								var appID = '99010001122003'; 
								var userId = value.userData.data.data.ext||'' ;
								var modelName = "电网地理信息导航";
								var dataId = "";
								var dataName = "";
								var serverUrl = feedBackData.DATA;
								if(feedBackData.DATA!=undefined){
	            					//对action进行替换（目前服务仍返回的旧版反馈请求，手动替换为新版）
		            				if(feedBackData.DATA.indexOf("getFunctionUrl.action")){
		            					feedBackData.DATA = feedBackData.DATA.replace("getFunctionUrl.action", "getUrlStr.action")
		            					$.post(feedBackData.DATA, function(data){
		            	                	if(!data){
		            	                		
		            	                	}else{
		            	                		serverUrl=data;//返回意见反馈地址
		            	                		
		            	                		top.openFeedBack(appID,userId,modelName,dataId,dataName,serverUrl);
		            	                	}
		            					})
		            				}
								}
								
							}
						} else {
							alert("调用服务异常，请联系管理员");
						}
					}
				});	
		});
	}
	
	//帮助按钮
	UITemplate.prototype.helpMe = function(){
		return;
		var showHelp_uischema = "CF413B2C-069B-4DE2-8229-EB6AFA3C5954,CF413B2C-069B-4DE2-8229-EB6AFA3C5965,E715296B-896A-4968-BAE9-899DE934AD09";
		// 帮助服务
		$(".helpBtn").show().click(function(e) {
			
			var appId = "990100010105001";
			$.ajax({
				url : "/QueryStatistics/tinyapps/modeSubstation/queryHelp",
				type : "POST",
				data : {
					"appId" : appId
				},
				success : function(res) {
					if (res) {
						var msg = $.parseJSON(res);
						if (msg.STATUS == "success") {
							var data = msg.DATA;
							var height = parseInt(data.HEIGHT) + 30;
							var width = parseInt(data.WIDTH) + 10;
							var openUrl = data.URL;
							var card_id = "grid_9999";
							var title = "帮助";
							var winTop = window.top.window;
							var _offsectLeft = ($(winTop).width() - width) / 2; // 下移量
							var _offsectTop = ($(winTop).height() - height) / 2; // 上移量
							cachePageData("0", _offsectLeft, _offsectTop); // 缓存数据
							openDialog(height, width, openUrl, card_id, title);
						} else {
							alert("获取帮助信息失败:" + msg.MSG);
						}
					} else {
						alert("获取帮助服务失败!");
					}
				},
				error : function(res) {
					alert("获取帮助服务失败!");
				}
			});
		});
	}
	//数据绑定
	UITemplate.prototype.bindItem = function(){
		this.dom.data("dataDom",this.options.data);
	}
	//元素更新
	UITemplate.prototype.mergerDom = function(data,status){
		data = {
				admin:'徐洪强1'
		};		
		this.options.data = data;
		this.options.config.status = status;
		this.dom.find(".loginBtn").empty();
		this.dom.find(".exitBtn").remove();
		if(that.options.config.status){
			var node = ['<span class="spanText">',
			          that.options.data.admin,
			          '</span>',
			            ].join('');
			this.dom.find(".loginBtn").append(node);
		};
		if(that.options.config.status){
			  var elem = [
			              '<div class="exitBtn">',
			              '</div>',
			              ].join('');
			  this.dom.find(".itemBox").append(elem);
		}
		
	}
	
	/*
	 * @description 定义css样式  数组的每一项即为一套样式 用于扩展dom的不同样式版本，
	 * 				通过使用时不同的
	 * @note 使用引号,skin[index][0]的key值为首元素
	 * @note skin的键名按照   sink + 数字方式定义，须遵守
	 * @note 代码中注释部分即为封装时自定义部分 ,开发时请将无关注释删除
	 * */
	UITemplate.prototype.templateStyle = function(){
		if(this.options.config.status){
			var curWidth = "auto"
		}else{
			var curWidth = "24px"
		}
		
		var skin = {
				// 样式皮肤一
				skin0:{
					'.itemBox':{
						'overflow':'hidden',
						'height':'24px'
					},
					'.loginPic':{
						'background-repeat':'no-repeat',
						'background-position':'0px center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/loginUser2.png)',
						'width':'24px',
						'height':'24px',
						'position':'absolute',
						'left':'0'
					},
					'.loginPic.active':{
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/admin.png)',
					},
					'.loginBtn':{
						'min-width':'24px',
						'height':'24px',
						'line-height':'24px',
						'text-indent':'29px',
						'float':'left',
						'cursor':'pointer',
						'width':curWidth,
						'margin-left':'10px',
					    'position': 'relative'
					},
					'.loginBtn:hover':{
						'opacity':0.7,
					},
					'.spanText':{
						'font-size':'12px',
						'color':'#434343',
						'border-right':'1px solid #c5c5c5',
						//'display':'inline-block',
						'height':'18px',
						'line-height':'18px',
						'padding-right':'10px',
						
					},
					'.exitBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'float':'left',
						'margin-left':'12px',
						'cursor':'pointer',
						'background-repeat':'no-repeat',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/exit.png)'
					},
					'.exitBtn:hover':{
						'opacity':0.7,
					},

					'.closeBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'cursor':'pointer',
						'float':'left',
						'margin-left':'10px',
						'background-repeat':'repeat-x',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/close.png)'
					},
					'.closeBtn:hover':{
						'opacity':0.7,
					},
					'.feedbackBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'cursor':'pointer',
						'float':'left',
						'margin-left':'10px',
						'background-repeat':'repeat-x',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/feedbackBtn.png)'
					},
					'.feedbackBtn:hover':{
						'opacity':0.7,
					},
					'.helpBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'cursor':'pointer',
						'float':'left',
						'margin-left':'10px',
						'background-repeat':'repeat-x',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/helpBtn.png)'
					},
					'.helpBtn:hover':{
						'opacity':0.7,
					},
					'.layui-layer-selfBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'cursor':'pointer',
						'float':'left',
						'margin-left':'10px',
						'background-repeat':'repeat-x',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/itemInfo.png)'
					},
					'.layui-layer-selfBtn:hover':{
						'opacity':0.7,
					},
					'.postBtn':{
						'width':'24px',
						'height':'24px',
						'line-height':'24px',
						'cursor':'pointer',
						'float':'left',
						'position':'relative',
						'margin-left':'10px',
						'background-repeat':'repeat-x',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/postBtn.png)'
					},
					'.postBtn:hover':{
						'opacity':0.7,
					},
					'.redPoint':{
						'background-repeat':'no-repeat',
						'background-position':'center center',
						'background-image':'url('+ this.options.config.imgBaseUrl +'login/images/point.png)'
					},
					'.noPoint':{
						'width':'8px',
						'height':'8px',
						'position':'absolute',
						'right':'0',
						'top':'0'
					}
				},
				// 样式皮肤二
				skin1:{
					
				}
			};
		return skin['skin'+this.options.config.skin];
	}
	
	
	/**工具方法*****************************************************************************************/
	
	/*
	 * @description 事件注册公用函数
	 * @param  eventData  事件选择器与事件函数数据
	 * */
	UITemplate.prototype.defineEvents =function(eventData,isOff){
		var that = this;
		//确认绑定或卸载事件
		var type = isOff === true?'off':'on';
		
		// 去除无效数据
		for(var key in eventData){
			if($.isEmptyObject(eventData[key])){
				delete eventData[key]
			}
		};
		if(!$.isEmptyObject(eventData)){
			for(var key in eventData){
				(function(key,eventData){
					var curEvents = eventData[key];
					var eventSelector = '';
					if(that.dom.hasClass(key.replace('.',''))){//为组件根元素
						eventSelector = '.' + that.eventRoot;
						(function(eventSelector,curEvents){
							for(var curKey in curEvents){
								if(type === 'off'){
									that.dom[type](curKey,'');
								}else{
									that.dom[type](curKey,'',function(e){
										var ele = $(this);
										curEvents[curKey](e,ele,that.options.data,that);
									})
								};
							}
						})(eventSelector,curEvents);
						
					}else{
						for(var curKey in curEvents){
							(function(curKey,curEvents){
								if(type === 'off'){
									that.dom[type](curKey,key);
								}else{
									that.dom[type](curKey,key,function(e){
										var ele = $(this);
										var target = $(e.target);
										if(!target.hasClass('RUOUIROOT') && target.parents('.RUOUIROOT').eq(0).hasClass(that.uiRoot)){
											curEvents[curKey](e,ele,that.options.data,that);
										}
									});
								};
							})(curKey,curEvents);
						}
					};
				})(key,eventData);
			}
		}
	}
	
	/*
	 * @description 组件注销
	 * */
	UITemplate.prototype.destory = function(){
		// 元素移除
		this.dom.remove();
		// 事件移除
		this.templateEvents(true);
		this.defineEvents(this.options.config.event,true);
		// 移除样式
		$('.style' + this.uiRoot).remove();
	}
	
	/*******************************************************************************************/

	/*
	 * @description 将UITemplate赋值给Ruo.iconText
	 * */
	window.login = UITemplate;
})();