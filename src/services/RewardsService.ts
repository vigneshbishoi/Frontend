import AsyncStorage from '@react-native-community/async-storage';

import logger from 'utils/logger';

import { REWARD_SERVICES, INSIGHTS_LOCKSTATUS } from '../constants';

export const fetchTaggDailyPot = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(REWARD_SERVICES, {
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
export const getinsightlockstatus = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(INSIGHTS_LOCKSTATUS, {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      return data?.results;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};
export const checkinsightlockstatus = async (userxId: string, Unlocked: boolean) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(INSIGHTS_LOCKSTATUS, {
      method: 'POST',
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
