import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
})

// API Endpoints
export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");

export const getStaff = () => api.get("/api/user/staff");
export const updateUserRole = ({ userId, role }) => api.put(`/api/user/${userId}/role`, { role });

// Menu Endpoints
export const getMenu = () => api.get("/api/menu");
export const addCategory = (data) => api.post("/api/menu/category", data);
export const addDish = (data) => api.post("/api/menu/dish", data);

// Customer Endpoints
export const getCustomers = () => api.get("/api/customer");

// Table Endpoints
export const addTable = (data) => api.post("/api/table/", data);
export const getTables = () => api.get("/api/table/");
export const updateTable = ({tableId, ...tableData}) => api.put(`/api/table/${tableId}`, tableData);
export const clearTable = (tableId) => api.put(`/api/table/${tableId}/clear`);

// Order Endpoints
export const addOrder = (data) => api.post("/api/order/", data);
export const getOrders = () => api.get("/api/order");
export const updateOrderStatus = ({orderId, orderStatus}) => api.put(`/api/order/${orderId}`, {orderStatus});
export const updatePaymentStatus = ({orderId, paymentStatus}) => api.put(`/api/order/${orderId}/payment`, {paymentStatus});