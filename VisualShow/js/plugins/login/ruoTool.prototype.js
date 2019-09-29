;(function($,window,document,undefined){
	
	var RUO = function(){
		this.version = '1.0.1';
		this.description = '提供公用方法集';
	};
	
	RUO.prototype.tips = {
			getHrefSearchObject:'获取window.location.href中的search中字符串，并将其转换为键值对的对象，暂默认以&分割'
	}
	
	/*
	 * 
	 * */
	RUO.prototype.getHrefSearchObject = function(_href){
		var href = _href?_href:decodeURIComponent(window.location.href);
		//解决参数中存在IP地址的情况，注意参数值中存在IP时暂不支持此IP中使用相同的连接符 如 ip='qq.jsp?name=(此处应用其他标识符)'22''
		//即参数中的ip不能再附加参数；
		var searchStr = (href.indexOf("?")!=-1)?href.substring(href.indexOf("?")+1,href.length):"";
		var searchArr = searchStr.split('&');
		var searchArrLen = searchArr.length;
		var searchObj = {};
		for(var i=0; i<searchArrLen; i++){
			if(searchArr[i].indexOf('=')!=-1){//优先匹配= 
				var item = searchArr[i].split('=');
				searchObj[item[0]] = item[1];
			}else if(searchArr[i].indexOf(':')!=-1){//匹配:时可能出现参数值有地址的情况 如（ip='http://...'）
				var item = searchArr[i].split(':');
				searchObj[item[0]] = item[1];
			}
		};
		return searchObj;
	}
	
	RUO.prototype.toggleLoading = function(isShow,target,txt){
		if(isShow){
			var loadingString = this.getNormalLoadingDom(txt);
			target.append(loadingString);
		}else{
			$('.renderLoading').remove();
		}
	}
	
	RUO.prototype.getNormalLoadingDom = function(txt){
		if(!txt){
			txt='加载中,请稍后...';
		}
		var wrapstyle = 'style=\"width: 100%; top: 0; height: 100%; background-color: #fff; opacity: 0.5; filter: alpha(opacity = 50); z-index: 1000000000;position:absolute;\"';
		var contentStyle = 'style=\"width: 100%; height: 30px; top: 60%; margin-top: -15px; color: #333; font-size: 14px; text-align: center; line-height: 30px; letter-spacing: 1px; z-index: 1000000001;position:absolute;\"';
		var domStr = '<div class="renderLoading loading-wrap" '+ wrapstyle +'></div>'+
	    			 '<div class="renderLoading loading-content" '+ contentStyle +'><img src="/QueryStatistics/library/controls/ruoTool/images/loading.gif" style="display: inline-block;vertical-align: middle;padding-right: 15px;width:70px;">'+txt+'</div>';
		return domStr;
	}
	
	window.Ruo = RUO;
	
})(jQuery, window, document)