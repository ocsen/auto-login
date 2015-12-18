$(function() {

    //判断本地是否有登陆信息
    var loginStatus = chrome.extension.getBackgroundPage().articleData;
    console.log(loginStatus);

    //判断本地是否有数据，有读取本地数据渲染，没有，添加data到本地
    var localDate = localStorage.userInfo;

    //判断账号信息
    if (localDate) {
        var userInfo = JSON.parse(localStorage.userInfo);
        // 判断长度
        if (userInfo.length == 0) {
            //showMsg('暂无账号，请添加！');
            $("#J_tipsAdd").html('暂无账号，请添加！');
            $("#J_addUser").height('97px');
            $("#J_addAmount").html("取消添加");
        } else {
            var html = '';
            $.each(userInfo, function(index, val) {
                var tpl = '<li data-name="' + val.name + '" data-pwd="' + val.pwd + '">' +
                    '<label class="userItem"><input type="radio" class="img" name="user">' + val.name + '</label>' +
                    '<div class="controlBox"><i class="editIcon">修改</i><i class="delIcon">删除</i></div>' +
                    '</li>';
                html += tpl;
            });
            $("#J_userList").html(html);
        }
    } else {
        //showMsg('暂无账号，请添加！');
        $("#J_tipsAdd").html('暂无账号，请添加！');
        $("#J_addUser").height('97px');
        $("#J_addAmount").html("取消添加");
    }

    //判断登陆状态
    if (loginStatus.session !== "") {
        var login = loginStatus.username;
        $("#J_tipsAdd").html("已经登陆账号" + login + '，还可以');
        $("#J_userList li").each(function(index, val) {
            if ($(val).attr('data-name') == login) {
                $(val).find('input').attr('checked', 'checked');
            }
        });
    } else {
        console.log('没有登陆');
    }

    //点击登陆
    $("#J_userList").on('click', '.userItem', function() {
        var URLMap = '',
            localUrl = loginStatus.url,
            debuggerUrl = $('#J_url').val();

        //做判断，防止初始化的数据没有
        if (localUrl) {
            if (debuggerUrl !== '') {
                URLMap = "https://" + debuggerUrl + ".backend.xiaomei.com/bs/";
            } else {
                if (localUrl.indexOf('https://test.backendxiaomei.com') > -1) {
                    URLMap = "https://test.backend.xiaomei.com/bs/";
                } else if (localUrl.indexOf('https://dev2.backend.xiaomei.com') > -1) {
                    URLMap = "https://dev2.backend.xiaomei.com/bs/";
                } else if (localUrl.indexOf('https://dev.backend.xiaomei.com') > -1) {
                    URLMap = "https://dev.backend.xiaomei.com/bs/";
                } else if (localUrl.indexOf('https://backend.xiaomei.com') > -1) {
                    URLMap = "https://backend.xiaomei.com/bs/";
                } else if (localUrl.indexOf('https://rc.backend.xiaomei.com') > -1) {
                    URLMap = "https://rc.backend.xiaomei.com/bs/";
                }else if (localUrl.indexOf('http://localhost') > -1) {
                    URLMap = "https://dev.backend.xiaomei.com/bs/";
                }
            }
        } else {
            showMsg('小美内部后台专用，页面地址不对！');
            return false;
        }

        var username = $(this).parent().attr('data-name'),
            password = $(this).parent().attr('data-pwd');

        //请求登陆接口
        $.ajax({
            type: "post",
            url: URLMap + 'admin/login',
            dataType: 'json',
            data: {
                user: username,
                pwd: window.hex_md5(password),
                __username: username
            },
            success: function(response) {

                chrome.tabs.executeScript(null, {
                    code: 'document.cookie = "sessionId="+' + '"' + response.sessionId + ';path=/"'
                });
                chrome.tabs.executeScript(null, {
                    code: 'document.cookie = "username="+' + '"' + username + ';path=/"'
                });

                var login = {
                    name: username,
                    pwd: password
                };

                localStorage.login = JSON.stringify(login);

                showMsg('登陆' + username + '成功！');
                setTimeout(function() {
                    window.close();
                    chrome.tabs.executeScript(null, {
                        code: 'window.location.reload()'
                    });
                }, 1500);
            },
            error: function(response) {
                if (response.status === 401) {
                    showMsg('账号或密码错误,请检查!');
                } else {
                    showMsg('服务器出错，请稍后再试!');
                }
            }
        });
    });

    // 点击展开添加账号
    $("#J_addAmount").click(function() {
        var height = $("#J_addUser").height();
        if (height !== 0) {
            $("#J_addUser").animate({
                height: "0"
            });
            $("#J_username").val('').removeAttr("readonly").css('background', '#fff');
            $("#J_password").val('');
            $("#J_addUser").attr('edit', '');
            $("#J_addAmount").html("添加账号");

        } else {
            $("#J_addUser").animate({
                height: "97px"
            });
            $("#J_addAmount").html("取消添加");
        }
    });

    //点击添加账号，修改
    $("#J_start").click(function() {

        var username = $("#J_username").val(),
            password = $("#J_password").val();
        if (username !== "" && password !== "") {

            if ($("#J_addUser").attr('edit') == 1) {
                //修改账号
                $("#J_userList li").each(function(index, val) {

                    if ($(val).attr('edit') == 1) {
                        $(val).attr('data-name', username);
                        $(val).attr('data-pwd', password);
                    }

                });

                var deLocalDate = [];
                $("#J_userList li").each(function(index, val) {
                    var c = {
                        name: $(val).attr('data-name'),
                        pwd: $(val).attr('data-pwd')
                    };
                    deLocalDate.push(c);
                });
                // 更改localStorage
                localStorage.userInfo = JSON.stringify(deLocalDate);

                $("#J_addAmount").click();

                showMsg("已经修改用户" + username);

            } else {
                //添加账号
                var addDate = {
                    name: username,
                    pwd: password
                };
                //向数组中添加元素
                var addLocalDate = [];
                if (localStorage.userInfo) {
                    addLocalDate = JSON.parse(localStorage.userInfo);
                }
                addLocalDate.push(addDate);

                // 更改localStorage
                localStorage.userInfo = JSON.stringify(addLocalDate);

                var tpl = '<li data-name="' + addDate.name + '" data-pwd="' + addDate.pwd + '">' +
                    '<label class="userItem"><input type="radio" class="img" name="user" >' + addDate.name + '</label>' +
                    '<div class="controlBox"><i class="editIcon">修改</i><i class="delIcon">删除</i></div>' +
                    '</li>';

                $("#J_userList").append(tpl);

                $("#J_addAmount").click();
                showMsg("已经添加用户" + username);

                $("#J_tipsAdd").html("请选择账号登陆，你也可以");
            }

        } else {
            $("#J_username").focus();
            showMsg("账号密码不能为空！");
        }
    });

    //删除
    $("#J_userList").on('click', '.delIcon', function() {
        if ($("#J_userList li").length == 1) {
            $("#J_tipsAdd").html('暂无账号，请添加！');
            $("#J_addUser").animate({
                height: "97px"
            });
            $("#J_addAmount").html("取消添加");
        } else {
            $("#J_addUser").animate({
                height: "0"
            });
            $("#J_username").val('');
            $("#J_password").val('');
            $("#J_addUser").attr('edit', '');
            $("#J_addAmount").html("添加账号");
        }
        $(this).parents('li').remove();
        var deLocalDate = [];
        $("#J_userList li").each(function(index, val) {
            var c = {
                name: $(val).attr('data-name'),
                pwd: $(val).attr('data-pwd')
            };
            deLocalDate.push(c);
        });
        // 更改localStorage
        localStorage.userInfo = JSON.stringify(deLocalDate);
        showMsg('已经删除用户' + $(this).parents('li').attr('data-name'));

    });

    //修改
    $("#J_userList").on('click', '.editIcon', function() {
        $("#J_start").html("修改账号");
        $("#J_username").val($(this).parents('li').attr('data-name'));
        $("#J_password").val($(this).parents('li').attr('data-pwd'));
        $(this).parents('li').attr('edit', '1').siblings().attr('edit', '0');
        $("#J_addUser").animate({
            height: "97px"
        });
        $("#J_addAmount").html("取消修改");
        $("#J_addUser").attr('edit', '1');
        $("#J_password").focus();
    });

});

//提示信息
function showMsg(msg) {
    $("#J_msg").html(msg).animate({
        marginTop: '0px',
        opacity: '1'
    });
    setTimeout(function() {
        $("#J_msg").animate({
            marginTop: '-20px',
            opacity: '0'
        }).html('');
    }, 1500);
}
