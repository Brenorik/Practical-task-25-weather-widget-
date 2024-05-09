class WeatherWidget {
  constructor() {
    this.apiKey = '0c3a89ac499a38a106b92d299c043c1d';
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/';
    this.defaultLocation = 'Минск';
    this.unit = 'metric';
    this.language = 'ru';
    this.container = null;
    this.loader = null;
    this.active = false;

    this.createWidgetContainer();
  }

  async getWeather() {
    try {
      const response = await fetch(
        `${this.apiUrl}weather?q=${this.defaultLocation}&units=${this.unit}&lang=${this.language}&appid=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error('Не удалось получить данные о погоде');
      }
      const data = await response.json();
      this.renderWeather(data);
    } catch (error) {
      console.error('Ошибка запроса:', error);
    }
  }

  async getForecast() {
    try {
      this.showLoader();

      const response = await fetch(
        `${this.apiUrl}forecast?q=${this.defaultLocation}&units=${this.unit}&lang=${this.language}&appid=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error('Не удалось получить данные прогноза');
      }
      const data = await response.json();


      const currentHour = new Date().getHours();


      const forecast = data.list.filter((entry) => {
        const date = new Date(entry.dt * 1000);
        return (
          date.getHours() === currentHour &&
          (date.getDate() === new Date().getDate() ||
            date.getDate() === new Date().getDate() + 1 ||
            date.getDate() === new Date().getDate() + 2 ||
            date.getDate() === new Date().getDate() + 3)
        );
      });
      this.renderForecast(forecast);
    } catch (error) {
      console.error('Ошибка запроса:', error);
    } finally {
      this.hideLoader();
    }
  }

  renderForecast(forecast) {
    const forecastContainer = document.createElement('div');
    forecastContainer.innerHTML = '<b>Прогноз на 3 дня:</b>';

    forecast.forEach((entry) => {
      const date = new Date(entry.dt * 1000);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('ru-RU', options);
      const forecastEntry = document.createElement('div');
      forecastEntry.textContent = `${formattedDate} ${Math.round(entry.main.temp)} °C (${
        entry.weather[0].description
      })`;
      forecastContainer.appendChild(forecastEntry);
    });

    this.container.appendChild(forecastContainer);
    this.forecastButton.style.display = 'none';
  }

  createWidgetContainer() {
    this.container = document.createElement('div');
    this.container.classList.add('weather-widget');

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.classList.add('weatherWCloseButton');
    closeButton.onclick = () => {
      this.container.style.display = 'none';
    };
    this.container.appendChild(closeButton);

    document.body.appendChild(this.container);
  }

  renderWeather(data) {
    const temperature = document.createElement('div');
    temperature.innerHTML = `Сейчас в Минске ${Math.round(data.main.temp)} °C`;

    const weatherDescription = document.createElement('div');
    weatherDescription.innerHTML = `${data.weather[0].description}`;

    const windSpeed = document.createElement('div');
    windSpeed.innerHTML = `Ветер: ${data.wind.speed} м/с`;

    this.container.appendChild(temperature);
    this.container.appendChild(weatherDescription);
    this.container.appendChild(windSpeed);

    this.renderWeatherButton();
  }

  renderWeatherButton() {
    this.forecastButton = document.createElement('button');
    this.forecastButton.innerHTML = 'Прогноз на 3 дня';
    this.forecastButton.classList.add('weatherWidgetForecastButton');
    this.forecastButton.onclick = () => {
      this.getForecast();
    };
    this.container.appendChild(this.forecastButton);
  }

  showLoader() {
    this.loader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.loader.setAttribute('width', '50');
    this.loader.setAttribute('height', '50');
    this.loader.setAttribute('viewBox', '0 0 50 50');
    this.loader.innerHTML = `<circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="#ccc" stroke-dasharray="31.42 31.42" transform="rotate(0 25 25)">
        <animateTransform attributeName="transform" begin="0s" dur="1.5s" type="rotate" from="0 25 25" to="360 25 25" repeatCount="indefinite" />
      </circle>`;
    this.container.appendChild(this.loader);
  }

  hideLoader() {
    if (this.loader) {
      this.loader.style.display = 'none';
    }
  }
}
