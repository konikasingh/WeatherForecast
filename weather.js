const city = document.querySelector("#city-name");
const apikey = '7831e95fb5fb6c6e7cc737153bacd95a';

const city_head = document.querySelector(".city-head");
const date_head = document.querySelector(".date");
const temperature_rating = document.querySelector(".temperature-rating");
const temperature_message = document.querySelector("#temperature-message");
const humidity = document.querySelector(".humidity");
const wind_speed = document.querySelector(".wind-speed");
const feels_like = document.querySelector("#feels-like");
const image_source = document.querySelector("#image-source");

const recentCitiesDropdown = document.querySelector("#recent-cities");

const MAX_RECENT_CITIES = 5;

console.log(image_source.src);
console.log(image_source);

const button = document.querySelector("#search-button");
button.addEventListener("click", async () => {
    console.log(city.value);
    if(city.value==''){
        alert("Enter valid city")
        return;
    }
    const result = await getweather(city.value);
    if (result && result.list && result.list.length > 0 && result.city && result.city.name.toLowerCase() === city.value.toLowerCase()) {
        updateWeather(result, city.value);
        addCityToRecent(city.value);
    } else {
        alert("City not found. Please enter a valid city name.");
    }
    city.value = '';
});

async function getweather(city) {
    city = city.toLowerCase();
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        if ( !data.list || data.list.length === 0 || !data.city) {
            return null;
        }
        return data;
    } catch (error) {
        alert("Error in fetching data");
        return null;
    }
}

function updateWeather(result, cityName) {
    if (!result) {
        alert("No result to update");
        return;
    }
console.log(result)
    city_head.innerText = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
    let onlyDateValue = result.list[0].dt_txt;
    onlyDateValue = onlyDateValue.split(' ')[0];
    date_head.innerText = onlyDateValue;
    temperature_rating.innerText = Math.floor(result.list[0].main.temp);
    temperature_message.innerText = result.list[0].weather[0].description;
    feels_like.innerText = Math.floor(result.list[0].main.feels_like);
    wind_speed.innerText = result.list[0].wind.speed;
    humidity.innerText = result.list[0].main.humidity;

    const iconCode = result.list[0].weather[0].icon;
    let baseURL_icon = `https://openweathermap.org/img/wn/`;
    let finalURL = `${baseURL_icon}${iconCode}@2x.png`;
    image_source.src = finalURL;

    // 5 days forecast weather info
    const foreCastList = document.querySelectorAll(".forecast");
    let i = 7; // initialize with random number
    foreCastList.forEach((elem) => {
        // Changing the date value
        let onlyDateValue = result.list[i].dt_txt;
        onlyDateValue = onlyDateValue.split(' ')[0];
        elem.querySelector(".date-forecast").innerText = onlyDateValue;

        // Changing the image icon dynamically
        let iconCode = result.list[i].weather[0].icon; // access first element of weather array
        let baseURL_icon = `https://openweathermap.org/img/wn/`;
        let finalURL = `${baseURL_icon}${iconCode}@2x.png`;
        elem.querySelector("#image-forecast").src = finalURL;

        // Temperature-Detail in the forecast:
        elem.querySelector(".temp-forecast").innerText = Math.floor(result.list[i].main.temp);

        // Changing the windSpeed and humidity value
        elem.querySelector(".wind-forecast").innerText = result.list[i].wind.speed;
        elem.querySelector(".humid-forecast").innerText = result.list[i].main.humidity;

        i += 8;
    });
}

// Fetch and display weather for Kota on page load
window.addEventListener("load", async () => {
    const result = await getweather("kota");
    if (result && result.list && result.list.length > 0 && result.city && result.city.name.toLowerCase() === "kota") {
        updateWeather(result, "kota");
    } else {
        alert("City not found. Please enter a valid city name.");
    }
    updateRecentCitiesDropdown();
});


async function getweatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        if (!data.list || data.list.length === 0 || !data.city) {
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error in fetching data");
        return null;
    }
}

const locationButton = document.querySelector("#location-button");
locationButton.addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const result = await getweatherByCoordinates(latitude, longitude);
            if (result && result.list && result.list.length > 0 && result.city) {
                updateWeather(result, result.city.name);
            } else {
                alert("Unable to fetch weather for your location.");
            }
        }, () => {
            alert("Permission denied");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});


//Adding event listener to dropdown if it is changing

recentCitiesDropdown.addEventListener("change", async () => {
    const selectedCity = recentCitiesDropdown.value;
    console.log("selected city",selectedCity)
    if (selectedCity) {
        const result = await getweather(selectedCity);
        if (result && result.list && result.list.length > 0 && result.city) {
            updateWeather(result, selectedCity);
        } else {
            alert("Unable to fetch weather for the selected city.");
        }
    }
});

function addCityToRecent(city) {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase()); // Remove duplicate entries
    recentCities.unshift(city); // Add new city to the beginning
    if (recentCities.length > MAX_RECENT_CITIES) {
        recentCities.pop(); // Remove the oldest city if we exceed the limit
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
}

function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCitiesDropdown.innerHTML = '';
    if (recentCities.length > 0) {
        recentCitiesDropdown.style.display = 'block';
        recentCities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.innerText = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.style.display = 'none';
    }
}