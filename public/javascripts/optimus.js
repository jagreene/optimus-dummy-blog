// PARAMS //
var optimusBtns = document.getElementsByClassName("optimus-btn");
var optimusCtls = document.getElementsByClassName("optimus-hide");
var cookieName = "optimus";
var cookieExp = 7;
var optimusURL = "http://104.131.78.97"
// HELPER FUNCTIONS //

//redirect to optimus page with params for login
var optimLogin = function (merchant_id, transaction_type, redirect_url){
    optimusWindow = window.open(optimusURL+"/login");
    setTimeout(sendMessage, 2000, merchant_id, transaction_type, redirect_url);
};

var sendMessage = function(merchant_id, transaction_type, redirect_url){
    optimusWindow.postMessage({
        merchant_id: merchant_id,
        transaction_type: transaction_type,
        redirect_url: redirect_url
    }, '*');
    console.log("Sending Message");
}
var receiveMessage =  function (event) {
    console.log("Recieving message from Optimus")
    if (event.origin !== optimusURL){
        return;
    } else {
        ctrlElements();
        setCookie(event.data.transaction_id, cookieExp);
    }
}

// set an optimus cookie with transaction_id and expiration
var setCookie = function(cvalue, exdays) {
    console.log("Setting Cookie:", cvalue);
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cookieName + "=" + cvalue + "; " + expires;
}

// get cookie and value
var getCookie =  function () {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

// check if cookie exists
var checkCookie = function() {
    var optimus_cookie=getCookie(cookieName);
    if (optimus_cookie!="") {
        //if cookie exists check if transaction is still valid
        if(checkAlive(optimus_cookie)){
            console.log("Cookie and alive")
            return true;
        } else {
            console.log("Cookie and dead")
            return false;
        }
    } else{
        console.log("No Cookie")
        return false;
    }
}

//check if cookie's transaction is still alive
var checkAlive = function(transaction_id){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', optimusURL+'/check_status?transaction_id='+transaction_id);
xhr.onload = function() {
        if (xhr.status === 200) {
            if (xhr.responseText === "True") {
                return true;
            } else {
                return false;
            }
        }
        else {
            console.log('Request failed.  Returned status of ' + xhr.status);
            return false;
        }
    };
    xhr.send();
}

//if optimus is enabled hide all controlled elements
var ctrlElements = function(){
    Array.prototype.forEach.call(optimusCtls, function(el, i){
        el.style.display = "none";
    });
}

// ON LOAD //

if(checkCookie()) {
    //if cookie linking to a live transaction then enable optimus
    ctrlElements()
}

window.addEventListener("message", receiveMessage, false);

//bind events to all buttons
Array.prototype.forEach.call(optimusBtns, function(btn, i){
    var merchant_id = btn.getAttribute("merchant_id");
    var transaction_type = btn.getAttribute("transaction_type");
    var redirect_url = btn.getAttribute("redirect_url");
    btn.addEventListener('click', function(){optimLogin(merchant_id, transaction_type, redirect_url)}, false);
});
