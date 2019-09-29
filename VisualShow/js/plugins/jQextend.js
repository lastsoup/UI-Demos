	/*
	 * @descript jquery 全局方法扩展  
	 * 
	 * 
	 * */
	function jQextend(cd){
		/*
		 * @description 添加Jquery全局方法 
		 * */
		cd.extend({
			/*
			 * @description 添加Jquery全局方法  将对象转化为css字符串并写入head
			 * @param data 需转化的对象  
			 * 		  exp:{
			 *				".wrap":{
			 *					"width":"500px",
			 *					"height":"200px",
			 *					"white-space":"nowrap"
			 *				},
			 *				".content":{
			 *					"width":"500px",
			 *					"height":"200px",
			 *					"white-space":"nowrap"
			 *				}
			 *			}
			 *@param classRoot 用于加在选择器前的class  exp: 'root'
			 * */
			"writeStyle":function(data,classRoot){
				// 将data转化为string html style格式
				if($.isEmptyObject(data)){
					return;
				};
				var styleStr = '',index = 0,firstKey = '',firstKeyLen = 0;
				for(key in data){
					var detailData = data[key];
					var classPre = '.' + classRoot;
					if(index === 0){
						firstKey = key;
						firstKeyLen = firstKey.length;
					}else{
						var subStr = key.slice(0,firstKeyLen+1);
						if(subStr !== firstKey+':' && subStr !== firstKey+'.' && subStr !== firstKey+' '){
							classPre += ' ';
						}
					};
					styleStr += classPre + key + JSON.stringify(detailData).replace('{','{\n    ').replace('}','\n}').replace(/,/g,';\n    ').replace(/"/g,'').replace(/'/g,'');
					styleStr += '\n';
					index++;
				};
				// 写入head 入
				var doc = window.document;
				var style = doc.createElement("style");
				style.className = 'style' + classRoot;
				style.type = "text/css";
				try{
					style.appendChild(doc.createTextNode(styleStr));
				
				}catch(ex){
					style.styleSheet.cssText = styleStr//针对IE
				}
				var head = window.document.getElementsByTagName("head")[0];
				head.appendChild(style);
			},
			/*
			 * @description 动态创建id
			 * @return 字符串  16为uid
			 * */
			"getUID":function(){
				var s = [];
			    var hexDigits = "0123456789abcdef";
			    for (var i = 0; i < 36; i++) {
			        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			    }
			    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
			    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
			    s[8] = s[13] = s[18] = s[23] = "-";
			    s.length = 8;
			    var uuid = s.join("");
			    return uuid;
			}
		})
	}
jQextend($);