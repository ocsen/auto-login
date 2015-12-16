var articleData = {};
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest) {
    articleData = request;
});
