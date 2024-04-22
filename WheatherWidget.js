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

      const forecast = data.list.filter((entry) => {
        const date = new Date(entry.dt * 1000);
        return (
          date.getHours() === 12 &&
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
      const forecastEntry = document.createElement('div');
      forecastEntry.innerHTML = `${date.toLocaleDateString()} ${Math.round(entry.main.temp)} °C (${
        entry.weather[0].description
      })`;
      forecastContainer.appendChild(forecastEntry);
    });

    this.container.appendChild(forecastContainer);
    this.forecastButton.style.display = 'none';
  }

  createWidgetContainer() {
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.bottom = '10px';
    this.container.style.right = '10px';
    this.container.style.padding = '25px';
    this.container.style.backgroundColor = 'white';
    this.container.style.border = '1px solid #ccc';
    this.container.style.borderRadius = '5px';
    this.container.style.boxShadow = '0px 20px 50px rgba(0, 0, 0, 0.2)';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '2px';
    closeButton.style.right = '2px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
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

    this.forecastButton = document.createElement('button');
    this.forecastButton.innerHTML = 'Прогноз на 3 дня';
    this.forecastButton.style.display = 'block';
    this.forecastButton.style.marginTop = '10px';
    this.forecastButton.style.padding = '5px 10px';
    this.forecastButton.style.cursor = 'pointer';
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

new WeatherWidget().getWeather();
