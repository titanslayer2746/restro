import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  OrderId: "",
  customerName: "",
  customerPhone: "",
  guests: 0,
  table: null,
  // Orders placed for this guest in the current sitting
  ordersPlaced: 0
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, action) => {
        const { name, phone, guests } = action.payload;
        state.OrderId = `${Date.now()}`;
        state.customerName = name;
        state.customerPhone = phone;
        state.guests = guests;
        state.ordersPlaced = 0;
    },

    removeCustomer: (state) => {
        state.customerName = "";
        state.customerPhone = "";
        state.guests = 0;
        state.table = null;
        state.ordersPlaced = 0;
    },

    updateTable : (state, action) => {
        state.table = action.payload.table;
    },

    orderPlaced: (state) => {
        state.ordersPlaced += 1;
    }
  }
});

export const { setCustomer, removeCustomer, updateTable, orderPlaced } = customerSlice.actions
export default customerSlice.reducer;
