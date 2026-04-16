// Base URL for backend API.
function resolveBaseUrl() {
	const explicitRuntimeValue = window.MOVIE_BOOKING_API_BASE_URL;
	if (explicitRuntimeValue) {
		return String(explicitRuntimeValue).trim().replace(/\/$/, "");
	}

	const localOverride = localStorage.getItem("movieBookingApiBaseUrl");
	if (localOverride) {
		return String(localOverride).trim().replace(/\/$/, "");
	}

	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
		return "http://localhost:8080";
	}

	// Fallback for deployed static frontend.
	return "https://moviebookingbackend-production-93d3.up.railway.app";
}

const BASE_URL = resolveBaseUrl();
const AUTH_TOKEN_KEY = "movieBookingAuthToken";
const USER_ID_KEY = "movieBookingUserId";
const USER_NAME_KEY = "movieBookingUserName";
const USER_AGE_KEY = "movieBookingUserAge";
const USER_EMAIL_KEY = "movieBookingUserEmail";
const USER_PHONE_KEY = "movieBookingUserPhone";
const USER_MARRIAGE_STATUS_KEY = "movieBookingUserMarriageStatus";
const CITY_ID_KEY = "movieBookingCityId";
const CITY_NAME_KEY = "movieBookingCityName";
const THEME_KEY = "movieBookingTheme";

function getAuthToken() {
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token) {
	if (token) {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		return;
	}

	localStorage.removeItem(AUTH_TOKEN_KEY);
}

function clearSessionStorage() {
	localStorage.removeItem(USER_ID_KEY);
	localStorage.removeItem(USER_NAME_KEY);
	localStorage.removeItem(USER_AGE_KEY);
	localStorage.removeItem(USER_EMAIL_KEY);
	localStorage.removeItem(USER_PHONE_KEY);
	localStorage.removeItem(USER_MARRIAGE_STATUS_KEY);
	localStorage.removeItem(AUTH_TOKEN_KEY);
}

function setCurrentUserProfile(user) {
	if (!user?.id) {
		clearSessionStorage();
		return;
	}

	localStorage.setItem(USER_ID_KEY, String(user.id));
	localStorage.setItem(USER_NAME_KEY, user.name || "User");
	localStorage.setItem(USER_AGE_KEY, user.age == null ? "" : String(user.age));
	localStorage.setItem(USER_EMAIL_KEY, user.email || "");
	localStorage.setItem(USER_PHONE_KEY, user.phoneNumber || "");
	localStorage.setItem(USER_MARRIAGE_STATUS_KEY, user.marriageStatus || "");
}

function getCurrentUserProfile() {
	return {
		id: localStorage.getItem(USER_ID_KEY),
		name: localStorage.getItem(USER_NAME_KEY),
		age: localStorage.getItem(USER_AGE_KEY),
		email: localStorage.getItem(USER_EMAIL_KEY),
		phoneNumber: localStorage.getItem(USER_PHONE_KEY),
		marriageStatus: localStorage.getItem(USER_MARRIAGE_STATUS_KEY)
	};
}

function getSelectedCityId() {
	return localStorage.getItem(CITY_ID_KEY);
}

function getSelectedCityName() {
	return localStorage.getItem(CITY_NAME_KEY);
}

function setSelectedCity(city) {
	if (!city?.id) {
		localStorage.removeItem(CITY_ID_KEY);
		localStorage.removeItem(CITY_NAME_KEY);
		return;
	}

	localStorage.setItem(CITY_ID_KEY, String(city.id));
	localStorage.setItem(CITY_NAME_KEY, city.name || "");
}

function isAuthenticated() {
	return Boolean(localStorage.getItem(USER_ID_KEY) && localStorage.getItem(AUTH_TOKEN_KEY));
}

function getThemePreference() {
	return localStorage.getItem(THEME_KEY) || "dark";
}

function setThemePreference(theme) {
	const normalizedTheme = theme === "light" ? "light" : "dark";
	localStorage.setItem(THEME_KEY, normalizedTheme);
	applyTheme(normalizedTheme);
	return normalizedTheme;
}

function applyTheme(theme) {
	const normalizedTheme = theme === "light" ? "light" : "dark";
	document.documentElement.setAttribute("data-theme", normalizedTheme);
	document.body.setAttribute("data-theme", normalizedTheme);
	return normalizedTheme;
}

function getProfileInitials(name) {
	const value = String(name || "User").trim();
	if (!value) {
		return "U";
	}

	return value
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

function formatProfileValue(value, fallback = "Not set") {
	const normalizedValue = String(value || "").trim();
	return normalizedValue ? normalizedValue : fallback;
}

function buildProfileMenu() {
	if (!document.body || !document.querySelector(".header-actions")) {
		return;
	}

	const headerActions = document.querySelector(".header-actions");
	const existingMenu = headerActions.querySelector(".profile-menu-shell");
	if (existingMenu) {
		return;
	}

	const loginButton = headerActions.querySelector(".header-login-button");
	const profile = getCurrentUserProfile();

	if (!isAuthenticated()) {
		if (loginButton) {
			loginButton.style.display = "";
		}
		return;
	}

	if (loginButton) {
		loginButton.style.display = "none";
	}

	const menuShell = document.createElement("div");
	menuShell.className = "profile-menu-shell";
	menuShell.innerHTML = `
		<button type="button" class="profile-trigger" aria-expanded="false">
			<span class="profile-avatar">${getProfileInitials(profile.name)}</span>
			<span class="profile-trigger-copy">
				<span class="profile-label">Profile</span>
				<span class="profile-subtitle">Open account menu</span>
			</span>
		</button>
		<div class="profile-dropdown" hidden>
			<div class="profile-dropdown-header">
				<div class="profile-avatar large">${getProfileInitials(profile.name)}</div>
				<div>
					<div class="profile-title">Account</div>
					<div class="profile-subtitle">User menu</div>
				</div>
			</div>
			<div class="profile-actions">
				<a href="edit-profile.html#profileInfoSection">Profile Info</a>
				<a href="edit-profile.html#profileEditSection">Edit Profile</a>
				<a href="history.html">Booking History</a>
				<button type="button" class="profile-action-button" data-profile-action="logout">Logout</button>
			</div>
			<div class="profile-settings">
				<div class="profile-settings-label">Setting</div>
				<div class="theme-switcher" role="radiogroup" aria-label="App theme">
					<button type="button" data-theme-choice="dark" class="theme-choice">Dark</button>
					<button type="button" data-theme-choice="light" class="theme-choice">Light</button>
				</div>
			</div>
		</div>
	`;

	headerActions.appendChild(menuShell);

	const trigger = menuShell.querySelector(".profile-trigger");
	const dropdown = menuShell.querySelector(".profile-dropdown");
	const themeButtons = menuShell.querySelectorAll("[data-theme-choice]");
	const logoutButton = menuShell.querySelector("[data-profile-action='logout']");

	function closeMenu() {
		dropdown.hidden = true;
		trigger.setAttribute("aria-expanded", "false");
		menuShell.classList.remove("open");
	}

	function toggleMenu() {
		const isOpen = !dropdown.hidden;
		dropdown.hidden = isOpen;
		trigger.setAttribute("aria-expanded", String(!isOpen));
		menuShell.classList.toggle("open", !isOpen);
	}

	trigger.addEventListener("click", function (event) {
		event.preventDefault();
		event.stopPropagation();
		toggleMenu();
	});

	if (logoutButton) {
		logoutButton.addEventListener("click", async function () {
			logoutButton.disabled = true;

			try {
				if (getAuthToken()) {
					await logoutUser();
				}
			} catch (error) {
				console.warn("Logout request failed.", error);
			} finally {
				clearSessionStorage();
				window.location.href = "login.html";
			}
		});
	}

	themeButtons.forEach((button) => {
		button.addEventListener("click", function () {
			setThemePreference(button.dataset.themeChoice);
			menuShell.querySelectorAll(".theme-choice").forEach((choice) => {
				choice.classList.toggle("active", choice.dataset.themeChoice === getThemePreference());
			});
		});
	});

	menuShell.querySelectorAll(".theme-choice").forEach((choice) => {
		choice.classList.toggle("active", choice.dataset.themeChoice === getThemePreference());
	});

	document.addEventListener("click", function (event) {
		if (!menuShell.contains(event.target)) {
			closeMenu();
		}
	});

	window.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			closeMenu();
		}
	});
}

function initializeAppChrome() {
	applyTheme(getThemePreference());
	buildProfileMenu();
}

function getAuthHeaders() {
	const token = getAuthToken();
	if (!token) {
		return {};
	}

	return {
		Authorization: `Bearer ${token}`
	};
}

async function parseResponse(response) {
	const responseText = await response.text();
	let responseData = null;

	if (responseText) {
		try {
			responseData = JSON.parse(responseText);
		} catch (error) {
			responseData = { message: responseText };
		}
	}

	if (!response.ok) {
		const message = responseData?.message || `Request failed with status ${response.status}`;
		throw new Error(message);
	}

	return responseData;
}

// Reusable GET request function.
async function sendGetRequest(endpoint) {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		headers: getAuthHeaders()
	});
	return parseResponse(response);
}

// Reusable POST request function.
async function sendPostRequest(endpoint, data) {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders()
		},
		body: JSON.stringify(data)
	});
	return parseResponse(response);
}

async function sendPutRequest(endpoint, data) {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders()
		},
		body: JSON.stringify(data)
	});
	return parseResponse(response);
}

// Get all movies.
async function getMovies() {
	return sendGetRequest("/movies");
}

async function getCities() {
	return sendGetRequest("/cities");
}

async function getMoviesByCity(cityId) {
	return sendGetRequest(`/cities/${encodeURIComponent(cityId)}/movies`);
}

async function getMovieShows(filters = {}) {
	const params = new URLSearchParams();
	if (filters.cityId) {
		params.set("cityId", filters.cityId);
	}
	if (filters.movieId) {
		params.set("movieId", filters.movieId);
	}

	const queryString = params.toString();
	return sendGetRequest(`/movie-shows${queryString ? `?${queryString}` : ""}`);
}

async function getShowSeats(showId) {
	return sendGetRequest(`/movie-shows/${encodeURIComponent(showId)}/seats`);
}

// Get all seats.
async function getSeats() {
	return sendGetRequest("/seats");
}

// Create a new user by calling POST /users.
async function createUser(user) {
	return sendPostRequest("/users", user);
}

async function signupUser(user) {
	return sendPostRequest("/auth/signup", user);
}

// Get all users by calling GET /users.
async function getUsers() {
	return sendGetRequest("/users");
}

// Authenticate a user by calling POST /auth/login.
async function loginUser(credentials) {
	return sendPostRequest("/auth/login", credentials);
}

// Create a new booking by calling POST /bookings.
async function createBooking(booking) {
	return sendPostRequest("/bookings", booking);
}

async function getBookingById(bookingId) {
	return sendGetRequest(`/bookings/${encodeURIComponent(bookingId)}`);
}

async function getMyBookings() {
	return sendGetRequest("/bookings/me");
}

// Logout user by invalidating token server-side.
async function logoutUser() {
	return sendPostRequest("/auth/logout", {});
}

async function updateCurrentUserProfile(profile) {
	return sendPutRequest("/user/update", profile);
}

document.addEventListener("DOMContentLoaded", initializeAppChrome);
