import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});


// =========================
// REQUEST INTERCEPTOR
// =========================

API.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// =========================
// RESPONSE INTERCEPTOR
// =========================

API.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {

        // Token expired / invalid
        if (
            error.response?.status === 401 &&
            localStorage.getItem("token")
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);


export default API;