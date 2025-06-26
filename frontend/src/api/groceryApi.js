import axios from "axios";

const API = axios.create({
  baseURL: process.env.GROCERY_API_URL || "http://localhost:5000/api",
});

//global response error handler
API.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

const handleResponse = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });

export const fetchItems = () => handleResponse(API.get("/items"));
export const addItem = (item) => handleResponse(API.post("/items", item));
export const deleteItem = (id) => handleResponse(API.delete(`/items/${id}`));
export const updateItem = (id, item) =>
  handleResponse(API.put(`/items/${id}`, item));
export const toggleCartStatus = (id) =>
  handleResponse(API.patch(`/items/${id}/cart`));
export const purchaseItems = () => handleResponse(API.post("/purchase"));
export const fetchHistory = () => handleResponse(API.get("/history"));
export const fetchLatestHistory = () =>
  handleResponse(API.get("/history/latest"));
