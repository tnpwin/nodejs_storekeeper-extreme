let loginBtn = document.querySelector('.toggle-login')
let registerBtn = document.querySelector('.toggle-register')

let loginBody = document.querySelector('.login-body');
let registerBody = document.querySelector('.register-body');

 
registerBtn.addEventListener('click', ()=>{
    registerBtn.classList.add('active');
    if(registerBtn){
        loginBtn.classList.remove('active');
        registerBody.style.display = 'inline-block';
        loginBody.style.display = 'none';
    }
});
loginBtn.addEventListener('click', ()=>{
    loginBtn.classList.add('active');
    if(loginBtn){
        registerBtn.classList.remove('active');
        loginBody.style.display = 'inline-block';
        registerBody.style.display = 'none';
    }
});