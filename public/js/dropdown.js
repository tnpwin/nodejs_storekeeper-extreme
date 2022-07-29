let dropBtn = document.querySelector('.drop-btn');
let dropdownCate = ()=>{
  let dropItems = document.querySelector('.category-dropdown-items');
  dropItems.classList.toggle('show')
  };
dropBtn.addEventListener("click", dropdownCate);