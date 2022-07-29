const minusButtons = document.querySelectorAll('.cart-qty-minus')
const plusButtons = document.querySelectorAll('.cart-qty-plus')

minusButtons.forEach((minusBtn) => {
    minusBtn.addEventListener('click',(e) => {
        
        let btnClick = e.target;
        let input = btnClick.parentElement.children[1];
        
        let newValue = Number(input.value)-1;
        if (newValue < 1) {
            return;
        }
        input.value = newValue;
    });
});

plusButtons.forEach((plusBtn) => {
    plusBtn.addEventListener('click',(e) => {

        let btnClick = e.target;
        let input = btnClick.parentElement.children[1];
        
        let newValue = Number(input.value)+1;
        input.value = newValue;
    });
});

