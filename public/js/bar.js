let runBarToggle=()=>{
    let barToggle = document.querySelector('#bar');
    let menuLink = document.querySelector('.menu');
    let barToggleMenu = () => {
      menuLink.classList.toggle('menu-toggle');
      barToggle.classList.toggle('bar-transform');
  
    }
    barToggle.addEventListener('click',barToggleMenu)
  
  };
  runBarToggle();