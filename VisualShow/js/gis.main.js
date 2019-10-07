/*---------------------------
title：界面调用通用库
author：cqy
datetime：2019-09-24
;(function($,undefined) {})(window.jQuery);
 ----------------------------*/
(function () {

    /*----GISCON扩展方法 主文件：gis.con.js------*/
    //界面通用方法
    //登录模块
    _LOGIN = function () {
        this.url = GISCON.CONST.server1 + "mianpage/queryUserInfoAfterSSOLogin";
        //this.url = "http://127.0.0.1:8209/mianpage/queryUserInfoAfterSSOLogin";
        this.init();
    }


    _LOGIN.prototype = {
        init: function () {
            var _this = this;
            var userData, pg_id, admin;
            GISCON.ajaxHandler(this.url, {}).done(function (data) {
                userData = data.data;
                if (data.result === "failed") {
                    admin = '匿名用户'
                } else {
                    admin = userData.fullName;
                    pg_id = userData.pg_id;
                }

                _this.login({
                    admin: admin,
                    rankId: '',
                    userId: userData.ext,
                    modelName: '',
                    userData: userData,
                    //baseData:getUserData(),
                    initUserBox: false
                });
            });
        },
        login: function (data) {
            //实例化右上角用户信息
            new login({
                config: {
                    target: '.userName',
                    imgBaseUrl: 'js/plugins/',
                    skinDefine: {
                        '.itemBox': {
                            'display': 'flex'
                        },
                        '.spanText': {
                            'border-right': 'none',
                            'padding-right': '0'
                        }
                    },
                    event: {}
                },
                data: data
            })
        }
    }

    _MENU = function (opts) {
        this.init();
    }

    _MENU.prototype = {
        init:function(){
            //加载菜单
            $(".headLeft").remove();
            var menudom=this.initDom(this.loadDom);
            $(".head").append(menudom);
            //加载更多设置
            $(".morewrap").remove();
            this.initMore(menudom);
            this.initMenu();
        },
        initMore:function(dom){
            var li=$(dom).find(".iconCon");
            li.find(".liBtn").remove();
            var moredom='<div class="morewrap"><div class="title">更多设置<span class="reload"></span></div><div class="moreSetUp">'+
            '</div><div class="setBtn"><span class="confirm">确定</span><span class="cancel">取消</span></div></div>';
            $(".head").append(moredom);
            $(".moreSetUp").append(li);
        },
        initDom:function(func){
            return func.toString().match(/\/\*\s([\s\S]*)\s\*\//)[1];
        },
        loadDom:function(){
            /*
            		<div class='headLeft'>
			<ul id="btn-menu">
				<li class='icon fa now'>
					<i></i>
					<div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>发电</span>
							<span class='noSelect'>全不选</span>
							<span class='selectAll'>全选</span>
						</div>
						<div class='faDiv menu-icon'>
							<span column='fahd' code='1001' plant='planthd' type='火电'>火电厂</span>
							<span column='fasd' code='1002' plant='plantsd' type='水电'>水电厂</span>
							<span column='fafd' code='1004' plant='plantfd' type='风电'>风电场</span>
							<span column='fagf' code='1005' plant='plantgf' type='光伏'>光伏电站</span>
							<span column='fahed' code='1003' plant='planthed' type='核电'>核电厂</span>
							<span column='facx' code='1006' plant='plantcx' type='抽蓄'>抽蓄电站</span>
						</div>
						<div class='liBtn'>
							<span class='more'>更多设置<em>>></em></span>
							<span class='confirm'>确定</span>
							<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
				<li class='icon sd now'>
					<i></i>
                    <div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>输电</span>
							<span class='noSelect'>全不选</span>
							<span class='selectAll'>全选</span>
						</div>
						<div class="shuDiv menu-icon">
							<span column='jlxlgy' code='acline' type='acline' id='acline'>交流线路</span>
							<span column='zlxlgy' code='dcline' type='dcline' id='dcline'>直流线路</span>
						</div>
						<div class='liBtn'>
							<span class='more'>更多设置<em>>></em></span>
							<span class='confirm'>确定</span>
							<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
				<li class='icon bd now sp'>
					<i></i>
					<div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>变电</span>
							<span class='noSelect'>全不选</span>
							<span class='selectAll'>全选</span>
						</div>
						<div class="bianDiv menu-icon">
							<span code='2001' column='bdbd' name='substation'>变电站</span>
							<span code='3001' column='bdhl' name='conversub' id="conversub">换流站</span>
							<span code='2002' column='kgz' name='kgz'>开关站</span>
							<span code='2003' column='qyz' name='qyz'>牵引站</span>
						</div>
						<div class='liBtn'>
							<span class='more'>更多设置<em>>></em></span>
							<span class='confirm'>确定</span>
							<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
				<li class='icon dy half'>
					<i></i>
					<div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>交流电压等级</span>
							<span class='noSelect'>全不选</span>
							<span class='selectAll'>全选</span>
							<span class="lock"></span>
						</div>
						<div class="dyDiv menu-icon">
							<span top='5' column="dianyagy" text="1000kV">1000kV</span>
							<span top='5' column="dianyagy" text="750kV">750kV</span>
							<span top='8' column="dianyagy" text="500kV">500kV</span>
							<span top='10' column="dianyagy" text="330kV">330kV</span>
							<span top='10' column="dianyagy" text="220kV">220kV</span>
							<span top='12' column="dianyagy" text="110kV">110kV</span>
							<span top='14' column="dianyagy" text="66kV">66kV</span>
							<span top='14' column="dianyagy" text="60kV">60kV</span>
							<span top='14' column="dianyagy" text="35kV">35kV</span>
							<span top='14' column="dianyagy" text="30kV">
								<35kV</span> </div> <div class='liBtn'>
									<span class='more'>更多设置<em>>></em></span>
									<span class='confirm'>确定</span>
									<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
				<li class='icon zfdy half sp'>
					<i></i>
					<div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>直流电压等级</span>
							<span class='noSelect'>全不选</span>
							<span class='selectAll'>全选</span>
							<span class="lock"></span>
						</div>
						<div class="zfdyDiv menu-icon">
							<span top='5' column="dianyagy" text="±1100kV">±1100kV</span>
							<span top='5' column="dianyagy" text="±1000kV">±1000kV</span>
							<span top='5' column="dianyagy" text="±800kV">±800kV</span>
							<span top='5' column="dianyagy" text="±660kV">±660kV</span>
							<span top='8' column="dianyagy" text="±500kV">±500kV</span>
							<span top='10' column="dianyagy" text="±420kV">±420kV</span>
							<span top='10' column="dianyagy" text="±400kV">±400kV</span>
							<span top='10' column="dianyagy" text="±200kV">±200kV</span>
							<span top='12' column="dianyagy" text="±167kV">±167kV</span>
							<span top='12' column="dianyagy" text="±125kV">±125kV</span>
							<span top='12' column="dianyagy" text="±120kV">±120kV</span>
							<span top='14' column="dianyagy" text="±110kV">
								±120kV</span> </div>
						<div class='liBtn'>
							<span class='more'>更多设置<em>>></em></span>
							<span class='confirm'>确定</span>
							<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
				<li class='icon wdzt'>
					<i></i>
					<div class='iconCon'>
						<div class='conTop'>
							<span class='conTopLeft'>其他设置</span>
						</div>
						<div class="showName shezhi wdztItem">
							<div class="sztitle">显示设置</div>
							<!-- <div class='szicon now czmc' type="czmc"></div>
							<div class='szss'>厂站名称</div>
							<div class='szicon now gt' type="gt"></div>
							<div class='szss'>杆塔</div> -->
							<p>
								<input id="czmc" class="magic-checkbox" type="checkbox">
								<label for="czmc">厂站名称</label>
								<input id="gt" class="magic-checkbox" type="checkbox">
								<label for="gt">杆塔</label>
							</p>
						</div>
						<div class='szyxzt wdztItem'>
							<div class='sztitle'>运行状态</div>
							<p>
								<input id="gh" class="magic-checkbox" type="checkbox" checked>
								<label for="gh">规划</label>
								<input id="zj" class="magic-checkbox" type="checkbox" checked>
								<label for="zj">在建</label>
								<input id="yx" class="magic-checkbox" type="checkbox" checked>
								<label for="yx">运行</label>
								<input id="ty" class="magic-checkbox" type="checkbox">
								<label for="ty">退运</label>
							</p>
							<!-- <div class='szicon' code='1001' type="gh"></div>
							<div class='szss'>规划</div>
							<div class='szicon' code='1002' type="zj"></div>
							<div class='szss'>在建</div>
							<div class='szicon' code='1003' type="yx"></div>
							<div class='szss'>运行</div>
							<div class='szicon now' code='1004,1006' type="ty"></div>
							<div class='szss'>退运</div> -->
						</div>
						<!-- <div class='shezhi wdztItem'>
								 <div class='sztitle'>地图设置</div>
								 <div class='szcirle pm' type="pm"></div>
								 <div class='szss'>平面图</div>
								 <div class='szcirle now wx' type="wx"></div>
								 <div class='szss'>卫星图</div>
							 </div> -->

						<div class='shezhi wdztItem'>
							<div class='sztitle'>图标颜色</div>
							<!-- <div id='bhdydj' class='szcirle' type="dydj"></div>
							<div class='szss'>按电压等级</div>
							<div id='bhlxsz' class='szcirle now' type="lxsz"></div>
							<div class='szss'>按类型</div> -->
							<p>
									<input type="radio" id="bhdydj" class="magic-radio" name="szcirle" checked />
									<label for="bhdydj">按电压等级</label>
									<span></span>
									<input type="radio" id="bhlxsz" class="magic-radio" name="szcirle" />
									<label for="bhlxsz">按类型</label>
								</p>
						</div>

						<div class='liBtn'>
							<span class='more'>更多设置<em>>></em></span>
							<span class='confirm'>确定</span>
							<span class='cancel'>取消</span>
						</div>
					</div>
				</li>
			</ul>
			<div class="wblock"></div>
		</div>
             */
        },
        isSon: function (box, target) {
            return $(box).has(target).length > 0;
        },
        initMenu:function(){
            var _this = this;
            //地图设置菜单下拉隐藏和显示
            $("#btn-menu li").on("click", function (e) {
                $(".morewrap").hide();
                $("#btn-menu li").removeClass("on");
                $(this).addClass("on");
            });

            //更多设置
            $(".liBtn .more").on("click", function (e) {
                e = e || window.event;
                if (e.stopPropagation) { //W3C阻止冒泡方法
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true; //IE阻止冒泡方法
                }
                //显示
                $(".morewrap").show();
                //跳转到对应位置
                var index=$("#btn-menu li.on").index();
                var top=[0,120,200,320,520,700]
                $(".moreSetUp").animate({scrollTop: top[index]}, 0);
                $("#btn-menu li.on").removeClass("on");
            });

            //移出隐藏设置窗口
            $(document).mouseup(function (e) {
                var e = e || window.event;
                var target = e.target || e.srcElement;
                if (!_this.isSon("#btn-menu", target)) {
                    $("#btn-menu li").removeClass("on");
                }

                if (!_this.isSon(".morewrap", target)) {
                    $(".morewrap").hide();
                }

            });

            //全选和全不选（图标彩色变灰色）
            $(".iconCon .noSelect").click(function () {
                var p=$(this).parent().next().attr("class").replace(" menu-icon","");
                var span = $("."+p).find("span");
                span.addClass("gray");
            });

            $(".iconCon .selectAll").click(function () {
                var p=$(this).parent().next().attr("class").replace(" menu-icon","");
                var span = $("."+p).find("span");
                span.removeClass("gray");
            });

            //锁定
            //内部锁
            $(".iconCon .lock").click(function(){
                if($(this).hasClass("locked")){
                    $('.lock').removeClass("locked");
                    $('.lock').attr("select","false");
                    $('.bigLocked').hide();
                }else{
                    $('.lock').addClass("locked");
                    $('.lock').attr("select","");
                    $('.bigLocked').show();
                }
            });

            //菜单锁
            $('.wblock').click(function () {
                if ($(this).hasClass("wblocked")) {
                    $('.wblock').removeClass("wblocked");
                    $('.lock').removeClass("locked");
                    $('.lock').attr("select", "false");
                    $('.bigLocked').hide();
                } else {
                    $('.wblock').addClass("wblocked");
                    $('.lock').addClass("locked");
                    $('.lock').attr("select", "");
                    $('.bigLocked').show();
                }
            });

            //大锁点击事件
            $(".bigLocked").click(function () {
                layui.use('layer', function () {
                    var layer = layui.layer;
                    layer.confirm('电压等级已锁定。是否解除此限制？', {
                        offset: '100px',
                        area: '326px',
                        title: '设置',
                        resize: false,
                        btn: ['确定', '取消']
                    }, function (index, layero) {
                        $(".lock").removeClass("locked");
                        $('.wblock').removeClass("wblocked");
                        $(".bigLocked").hide();
                        layer.close(index);
                    })
                });
            });

            //菜单点击事件
            //单击选择图标变灰色
            $(".menu-icon span").click(function(){
                //同步更多设置的图标
                var column = $(this).attr("column");
                var text=$(this).attr("text");
                var p=$(this).parent().attr("class").replace(" menu-icon","");
                var pE=(p=="dyDiv"||p=="zfdyDiv")?$("."+p).find('[text='+text+']'):$("."+p).find('[column='+column+']');
                if($(this).hasClass("gray"))
                   pE.removeClass("gray");
                else
                   pE.addClass("gray");
            });

           //取消按钮
           $(".cancel").click(function(e){
                e = e || window.event;
                if (e.stopPropagation) { //W3C阻止冒泡方法
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true; //IE阻止冒泡方法
                }
              $("#btn-menu li").removeClass("on");
              $(".morewrap").hide();
           });

           //确定按钮
        }
    }

    //页面处理模块
    _PAGE = function (opts) {
        this.gis = opts.gis;
        this.dt = opts.dt;
        this.init();
    }

    _PAGE.prototype = {
        init: function () {
            new _MENU();
            this.initEffect();
        },
        initEffect: function () {
            var _this = this;
            //筛选区域隐藏和显示
            $(".btn-drop").on("click", function () {
                if ($(".filter-area").hasClass("up")) {
                    $(".filter-area").removeClass("up");
                } else {
                    $(".filter-area").addClass("up");
                }
            });
            //右区域隐藏和显示
            $("#btn-expend").on("click", function () {
                if ($("#main-area").hasClass("big")) {
                    $("#main-area").removeClass("big");
                    setTimeout(function () {
                        $("#content-left").width("50%");
                        _this.gis.map.Oc();
                    }, 500);
                } else {
                    $("#main-area").addClass("big");
                    $("#content-left").width("100%");
                    _this.gis.map.Oc();
                }
                // var myEvent = new Event('resize');
                //  window.dispatchEvent(myEvent);
            });

            //地图和单线图切换

            //状态标签页切换
            $("#state-tab li").on("click", function () {

            });
            //窗口缩放
            window.onresize = function () {
                //调整表格高度
                var h = _this.dt.getHeight();
                var ch = h - 80;
                $(".layui-table-view").height(h);
                $(".layui-table-body").height(ch);
            }
        }
    }

    //列表模块
    _DATATABLE = function () {
        this.init();
    }

    _DATATABLE.prototype = {
        init: function () {
            var _this = this;
            _this.initDataTable();
        },
        initDataTable: function () {
            var _this = this;
            layui.use('table', function () {
                _this.table = layui.table;
                var h = _this.getHeight();
                _this.table.render({
                    elem: '#mytable',
                    url: GISCON.CONST.server + 'getData',
                    height: h,
                    cols: [
                        [{
                            field: 'SBLB',
                            title: '序号'
                        }, {
                            field: 'SQTJSJ',
                            title: '检修单编号'
                        }, {
                            field: 'GZNR',
                            title: '状态'
                        }]
                    ],
                    page: true
                });
            });
        },
        getHeight: function () {
            var h = $(".show-table").height();
            return h < 100 ? 100 : h;
        }
    }

    //输出方法
    GISCON.login = _LOGIN;
    GISCON.dt = _DATATABLE;
    GISCON.page = _PAGE;

}());