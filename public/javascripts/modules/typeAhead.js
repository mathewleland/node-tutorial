//node doesnt have server side modules yet, so we can't 'import axios from axios'
const axios = require('axios');
const dompurify = require('dompurify');

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href='/store/${store.slug}' class='search__result'>
        <strong> ${store.name}</strong>
        <p> ${store.description} </p>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    //if there is no value, quit out
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }
    //show the results
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          const html = searchResultsHTML(res.data);
          searchResults.innerHTML = dompurify.sanitize(html);
        }
        // nothing came back
        searchResults.innerHTML = dompurify.sanitize(`<div class='search__result'> No results found for ${this.value} found! </div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });

  searchInput.on('keyup', (event) => {
    console.log(event.keyCode);
    //only listening to down(40) up(38) or enter(13)
    if (![38,40, 13].includes(event.keyCode)) {
      return;
    }
    const activeClass= 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    
    if (event.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (event.keyCode === 40) {
      next = items[0];
    } else if (event.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length-1];
    } else if (event.keyCode === 38) {
      next = items[items.length-1];
    } else if (event.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;