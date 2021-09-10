import axios from "axios";

const baseURL = `${import.meta.env.VITE_BACKEND_URL}`;

export const api = axios.create({ baseURL });
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token has expired, force a full page refresh
        if (error.response?.status === 401) {
            // document.location.reload();
        }
        throw error;
    }
);
export const getAccessToken = () => sessionStorage.getItem("wss/token");
export const persistAccessToken = (token: string) => {
    sessionStorage.setItem("wss/token", token);
    api.defaults.headers.authorization = token;
};
export const removeAccessToken = () => sessionStorage.removeItem("wss/token");
