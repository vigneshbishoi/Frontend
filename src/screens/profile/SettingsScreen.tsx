import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import {
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Background } from 'components';
import LockedModal from 'components/modals/lockedModal';
import { logout, updateTaggScore, updateAnalyticStatus } from 'store/actions';
import { RootState } from 'store/rootReducer';
import {
  AnalyticCategory,
  AnalyticVerb,
  BackgroundGradientType,
  RewardType,
  TaggScoreActionsEnum,
  ASYNC_STORAGE_KEYS,
} from 'types';
import { copyProfileLinkToClipboard, track } from 'utils';
import { normalize, SCREEN_HEIGHT } from 'utils/layouts';

import { AsyncAnalyticsStatusTextList, SETTINGS_DATA } from '../../constants/constants';
import SettingsCell from './SettingsCell';

const SettingsScreen: React.FC = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { analyticsStatus = '' } = useSelector((state: RootState) => state.user);
  const [isLockVisible, setIsLockVisible] = useState<boolean>(false);
  const { userId: loggedInUserId } = useSelector((state: RootState) => state.user.user);
  const { username } = useSelector((state: RootState) => state.user.user);
  const shareAsLink = async (callback: () => void) => {
    await copyProfileLinkToClipboard(username);
    setIsLockVisible(false);
    callback();
  };
  useEffect(() => {
    const subscribe = navigation.addListener('focus', () => {
      navigation.getParent()?.setOptions({
        tabBarVisible: false,
      });
    });
    return subscribe;
  }, []);
  useEffect(() => {
    if (analyticsStatus === AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED && isFocused) {
      setTimeout(() => {
        navigation.navigate('UnwrapReward', {
          rewardUnwrapping: RewardType.SHARE_PROFILE_TO_ENABLE_ANALYTICS,
          screenType: 'SettingsScreen',
        });
      }, 500);
    }
  }, [analyticsStatus]);
  useEffect(() => {
    if (props?.route?.params?.showModel) {
      setIsLockVisible(true);
    }
  }, []);
  const copyLinkCallback = async () => {
    setTimeout(() => {
      dispatch(updateTaggScore(TaggScoreActionsEnum.PROFILE_SHARE, loggedInUserId));
    }, 500);
    const asyncAnalyticsStatus = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ANALYTICS_ENABLED);
    if (
      !asyncAnalyticsStatus ||
      (asyncAnalyticsStatus !== AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED &&
        asyncAnalyticsStatus !== AsyncAnalyticsStatusTextList.ANALYTICS_ENABLED) ||
      !analyticsStatus
    ) {
      AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.ANALYTICS_ENABLED,
        AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED,
      );
      dispatch(updateAnalyticStatus(AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED));
    }
  };
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Background gradientType={BackgroundGradientType.Light}>
        <SafeAreaView>
          <View style={styles.container}>
            <SectionList
              stickySectionHeadersEnabled={false}
              sections={SETTINGS_DATA.SettingsAndPrivacy}
              keyExtractor={(item, index) => item.title + index}
              renderItem={({ item: { title, preimage, postimage, enabledpreimage } }) => (
                <SettingsCell
                  {...{ title, preimage, postimage, enabledpreimage, analyticsStatus }}
                />
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.headerContainerStyles}>
                  <Text style={styles.headerTextStyles}>{title}</Text>
                </View>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity
                  style={styles.logoutContainerStyles}
                  onPress={() => {
                    track('Logout', AnalyticVerb.Pressed, AnalyticCategory.Settings);
                    dispatch(logout());
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'DiscoverMoments' }],
                    });
                  }}>
                  <Text style={styles.logoutTextStyles}>Logout</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Background>
      <LockedModal
        message={'Feature locked. Share your profile as a link-in-bio to unlock! :)'}
        buttonTitle="Share as link"
        visible={isLockVisible}
        setVisible={setIsLockVisible}
        onPress={() => shareAsLink(copyLinkCallback)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { height: SCREEN_HEIGHT, marginHorizontal: '8%', marginTop: '8%' },
  headerContainerStyles: { marginTop: '14%' },
  headerTextStyles: {
    fontSize: normalize(18),
    fontWeight: '600',
    lineHeight: normalize(21.48),
    color: '#E9E9E9',
  },
  logoutContainerStyles: { marginTop: '20%', marginLeft: '12%' },
  logoutTextStyles: {
    fontSize: normalize(20),
    fontWeight: '600',
    lineHeight: normalize(23.87),
    color: 'white',
  },
});

export default SettingsScreen;
