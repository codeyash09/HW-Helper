let user = window.localStorage.getItem('userIdentify');
let textArea = document.getElementById("notes");


if(!localStorage.getItem('loggedInStatus')){
    window.location.replace('/pages/login.html');
}
if(localStorage.getItem('loggedInStatus') == "false"){
    window.location.replace('/pages/login.html');
}

