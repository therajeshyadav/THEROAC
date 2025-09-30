import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePage: "home",
};

const navSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
  },
});

export const { setActivePage } = navSlice.actions;
export default navSlice.reducer;
