let runUserBar =()=>{
  let userBtn = document.querySelector('.user-dropdown');
  let userDropdown = ()=>{
    let dropUser = document.querySelector('.user-dropdown-content');
    dropUser.classList.toggle('show')
  }
  userBtn.addEventListener("click", userDropdown)
};
runUserBar();

















