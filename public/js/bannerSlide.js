let slideIndex = 1;
let showSlides =()=> {
  let slides = document.querySelectorAll(".img-slide");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  
  if (slideIndex > slides.length){
    slideIndex = 1
  }

  slides[slideIndex-1].style.display = "block";  
  setTimeout(showSlides, 3000);
}
showSlides();



let products = document.querySelectorAll('.product-card');
let sliderPd = document.querySelector('.show-product-slides');

let buttonLeft = document.querySelector('#arrow-left');
let buttonRight = document.querySelector('#arrow-right');


buttonLeft.addEventListener('click', function(){
  sliderPd.scrollLeft -= 300;
})

buttonRight.addEventListener('click', function(){
  sliderPd.scrollLeft += 300;
})

const maxScrollLeft = sliderPd.scrollWidth - sliderPd.clientWidth;
//AUTO PLAY THE SLIDER 
function autoPlay() {
  if (sliderPd.scrollLeft > (maxScrollLeft - 1)) {
      sliderPd.scrollLeft -= maxScrollLeft;
  } else {
      sliderPd.scrollLeft += 1;
  }
}
let play = setInterval(autoPlay, 20);

// PAUSE THE SLIDE ON HOVER
for (let i=0; i < products.length; i++){

products[i].addEventListener('mouseover', function() {
  clearInterval(play);
});

products[i].addEventListener('mouseout', function() {
  return play = setInterval(autoPlay, 20);
});
}




