/*---------------------------
title：界面调用通用库
author：cqy
datetime：2019-09-24
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

    //菜单模块
    _MENU = function (opts) {
        this.gis = opts.gis;
        this.dt = opts.dt;
        this.init();
    }

    _MENU.prototype = {
        init: function () {
            this.initMenu();
            this.initEffect();
        },
        initMenu:function(){
            //地图设置菜单下拉隐藏和显示
            $("#btn-menu li").on("click", function (e) {
                $(".morewrap").hide();
                $("#btn-menu li").removeClass("on");
                $(this).addClass("on");
            });
            
            
            $(".liBtn .more").on("click", function (e) {
                e = e || window.event;
                if(e.stopPropagation) { //W3C阻止冒泡方法
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true; //IE阻止冒泡方法
                }
                $("#btn-menu li").removeClass("on");
                $(".morewrap").show();
            })
        },
        initEffect: function () {
            var _this = this;
            //筛选区域隐藏和显示
            $(".btn-drop").on("click",function(){
                if ($(".filter-area").hasClass("up")) {
                   $(".filter-area").removeClass("up");
                }else{
                   $(".filter-area").addClass("up");
                }
            });
            //右区域隐藏和显示
            $("#btn-expend").on("click", function () {
                if ($("#main-area").hasClass("big")) {
                    $("#main-area").removeClass("big");
                    //$(".right-area").show();
                    setTimeout(function () {
                        $("#content-left").width("50%");
                        _this.gis.map.Oc();
                    }, 500);
                } else {
                    $("#main-area").addClass("big");
                    $("#content-left").width("100%");
                    _this.gis.map.Oc();
                    //动画结束后处理
                    // setTimeout(function () {
                    //     $(".right-area").hide();
                    // }, 300); //500和big动画时间相同 
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
    GISCON.menu = _MENU;
    GISCON.dt = _DATATABLE;

}());