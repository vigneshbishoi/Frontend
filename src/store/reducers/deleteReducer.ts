import { createSlice } from '@reduxjs/toolkit';

import { DELETE_ACCOUNT } from '../initialStates';

const userDeleteSlice = createSlice({
  name: 'userDelete',
  initialState: DELETE_ACCOUNT,
  reducers: {
    userDeleteUpdate: (state, action) => {
      state.visible = action.payload;
    },
  },
});

export const { userDeleteUpdate } = userDeleteSlice.actions;
export const userDeleteReducer = userDeleteSlice.reducer;
