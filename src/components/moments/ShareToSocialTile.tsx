import { AsyncAnalyticsStatusTextList, TaggToastTextList } from 'constants';

import React from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';

import { icons } from 'assets/icons';

import { updateAnalyticStatus, updateTaggScore } from 'store/actions';
import { RootState } from 'store/rootReducer';
import {
  AnalyticCategory,
  AnalyticVerb,
  ASYNC_STORAGE_KEYS,
  MomentPostType,
  ShareToType,
  TaggScoreActionsEnum,
  TaggToastType,
} from 'types';
import { isIPhoneX, normalize, SCREEN_WIDTH, track } from 'utils';
import { shareProfileToSocial, shareToSocial } from 'utils/share';

import { profileshareupdatestatus } from '../../services';
import { SocialIcon } from '../common';
import { TaggToast } from '../toasts';

interface ShareToSocialTileProps {
  shareTo: ShareToType;
  moment?: MomentPostType;
  isVideo?: boolean;
  incrementMomentShareCount?: () => void;
  setIsOpen?: (value: boolean) => void | undefined;
  username?: string;
  shareTagg?: string;
}

const ShareToSocialTile: React.FC<ShareToSocialTileProps> = ({
  shareTo,
  moment,
  isVideo,
  username: name,
  setIsOpen,
  incrementMomentShareCount,
  shareTagg,
}) => {
  const { analyticsStatus = '' } = useSelector((state: RootState) => state.user);
  const { username } = useSelector((state: RootState) => state.user.profile);
  const data = useSelector((state: RootState) => state.user.profile);
  let { userId: loggedInUserId } = useSelector((state: RootState) => state.user.user);

  const dispatch = useDispatch();

  // To display copy link toast
  const toast = useToast();

  const getIcon = () => {
    switch (shareTo) {
      case 'Search':
        return (
          <SvgXml xml={icons.ReShareSearchIcon} width={normalize(35)} height={normalize(35)} />
        );

      case 'Others':
        return (
          <SvgXml xml={icons.ReShareOthersIcon} width={normalize(35)} height={normalize(35)} />
        );

      case 'Copy Link':
        return (
          <SvgXml xml={icons.ReShareCopyLinkIcon} width={normalize(35)} height={normalize(35)} />
        );

      default:
        return <SocialIcon social={shareTo} style={styles.avatarStyle} whiteRing={false} />;
    }
  };

  const copyLinkCallback = async () => {
    if (moment) {
      TaggToast(toast, TaggToastType.Success, TaggToastTextList.LINK_COPIED);
    } else if (shareTagg != '') {
      TaggToast(toast, TaggToastType.Success, TaggToastTextList.LINK_COPIED);
    } else {
      TaggToast(toast, TaggToastType.Success, TaggToastTextList.PROFILE_LINK_COPIED);
      const asyncAnalyticsStatus = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ANALYTICS_ENABLED);
      if (
        !asyncAnalyticsStatus ||
        (asyncAnalyticsStatus !== AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED &&
          asyncAnalyticsStatus !== AsyncAnalyticsStatusTextList.ANALYTICS_ENABLED) ||
        !analyticsStatus
      ) {
        if (name == username) {
          if (analyticsStatus !== AsyncAnalyticsStatusTextList.ANALYTICS_ENABLED) {
            setTimeout(() => {
              dispatch(updateTaggScore(TaggScoreActionsEnum.PROFILE_SHARE, loggedInUserId));
            }, 500);
            AsyncStorage.setItem(
              ASYNC_STORAGE_KEYS.ANALYTICS_ENABLED,
              AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED,
            );
            dispatch(updateAnalyticStatus(AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED));
          }
        }
      }
      if (name !== username) {
        if (data.is_shareprofile_status === false) {
          profileshareupdatestatus(loggedInUserId);
          setTimeout(() => {
            dispatch(updateTaggScore(TaggScoreActionsEnum.PROFILE_SHARE, loggedInUserId));
          }, 500);
        }
      }
    }
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const share = async () => {
    // Sharing a moment
    if (moment) {
      // if (moment.user.id !== loggedInUserId) {
      setTimeout(() => {
        dispatch(updateTaggScore(TaggScoreActionsEnum.MOMENT_SHARE, loggedInUserId));
      }, 500);
      incrementMomentShareCount();
      // }
      track('ShareToSocial', AnalyticVerb.Pressed, AnalyticCategory.Moment, {
        momentId: moment.moment_id,
        social: shareTo,
      });
      await shareToSocial(
        shareTo,
        moment,
        isVideo,
        shareTo === 'Copy Link' ? copyLinkCallback : undefined,
        username,
      );
    }
    // Sharing a profile
    else {
      // Need to integrate profile sharing analytics to mixpanel
      if (shareTo == 'Instagram' && shareTagg != '') {
        DeviceEventEmitter.emit('ShareTagg');
      }
      if (shareTagg?.length > 0) {
        await shareProfileToSocial(
          shareTo,
          name,
          shareTo === 'Copy Link' ? copyLinkCallback : undefined,
          `${shareTagg}?username=${username}`,
        );
      } else {
        await shareProfileToSocial(
          shareTo,
          `${name}?username=${username}`,
          shareTo === 'Copy Link' ? copyLinkCallback : undefined,
          shareTagg,
        );
      }
    }
    if (setIsOpen && shareTo !== 'Copy Link') {
      setIsOpen(false);
    }
  };

  return (
    <TouchableOpacity onPress={share} style={styles.containerStyle}>
      {getIcon()}
      <View style={styles.nameContainerStyle}>
        <Text style={styles.nameStyle}>{shareTo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    paddingHorizontal: '5%',
    flexDirection: 'column',
    alignItems: 'center',
    width: isIPhoneX() ? 80 : 70,
  },
  avatarStyle: {
    width: normalize(35),
    height: normalize(35),
    borderRadius: 35,
  },
  nameStyle: {
    fontSize: normalize(10),
    lineHeight: normalize(15),
    color: '#828282',
    textAlign: 'center',
  },
  nameContainerStyle: {
    justifyContent: 'space-evenly',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  toastIconStyle: { paddingLeft: normalize(30) },
  toastTextStyle: {
    fontSize: normalize(14),
    lineHeight: normalize(16.7),
  },
  toastStyle: {
    position: 'absolute',
    top: 70,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#3EC23B',
    zIndex: 100,
  },
});

export default ShareToSocialTile;
