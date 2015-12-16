function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
var msg = {
    username: getCookie('username') || '',
    session: getCookie('sessionId') || '',
    url: document.URL
};
chrome.runtime.sendMessage(msg);
