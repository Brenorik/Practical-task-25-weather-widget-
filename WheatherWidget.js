class WeatherWidget {
  constructor() {
    this.apiKey = '0c3a89ac499a38a106b92d299c043c1d';
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/';
    this.city = 'Minsk';
    this.units = 'metric';
    this.lang = 'ru';
    this.forecastPopup = null;
  }

  async getWeather() {
    try {
      const loader = this.showLoader();
      const response = await fetch(
        `${this.apiUrl}weather?q=${this.city}&units=${this.units}&lang=${this.lang}&appid=${this.apiKey}`
      );
      const data = await response.json();
      loader.remove();
      this.renderWeather(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  renderWeather(data) {
    const weatherContainer = document.createElement('div');
    weatherContainer.classList.add('weather-widget-container');

    const weatherPopup = document.createElement('div');
    weatherPopup.classList.add('weather-popup');

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✖';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
      weatherContainer.remove();
    });
    weatherPopup.appendChild(closeButton);

    const weatherInfo = document.createElement('div');
    weatherInfo.classList.add('weather-info');
    weatherInfo.innerHTML = `Сейчас в ${this.city}: ${data.main.temp} °C (${data.weather[0].description}). Ветер: ${data.wind.speed} м/c`;
    weatherPopup.appendChild(weatherInfo);

    const forecastButton = document.createElement('button');
    forecastButton.innerHTML = 'Прогноз на 3 дня';
    forecastButton.addEventListener('click', async () => {
      forecastButton.remove();

      const loader = this.showLoader();
      const forecastData = await this.getForecast();
      loader.remove();
      const forecastText = document.createElement('div');
      forecastText.innerHTML = '<strong>Прогноз на 3 дня:</strong>';
      weatherContainer.appendChild(forecastText);
      this.renderForecast(forecastData);
    });
    weatherPopup.appendChild(forecastButton);

    weatherContainer.appendChild(weatherPopup);
    document.body.appendChild(weatherContainer);
  }

  async getForecast() {
    try {
      const response = await fetch(
        `${this.apiUrl}forecast?q=${this.city}&units=${this.units}&lang=${this.lang}&appid=${this.apiKey}`
      );
      const data = await response.json();
      const filteredForecast = this.filterForecast(data);
      return filteredForecast;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  }

  showLoader() {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    document.body.appendChild(loader);
    return loader;
  }

  filterForecast(data) {
    const today = new Date().getDate();
    const filteredForecast = data.list.filter((item) => {
      const itemDate = new Date(item.dt * 1000).getDate();
      return itemDate === today + 1 || itemDate === today + 2 || itemDate === today + 3;
    });
    return filteredForecast;
  }

  renderForecast(forecast) {
    if (!this.forecastPopup) {
      this.forecastPopup = document.createElement('div');
      this.forecastPopup.classList.add('forecast-popup');
    } else {
      this.forecastPopup.innerHTML = '';
    }

    const forecastByDay = this.groupForecastByDay(forecast);
    for (const [day, forecasts] of Object.entries(forecastByDay)) {
      forecasts.forEach((item) => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        const dateTime = new Date(item.dt * 1000);
        const formattedDate = dateTime.toLocaleDateString(this.lang, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        });
        forecastItem.innerHTML = `${formattedDate} ${this.city}: ${item.main.temp} °C (${item.weather[0].description})`;
        this.forecastPopup.appendChild(forecastItem);
      });
    }

    document.querySelector('.weather-widget-container').appendChild(this.forecastPopup);
  }

  groupForecastByDay(forecast) {
    const forecastByDay = {};
    forecast.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayOfWeek = date.toLocaleDateString(this.lang, { weekday: 'long' });
      const hourOfDay = date.getHours();
      if (hourOfDay === 12) {
        if (!forecastByDay[dayOfWeek]) {
          forecastByDay[dayOfWeek] = [];
        }
        forecastByDay[dayOfWeek].push(item);
      }
    });
    return forecastByDay;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WeatherWidget().getWeather();
});
