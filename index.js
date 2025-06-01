const cardCountElement = document.querySelector('.header__favorites-count');
const cartCountElement = document.querySelector('.header__cart-count');

const listContainer = document.querySelector('.catalog-list');
const originalListItems = [...document.querySelectorAll('.catalog-list__item')];
const myForm = document.querySelector('.filter-form');
const header = document.querySelector('.header');
let isFiltered = false;
let favorites = JSON.parse(localStorage.getItem('liked')) || [];
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
const popover = document.querySelector('.filter-form__group-popover');

const inputNumber = document.querySelector('#apartment-number');
const resetBtn = document.querySelector('.filter-form__reset-btn');
let addFieldsBtn = document.querySelector('.filter-form__additional-filters-showhide');
let addFieldsHidden = true;

//custom pop-ups
const customInputsWithType = document.querySelectorAll('.filter-form__group--types .custom-radio');

customInputsWithType.forEach(input => {
    input.addEventListener('mouseover', function (e) {
        const formData = new FormData(myForm);
        const formProps = Object.fromEntries(formData)
        formProps['property-type'] = input.querySelector('.custom-radio__field').value;
        const matched = filteredItems(formProps);
        popover.querySelector('.filter-form__group-popover-text').textContent = `Показать ${matched.length} вариант${getWordEnding(matched.length)}`;
        popover.classList.add("filter-form__group-popover--active")
    });
    input.addEventListener('mouseout', function (e) {
        popover.classList.remove("filter-form__group-popover--active")
    });
});
console.log(customInputsWithType);


addFieldsBtn.addEventListener('click', function (e) {
    const parentElement = e.currentTarget.closest('.filter-form__additional-filters');
    const checkboxes = parentElement.querySelectorAll('.custom-checkbox__field');
    if (addFieldsHidden) {
        addFieldsHidden = false;
        parentElement.querySelector('.filter-form__additional-field-groups').classList.remove('visually-hidden');
        e.currentTarget.textContent = 'Скрыть';
    } else {
        addFieldsHidden = true;
        parentElement.querySelector('.filter-form__additional-field-groups').classList.add('visually-hidden');
        e.currentTarget.textContent = 'Развернуть'
        anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (anyChecked) {
            checkboxes.forEach(cb => cb.checked = false);
        }

    }

}); 

// RESET
resetBtn.addEventListener('click', function () {
    renderCards(originalListItems);
    isFiltered = false;
    addFieldsHidden = true;
    updateCardCount(favorites);
    highlightSelectedLikes(favorites);
    highlightCartItems(cartItems);
    myForm.reset();
});

/* favorites */
listContainer.addEventListener('click', function (e) {
    const likeBtn = e.target.closest('.catalog-card__btn-like');
    if (!likeBtn) return;

    const card = likeBtn.closest('.catalog-list__item');
    const cardId = card.dataset.id.toString();

    favorites = JSON.parse(localStorage.getItem('liked')) || [];

    const isActive = likeBtn.classList.contains('catalog-card__btn-like--active');

    if (isActive) {
        favorites = favorites.filter(id => id !== cardId);
    } else {
        if (!favorites.includes(cardId)) {
            favorites.push(cardId);
        }
    }

    localStorage.setItem('liked', JSON.stringify(favorites));
    
    if (isFiltered) {
        const filtered = originalListItems.filter(item =>
            favorites.includes(item.dataset.id)
        );
        renderCards(filtered);
    }

    updateCardCount(favorites);
    highlightSelectedLikes(favorites);
});

function updateCardCount(favorites) {
    favorites = JSON.parse(localStorage.getItem('liked')) || [];
    cardCountElement.textContent = favorites.length;
}

function updateInCartCount() {
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartCountElement.textContent = cartItems.length;
}

function highlightSelectedLikes(favorites) {
    const visibleCards = document.querySelectorAll('.catalog-list__item');

    visibleCards.forEach(cardItem => {
        const cardId = cardItem.dataset.id?.toString();
        const likeBtn = cardItem.querySelector('.catalog-card__btn-like');
        likeBtn?.classList.remove('catalog-card__btn-like--active');

        if (favorites.includes(cardId)) {
            likeBtn?.classList.add('catalog-card__btn-like--active');
        }
    });
}

/* show only favorite cards */
cardCountElement.addEventListener('click', function () {
    favorites = JSON.parse(localStorage.getItem('liked')) || [];

    const filtered = originalListItems.filter(item =>
        favorites.includes(item.dataset.id)
    );

    renderCards(filtered);
    isFiltered = true;
    updateCardCount(favorites);
    highlightSelectedLikes(favorites);
});


/*cart */

listContainer.addEventListener('click', function (e) {
    const addToCartBtn = e.target.closest('.catalog-card__add');
    if (!addToCartBtn) return;
    addToCart(addToCartBtn);

});

function addToCart(addToCartBtn) {

    const card = addToCartBtn.closest('.catalog-list__item');
    const cardId = card.dataset.id.toString();

    cartItems = JSON.parse(localStorage.getItem('cart')) || [];


    const itemInCart = cartItems.includes(cardId);
    if (!itemInCart) {
        cartItems.push(cardId);
        addToCartBtn.textContent = '-'
    } else {
        const index = cartItems.indexOf(cardId);
        if (index !== -1) {
            cartItems.splice(index, 1);
            addToCartBtn.textContent = '+'
        }
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateInCartCount()

}

function highlightCartItems(cartItems) {
    const visibleCards = document.querySelectorAll('.catalog-list__item');

    visibleCards.forEach(cardItem => {
        const cardId = cardItem.dataset.id?.toString();
        const cartBtn = cardItem.querySelector('.catalog-card__add');

        if (!cartBtn) return;

        if (cartItems.includes(cardId)) {
            cartBtn.textContent = '-';
        } else {
            cartBtn.textContent = '+';
        }
    });
}


/* filter by properties from the left bar */
myForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(myForm);
    const formProps = Object.fromEntries(formData);

    const matched = filteredItems(formProps);

    renderCards(matched);
    isFiltered = false;
    updateCardCount(favorites);
    highlightSelectedLikes(favorites);
    highlightCartItems(cartItems);
});

/* filter by apartment number introduced in input in real time */
inputNumber.addEventListener('input', function (e) {
    console.log(e.target.value);
    renderCards(originalListItems);
    highlightCartItems(cartItems);

    const allTitles = Array.from(document.querySelectorAll('.catalog-list__item .catalog-card__title'));

    const cardsThatSuite = allTitles
        .filter(title => title.textContent.toLowerCase().includes(e.target.value.toLowerCase()))
        .map(title => title.closest('.catalog-list__item'));


    renderCards(cardsThatSuite);
    isFiltered = false;
    updateCardCount(favorites);
    highlightSelectedLikes(favorites);
    highlightCartItems(cartItems);
});

/* rendering */
function renderCards(cardlist) {
    listContainer.innerHTML = cardlist.map(el => el.outerHTML).join('');
}

function filteredItems(formProps) {
    const matched = originalListItems.filter(item =>
        (!formProps['property-rooms'] || item.querySelector('[data-rooms]')?.textContent === formProps['property-rooms']) &&
        (!formProps['property-size'] || item.querySelector('[data-size]')?.textContent === formProps['property-size']) &&
        (!formProps['property-floor'] || item.querySelector('[data-floor]')?.textContent === formProps['property-floor']) &&
        (!formProps['property-currency'] || item.querySelector('[data-currency]')?.dataset.currency === formProps['property-currency']) &&
        (!formProps['property-type'] || item.querySelector('[data-type]')?.textContent === formProps['property-type']) // <== добавь data-type
    );
    return matched;
}

function getWordEnding(count) {
    if (count % 10 === 1 && count % 100 !== 11) return '';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а';
    return 'ов';
}


updateCardCount(favorites);
updateInCartCount();
highlightSelectedLikes(favorites);
highlightCartItems(cartItems);