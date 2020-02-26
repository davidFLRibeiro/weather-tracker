const images = {
  cold: 'to cold',
  hot: 'very hot',
  rainy: 'raining',
  cloudy: 'cloudy',
  clear: 'clear sky'
};

function isBeachWeather(data) {
  return data.temp_c >= 18 && data.precip_mm < 28;
}

function generateHTMLCanBeach(data) {
  const canBeach = isBeachWeather(data);
  const canBeachText = canBeach ? 'YES' : 'NO';
  console.log(canBeach, canBeachText);
  return `
    <span class="beach-verdict beach-verdict-${canBeach}">Beach: ${canBeachText}</span>
  `;
}

function weatherParam(data) {
  if (data.current.temp_c >= 18 && data.current.precip_mm === 0.1) {
    console.log(images.hot);
  }
}

function createGrid() {
  const islands = Object.keys(islandData);
  const grid = islands.reduce((acc, island, idx) => {
    if ((idx + 1) % 3 === 0) {
      acc += generateRow(islands.slice(idx - 2, idx + 1));
    }
    return acc;
  }, '');

  $('main').append(grid);
}

function generateRow(arrayOfIslands) {
  return `<section class="grid-row">${arrayOfIslands
    .map(island => {
      return generateBlock(island);
    })
    .join('')}</section>`;
}

function generateBlock(island) {
  console.log(island);
  return `<div class="grid-block" id="${island}">
    <img class='island-image' src="${islandData[island].img}" />
    <p class='island-text'>${island}</p>
  </div>`;
}

function handleIslandClick() {
  $('.grid-block').on('click', function(event) {
    const islandId = $(this).attr('id');
    console.log(islandId);
    getIsland(islandId);
  });
}

const WEATHER_API_KEY = 'dc337e8934f240b790e210422190608';

function getIsland(islandId) {
  console.log(islandId, islandData[islandId]);
  return fetch(
    `https://api.apixu.com/v1/current.json?key=dc337e8934f240b790e210422190608&q=${islandData[islandId].handle}`
  )
    .then(res => res.json())
    .then(data => {
      console.log(data);
      renderModal(data, islandId);
      fetchTweets(islandId);
    })
    .catch(err => console.log(err));
}

function renderModal(data, islandId) {
  $('.modal').css('display', 'block');
  $('.modal-main').html(generateWeatherHTML(data, islandId));
  weatherParam(data);
}

function generateWeatherHTML(data, islandId) {
  //const weatherGraphic = getWeatherGraphic(data.current.temp_c, 'temperature');
  const goToBeach = generateHTMLCanBeach(data.current);

  return `
      <h3 class='weather-title'>${islandId}</h3>
      <section class='weather-graphic'>
        <img class='weather-graphic-image' src=${data.current.condition.icon} />
        ${goToBeach}
      </section>
      <section class='weather-data'>
        <p class='weather-data-info temperature'>Temperature: ${data.current.temp_c}</p>
        <p class='weather-data-info humidity'>Humidity: ${data.current.humidity}</p>
        <p class='weather-data-info precipitation'>Precipitation: ${data.current.precip_mm}</p>
      </section>
  `;
}

function closeModal() {
  $('.modal').on('click', '.close', function(e) {
    $('.modal').css('display', 'none');
  });
}

const API_KEY = 'iuf8RPHXb7UhRxNLil6Em9Ds5';
const API_SECRET_KEY = 'TMqqYGkacxrJyxLdv6xITpOWBNPP03Me7BzuNOSCA6IvgzMhjD';
const API_BASE_SEARCH_URL =
  'https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/search/tweets.json?q=';
const API_TOKEN_URL =
  'https://cors-anywhere.herokuapp.com/https://api.twitter.com/oauth2/token';

const base64Encoded =
  'TlVnN3dmTGVOYXhYSmRQV3BFcUJBVGJReTpnVUsxR1gzcmtLMTdBeFh3WFBmTTRTQ3IzdlVBUGNlWGZBRUVhUVBVaElUVmJaSVFtUg==';

async function getAuthToken() {
  const authResponse = await fetch(API_TOKEN_URL, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: 'Basic ' + base64Encoded,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  });

  const authJSON = await authResponse.json();

  return authJSON;
}

async function fetchTweets(param) {
  const authJSON = await getAuthToken();
  console.log(authJSON);
  const tweetResponse = await fetch(API_BASE_SEARCH_URL + param, {
    headers: {
      Authorization: 'Bearer ' + authJSON.access_token
    }
  });

  const tweetJSON = await tweetResponse.json();

  handleTweetData(tweetJSON.statuses);
}

function handleTweetData(tweets) {
  console.log(tweets);
  $('.modal-main').append(
    tweets
      .map(tweet => {
        return `<p>${tweet.text}</p>`;
      })
      .join('')
  );
}

function prepareApplication() {
  createGrid();
  handleIslandClick();
  closeModal();
}

$(prepareApplication());
