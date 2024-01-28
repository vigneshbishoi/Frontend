import AsyncStorage from '@react-native-community/async-storage';

import logger from 'utils/logger';

import {
  LEADER_BOARD_SERVICES,
  USER_EARN_COIN,
  TOPTHREE_USER,
  MYSTERY_BOX_CLICK,
  REWARDS_DETAILS,
  TOPTHREE_USERMOMENT,
  CLAIM_REWARD,
} from '../constants';

export const dailyTopProfiles = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(LEADER_BOARD_SERVICES, {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const dailyEarnCoin = async (userId: any) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(USER_EARN_COIN + `?userId=${userId}`, {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const topThreeuser = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(TOPTHREE_USER, {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const mysteryboxclick = async (userxId: string, Unlocked: boolean) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(MYSTERY_BOX_CLICK, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        tagg_user: userxId,
        is_unlocked: Unlocked,
      }),
    });
    const status = response.status;
    if (status === 200) {
      const data = await response.json();
      return data;
    } else {
      return 0;
    }
  } catch (err) {
    logger.log(err);
    return 0;
  }
};

export const storerewarddetails = async (
  userxId: string,
  type: string,
  Coins: Number,
  getPosition: Number,
) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(REWARDS_DETAILS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        tagg_user: userxId,
        reward: type,
        position: getPosition,
        earncoin: Coins,
      }),
    });
    const status = response.status;
    if (status === 200) {
      const data = await response.json();
      return data;
    } else {
      return 0;
    }
  } catch (err) {
    logger.log(err);
    return 0;
  }
};

export const getToprthreeUsermoment = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(TOPTHREE_USERMOMENT, {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};
export const claimreward = async (userxId: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(CLAIM_REWARD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        tagg_user: userxId,
      }),
    });
    const status = response.status;
    if (status === 200) {
      const data = await response.json();
      console.log('reponse test;;;=>', data);
      return data;
    } else {
      return 0;
    }
  } catch (err) {
    logger.log(err);
    return 0;
  }
};
