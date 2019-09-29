/*
 * @author wljz0202
 * @description ui组件
 * @note  依赖jquery
 * */

;(function(){
	var UITemplate = function(opts){
		this.options = $.extend(true,{},this.getDefaultConfig(),opts);
		this.cacheRowNum = this.options.config.rowNum;
		var num=this.options.config.rowNum;
		var event={
			'.btnplay': {
				'click': function (e, ele, data) {
					var len=data.items.length;
					var actice=$(".timeBanner-items .item-top.active");
					var index=actice.parent().index();
					var pastEle=$(".timeBanner-items .item:lt("+index+")");
					pastEle.find(".item-top").addClass("past");
					$(".play-wrap").show();
					if(ele.hasClass("pause")){
						ele.removeClass("pause");
						ele.attr("title","播放");
					}else{
						ele.addClass("pause");
						ele.attr("title","暂停");
					}
					timer=setInterval(function(){
						var actice=$(".timeBanner-items .item-top.active");
						var index=actice.parent().index();
						if(index<(len-1)){
							actice.removeClass("active");
							actice.addClass("past");
						}
						//翻页
						var isnext=index%num==(num-1);
						if(isnext)
						  $(".btn-next").click();
						actice.parent().next().children().click();
					},1000);
				}
			},
			'.btnstop': {
				'click': function (e, ele, data) {
					$(".btnplay").removeClass("pause");
					$(".timeBanner-items .item-top").removeClass("past");
					$(".play-wrap").hide();
					clearInterval(timer);
				}
			}
		};
		this.options.config.event[".btnplay"]=event[".btnplay"];
		this.options.config.event[".btnstop"]=event[".btnstop"];
		
		this.uuid = $.getUID();
		this.str = '';  // 返回html的字符串形式
		this.dom = null; // 返回html的jquery对象形式
		this.uiRoot = "uiRoot" + this.uuid; // 用于绑定样式的class
		this.showall=this.options.config.showAll;
		// 用于组件根元素的基本class名称
		this.RootClassBase = this.options.config.templateName+' '+this.uiRoot  + ' RUOUIROOT '; 
		this.init();
	}
	
	/*
	 * @description 方法主入口
	 * 
	 * */
	UITemplate.prototype.init = function(){
		
		//数据整理
		if(this.showall){
			this.transformItemData();
		}
		
		// 初始化dom结构 
		var result = this.templateDom();
		if(typeof result  === 'string'){
			this.str = result;
			this.dom = $(this.str);
		}else if(typeof result === 'object'){
			this.dom = result;
			this.str = this.dom[0].outerHTML;
		};
		if(this.options.config.target !== ''){ // 目标容器存在时添加否则不添加
			$(this.options.config.target)[this.options.config.appendType](this.dom);
		};
		
		// 获取css样式并写入页面
		this.curSkin = $.extend(true,this.templateStyle(),this.options.config.skinDefine);
		$.writeStyle(this.curSkin,this.uiRoot);
		
		// 组件内元素默认事件注册
		this.templateEvents();
		
		// item 数据绑定
		this.bindItemData();
		
		// 自定义事件注册
		this.defineEvents(this.options.config.event);
		
		// 回调函数
		this.options.config.success(this);
	}
	
	/*
	 *@description 默认配置项 
	 * */
	UITemplate.prototype.getDefaultConfig = function(){
		var timer;
		var defaults= {
			config:{ //配置层
				templateName:'', // 组件示例化后的唯一标识，作为根元素的class名之一
				skin:0, // 使用哪一套样式
				skinDefine:{},
				target:'',// 添加dom的目标元素选择器，为空时不进行操作
				appendType:'append', // 添加方式，对应jq dom 操作方法，默认为append
				rowNum:4,
				success:function(obj){},
				pageChangeTime:500,
				activeItemIndex:0,
				noDataMsg:'暂无关联数据',
				btnBGColor:'#f9f9f9',
				imgBaseUrl:'js/plugins/',
				play:true,
				showAll:false,
				event: {
				}
			},
			data:{
				items:[]
			} // 数据层
		};
		return defaults;
	}
	
	/*
	 * @descript 数据整理
	 * */
	UITemplate.prototype.transformItemData = function(){
		var itemsData = this.options.data.items,
			len = itemsData.length;
		
		if( len > 0 && len < this.options.config.rowNum ){
			this.options.config.rowNum = len;
		};
		
		if(len > 0 && len > this.options.config.rowNum){
			var val = len % this.options.config.rowNum
			if(val > 0){
				val = this.options.config.rowNum - val;
				for(var i=0; i<val; i++){
					this.options.data.items.push({
						text:''
					});
				};
			};
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
		var dataLen = this.options.data.items.length;
		var id=this.options.config.templateID;
		//cqy by2019-09-26
		var playDiv=this.options.config.play?"<div class='playBanner'><i class='btnplay' title='播放'></i><i class='btnstop' title='停止'></i></div>":"";
		var dom = ['<div id="'+id+'" class="', this.RootClassBase ,'timeBanner">', 
		playDiv+'<div class="timeBanner-wrap"><div class="play-wrap"></div>',
					 	'<div class="timeBanner-container">',
					 		'<div class="timeBanner-items">',
				 				dataLen>0?this.renderItems():this.renderNoDataTip(),
					 		'</div>',
					 	'</div>',
					 	'<em class="items-bg bg-circle bg-pre"></em>',
				 		'<em class="items-bg bg-circle bg-next"></em>',
					 	this.renderBtns(), 
					 '</div>',
				  '</div>'].join('');
		return dom;
	}
	
	/*
	 * @description 创建无数据提示
	 * */
	UITemplate.prototype.renderNoDataTip = function(){
		var dom = '<strong class="noDataTip">'+ this.options.config.noDataMsg +'</strong>';
		return dom;
	}
	
	/*
	 * @description 按钮初始化
	 * */
	UITemplate.prototype.renderBtns = function(){
		var data = this.options.data.items;
		var len = data.length;
		var isShowBtn = this.options.config.rowNum<len?true:false;
		if(!isShowBtn){
 			return '';
 		}else{
 			this.preAnimating = false;
			this.nextAnimating = false;
			this.rows = this.options.data.items.length/this.options.config.rowNum;
			this.total=this.options.data.items.length
			this.pages=Math.ceil(this.rows);
 			//console.log(this.rows)
 			this.curPage = 0;
 			var preDom = ['<a class="banner-btn opacity btn-pre btn-pre-unable" ',
				  'href="javascript:;" title="">',
			'</a>'].join('');
 			var nextDom = ['<a class="banner-btn opacity btn-next btn-next-able" ',
				  'href="javascript:;" title="">',
		   '</a>'].join('');
 			return preDom + nextDom;
 		};
	}
	
	/*
	 * @description banner item render
	 * */
	UITemplate.prototype.renderItems = function(){
		var data = this.options.data.items;
		var items=[];
		for(var i=0,len=data.length; i<len; i++){
			var item = ['<div class="item item',i,' bg-circle">',
							'<h5 class="item-top ',(i === this.options.config.activeItemIndex?'active':''),'"><i></i></h5><span class="text">'+data[i].text+'</span>',
							'</h6>',
						'</div>'].join('');
			items.push(item);
		};
		return items.join('');
	}
	
	/*
	 * @description
	 * */
	UITemplate.prototype.bindItemData = function(){
		var data = this.options.data,
			that = this;
		this.dom.find('.item-top').each(function(i){
			var ele = $(this);
			ele.data('domdata',that.options.data.items[i]);
		});
	}
	
	/*
	 * @descript 获取选中项
	 * */
	UITemplate.prototype.getActiveItem = function(){
		var item = this.dom.find('.item-top.active');
		return {
			ele:item,
			data:item.data('domdata')
		}
	}
	
	/*
	 * @description 根据数据重置dom
	 * @param data  数组对象  数据格式与this.options.data保持一致
	 * @note 仅更新html结构，事件不做更新
	 * */
	UITemplate.prototype.mergeDom = function(data){
		this.options.config.rowNum = this.cacheRowNum;
		// 当传入的数据为空数组时以原数据为数据更新
		if(data.length >= 0){
			this.options.data.items = data;
		}
		
		//数据整理
		this.transformItemData();
		
		var dataLen = this.options.data.items.length;
		var itemTarget = this.dom.find('.timeBanner-items'),
			btnTarget = this.dom.find('.timeBanner-wrap'),
			btns = this.dom.find('.banner-btn');
		// 更新items
		itemTarget.html('').append(dataLen>0?this.renderItems():this.renderNoDataTip()); 
		//更新样式
		$('.style' + this.uiRoot).remove();
		this.curSkin = $.extend(true,this.templateStyle(),this.options.config.skinDefine);
		$.writeStyle(this.curSkin,this.uiRoot);
		// 初始化按钮
		btns.remove();
		btnTarget.append(this.renderBtns());
		// item 数据绑定
		this.bindItemData();
	} 
	
	/*
	 * @description 定义事件
	 * */
	UITemplate.prototype.templateEvents = function(_isOff){
		var that = this;
		var isOff = _isOff === true?true:false;
		var eventData = {
				'.btn-next-able':{  
					'click':function(e,ele,data){
						that.nextHandle(e,ele,data)
					}
				},
				'.btn-pre-able':{
					'click':function(e,ele,data){
						that.preHandle(e,ele,data)
					}
				},
				'.item-top':{
					'click':function(e,ele){
						that.itemHandle(e,ele)
					}
				}
		};
		
		this.defineEvents(eventData,isOff);
	}
	
	/*
	 * @description item点击事件函数
	 * */
	UITemplate.prototype.itemHandle = function(e,ele){
		if(!ele.hasClass('active')){
			this.dom.find('.selectedItem').removeClass('selectedItem');
			this.dom.find('.item-top.active').removeClass('active');
			ele.addClass('active');
			ele.parent().addClass('selectedItem');
		}
	}
	
	/*
	 * @description 右进函数
	 * */
	UITemplate.prototype.nextHandle = function(e,ele,data){
		var that = this;
		if(that.nextAnimating){return};
		that.nextAnimating = true;
		var target = this.dom.find('.item0'),
			preDom = this.dom.find('.btn-pre');
		this.curPage++;
		
		if(this.curPage === this.pages-1){
			ele.removeClass('btn-next-able').addClass('btn-next-unable')
		};
		preDom.removeClass('btn-pre-unable').addClass('btn-pre-able');
		// 去除按钮透明度样式
		ele.removeClass('opacity');
		preDom.removeClass('opacity');
		//cqy 2019-09-27
		var moveleft= this.curPage*100;
	    if(!that.showall){
			if(this.curPage === this.pages-1){
				var other=this.total%this.cacheRowNum;
				moveleft=((this.curPage-1)+(1/this.cacheRowNum*other))*100;
			}
		}
		target.animate({
			'margin-left':'-' + moveleft + '%'
		},this.options.config.pageChangeTime,function(){
			// 增加按钮透明度样式
			ele.removeClass('opacity');
			preDom.removeClass('opacity');
			//
			that.nextAnimating = false;
		});
	}
	
	/*
	 * @description 左进函数
	 * */
	UITemplate.prototype.preHandle = function(e,ele,data){
		var that = this;
		if(that.preAnimating){return};
		that.preAnimating = true;
		var target = this.dom.find('.item0'),nextDom = this.dom.find('.btn-next');
		this.curPage--;
		if(this.curPage === 0){
			ele.removeClass('btn-pre-able').addClass('btn-pre-unable')
		};
		nextDom.removeClass('btn-next-unable').addClass('btn-next-able');
		// 去除按钮透明度样式
		ele.removeClass('opacity');
		nextDom.removeClass('opacity');
		//
		target.animate({
			'margin-left': -(this.curPage*100) + '%'
		},this.options.config.pageChangeTime,function(){
			// 添加按钮透明度样式
			ele.addClass('opacity');
			nextDom.addClass('opacity');
			//
			that.preAnimating = false;
		});
	}
	
	/*
	 * @description 定义css样式  数组的每一项即为一套样式 用于扩展dom的不同样式版本，
	 * 				通过使用时不同的
	 * @note 使用引号,skin[index][0]的key值为首元素
	 * @note skin的键名按照   sink + 数字方式定义，须遵守
	 * */
	UITemplate.prototype.templateStyle = function(){
		var baseUrl = this.options.config.imgBaseUrl,
			itemsLen = this.options.data.items.length;
		var skin = {
				// 样式皮肤一
				skin0:{
					'.timeBanner':{
						'width':'100%',
						'padding':'0 10px',
						'box-sizing':'border-box'
					},
					'.timeBanner *':{
						'box-sizing':'border-box'
					},
					'.timeBanner-wrap':{
						'position':'relative',
						'height':'40px'
					},
					'.banner-btn':{
						'display':'block',
						'position':'absolute',
						'top':'0',
						'height':'100%',
						'width':'18px',
						'background-repeat':'no-repeat',
						'background-color':this.options.config.btnBGColor
					},
//					'.opacity':{
//						'opacity':'0.7',
//						'filter':'alpha(opacity = 70)',
//					},
					'.btn-pre':{
						'left':'0px',
						'background-position':'center bottom',
						'background-color':'rgba(86,86,86,0)'
					},
					'.btn-pre-unable':{
						'background-image':'url('+ baseUrl +'timeBanner/images/pre_unable.png)',
						'cursor':'not-allowed'
					},
					'.btn-pre-able':{
						'background-image':'url('+ baseUrl +'timeBanner/images/pre_able.png)'
					},
					'.btn-next':{
						'right':'0',
						'background-position':'center bottom',
						'background-color':'rgba(86,86,86,0)'
					}, 
					'.btn-next-unable':{
						'background-image':'url('+ baseUrl +'timeBanner/images/next_unable.png)',
						'cursor':'not-allowed'
					},
					'.btn-next-able':{
						'background-image':'url('+ baseUrl +'timeBanner/images/next_able.png)'
					},
					'.opacity:hover':{
						'opacity':'1',
						'filter':'alpha(opacity = 100)'
					},
					'.timeBanner-container':{
						'position':'relative',
						'height':'40px',
						'overflow':'hidden'
					},
					'.bg-circle':{
						'background-repeat':'no-repeat',
						'background-position':'center center',
						'background-size':'auto atuo',
						'background-image':'url('+ baseUrl +'timeBanner/images/circle_small.png)'
					},
					'.items-bg':{
						'display':'block',
						'position':'absolute',
						'width':'7px',
						'height':'7px',
						'bottom':'6px'
					},
					'.bg-pre':{
						'left':'0'
					},
					'.bg-next':{
						'right':'0'
					},
					'.timeBanner-items':{
						'position':'absolute',
						'height':'6px',
						'width':'100%',
						'bottom':'6px',
						'white-space':'nowrap',
					    'background-color':'#f0f1f1',
					    'height':'4px'
					},
					'.item':{
						'position':'relative',
						'display':'inline-block',
						'overflow':'hidden',
						'height':'30px',
						'width':100/this.options.config.rowNum+ '%',
						'top':'-24px',
						'background-position':'center bottom'
					},
					'.item-top':{
						'color':'#fff',
						'font-size':'14px',
						'text-align':'center',
						'height':'30px',
						'line-height':'20px',
						'background-repeat':'no-repeat',
						'background-position':'center 18px',
						'background-size':'auto auto',
						'cursor':'pointer',
						'margin':'0'
					},
					'.item-top.active':{
						'background-image':'url('+ baseUrl +'timeBanner/images/bg_time_active.png)'
					},
					'.item-top:hover':{
						'font-size':'16px'
					},
					'.item0':{
						'margin-left':'0'//- ( itemsLen>this.options.config.rowNum?((itemsLen-this.options.config.rowNum)*(100/this.options.config.rowNum) ):0 )+'%'
					},
					'.noDataTip':{
						'display':'block',
						'height':'100%',
						'text-align':'center',
						'font-size':'24px',
						'color':'#e0e0e0',
						'padding-top':'15px'
					}
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
										curEvents[curKey](e,ele,that.options.data);
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
											curEvents[curKey](e,ele,that.options.data);
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
	window.timeBanner = UITemplate;
})();