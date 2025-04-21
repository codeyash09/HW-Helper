
import { fetchPassword, details, logInOfficial } from '/scripts/server.js';



const form = document.getElementById("myForm");
const emailInput = document.getElementById("emailAddress");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("emailErrorMessage");

var pass;
var code;



form.addEventListener("submit", (event) => {
    event.preventDefault(); 
    errorMessage.style.display = "none"; 
    
    
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if(emailValue.includes("@") && emailValue.includes(".")){
        pass = fetchPassword('Users', 'email', emailValue);

    }else{
        pass = fetchPassword('Users', 'username', emailValue);

    }
    if(pass == undefined){
        errorMessage.textContent = "The given username/email does not exist. Please Sign Up.";
        errorMessage.style.display = "block";

    }else{

        pass.then(result => {

            if(result[0] != undefined){

                code = result[0].password;
                
                if(code != passwordValue){
                    errorMessage.textContent = "Incorrect Password Or Username/Email";
                    errorMessage.style.display = "block";
                }else{


                    window.location.replace("/pages/");

                    logInOfficial();

                    
                }
            }else{
                errorMessage.textContent = "The given username/email does not exist. Please Sign Up.";
                errorMessage.style.display = "block";
            }
        });

        
    }
    

    

});

