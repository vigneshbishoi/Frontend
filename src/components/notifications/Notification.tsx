import React, { useCallback, useEffect, useState } from 'react';

import { useNavigation, useIsFocused } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useDispatch, useStore, useSelector } from 'react-redux';

import { loadImageFromURL } from 'services';
import {
  acceptFriendRequest,
  declineFriendRequest,
  loadUserNotifications,
  updateReplyPosted,
  updateUserXFriends,
} from 'store/actions';
import { RootState } from 'store/rootReducer';
import {
  CommentNotificationType,
  CommentThreadType,
  MomentType,
  NotificationType,
  ScreenType,
  ThreadNotificationType,
  UserType,
  RewardType,
} from 'types';
import { AnalyticCategory, AnalyticVerb } from 'types';
import { track } from 'utils';
import {
  fetchUserX,
  getTimeInShorthand,
  normalize,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  userXInStore,
} from 'utils';

import { images } from '../../assets/images';

import { AsyncAnalyticsStatusTextList } from '../../constants';
import { ERROR_DELETED_OBJECT } from '../../constants/strings';

import { Avatar } from '../common';
import AcceptDeclineButtons from '../common/AcceptDeclineButtons';

interface NotificationProps {
  item: NotificationType;
  screenType: ScreenType;
  loggedInUser: UserType;
}

const Notification: React.FC<NotificationProps> = props => {
  const isFocused = useIsFocused();
  const { analyticsStatus = '' } = useSelector((state: RootState) => state.user);
  const {
    item: {
      actor: { id, username, first_name, last_name, thumbnail_url },
      verbage,
      notification_type,
      notification_object,
      timestamp,
    },
    screenType,
    loggedInUser,
  } = props;
  const navigation = useNavigation();
  const state: RootState = useStore().getState();
  const dispatch = useDispatch();

  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [momentURI, setMomentURI] = useState<string | undefined>(undefined);
  const notification_title =
    notification_type === 'FRD_ACPT'
      ? `Say Hi to ${first_name}!`
      : notification_type === 'CLICK_TAG'
      ? 'Tagg Click Count'
      : notification_type === 'P_VIEW'
      ? 'Profile Views'
      : notification_type === 'M_VIEW'
      ? 'Moment Views'
      : notification_type === 'MysteryBox'
      ? 'Mystery Box'
      : notification_type === 'REWARDS'
      ? 'Rewards'
      : notification_type === 'POTVALUE'
      ? 'Rewards'
      : notification_type === 'FULLPOT'
      ? 'Rewards'
      : notification_type === 'HALFPOT'
      ? 'Rewards'
      : notification_type === 'QUARTERPOT'
      ? 'Rewards'
      : `${first_name} ${last_name}`;
  // FULLPOT
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
    (async () => {
      const response = await loadImageFromURL(thumbnail_url);
      if (response) {
        setAvatar(response);
      } else {
        setAvatar(undefined);
      }
    })();
  }, [thumbnail_url]);

  useEffect(() => {
    if (notification_object) {
      let url: string | undefined;
      let obj;
      if (
        notification_type === 'MOM_3+' ||
        notification_type === 'MOM_FRIEND' ||
        notification_type === 'MOM_TAG' ||
        notification_type === 'M_VIEW'
      ) {
        obj = notification_object as MomentType;
        url = obj.thumbnail_url;
      } else if (notification_type === 'CMT') {
        obj = notification_object as CommentNotificationType;
        url = obj.notification_data.thumbnail_url;
      }
      if (url) {
        setMomentURI(url);
      }
    }
  }, [id, notification_object, notification_type]);

  //moment navigation handler
  const navigationHandler = useCallback(
    debounce(
      async () => {
        const object = notification_object as MomentType;
        await fetchUserX(dispatch, { userId: id, username: username }, screenType);
        navigation.push('IndividualMoment', {
          moment: object,
          userXId: id,
          screenType,
        });
      },
      400,
      { leading: true, trailing: false },
    ),
    [],
  );

  const onNotificationTap = async () => {
    switch (notification_type) {
      case 'INVT_ONBRD':
      case 'FRD_ACPT':
      case 'FRD_REQ':
        if (!userXInStore(state, screenType, id)) {
          await fetchUserX(dispatch, { userId: id, username: username }, screenType);
        }
        navigation.push('Profile', {
          userXId: id,
          screenType,
        });
        break;
      case 'CMT':
        //Notification object is set to null if the comment / comment_thread / moment gets deleted
        if (!notification_object) {
          Alert.alert(ERROR_DELETED_OBJECT);
          break;
        }

        /**
         * Notification object knows
         *  1 - Which comment
         *  2 - Which user
         * The comment / reply belongs to
         * STEP 1 : Populate reply / comment
         * STEP 2 : Load user data if moment does not belong to the logged in user
         * STEP 3 : Navigate to relevant moment
         */

        let comment_id: string;
        let not_object;
        let reply: CommentThreadType | undefined;
        let userXId;

        // STEP 1
        if ('parent_comment' in notification_object) {
          //This is a reply
          not_object = notification_object as ThreadNotificationType;
          comment_id = not_object.parent_comment;
          reply = {
            parent_comment: { comment_id: comment_id },
            comment_id: not_object.comment_id,
          };
        } else {
          not_object = notification_object as CommentNotificationType;
          comment_id = not_object.comment_id;
        }

        //STEP 2
        const { user, ...moment } = not_object.notification_data;
        if (user.id !== loggedInUser.userId) {
          fetchUserX(dispatch, { userId: user.id, username: user.username }, screenType);
          userXId = user.id;
        }

        //const { moment_id } = moment;

        //STEP 3
        if (moment) {
          if (reply) {
            dispatch(updateReplyPosted(reply));
          }
          navigation.push('IndividualMoment', {
            moment,
            userXId,
            screenType,
            needToOpenCommentDrawer: true,
            show: true,
          });
          // setTimeout(() => {
          //   navigation.push('MomentCommentsScreen', {
          //     moment_id,
          //     screenType,
          //     comment_id,
          //   });
          // }, 500);
        }
        break;
      case 'MOM_3+':
      case 'MOM_FRIEND':
      case 'MOM_TAG':
      case 'M_VIEW':
        navigationHandler();
        break;
      case 'CLICK_TAG':
        navigation.navigate('TaggClickCountScreen');
        break;
      case 'P_VIEW':
        navigation.navigate('ProfileViewsInsights');
        break;
      default:
        break;
    }
  };
  const handleAcceptRequest = async () => {
    await dispatch(acceptFriendRequest({ id, username, first_name, last_name, thumbnail_url }));
    await dispatch(updateUserXFriends(id, state));
    dispatch(loadUserNotifications());
  };
  const handleDeclineFriendRequest = async () => {
    await dispatch(declineFriendRequest(id));
    dispatch(loadUserNotifications());
  };
  const isOwnProfile = id === loggedInUser.userId;
  const navigateToProfile = async () => {
    // if (notification_type === 'QUARTERPOT') {
    //   navigation.navigate('LeaderBoardScreen');
    //   return;
    // }
    if (notification_type === 'REWARDS') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Rewards' });
      return;
    } else if (notification_type === 'POTVALUE') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Rewards' });
      return;
    } else if (notification_type === 'FULLPOT') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Rewards' });
      return;
    } else if (notification_type === 'HALFPOT') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Rewards' });
      return;
    } else if (notification_type === 'QUARTERPOT') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Rewards' });
      return;
    }

    if (notification_type === 'MysteryBox') {
      navigation.navigate('LeaderBoardScreen', { Rewards: 'Leaderboard' });
      return;
    }
    if (notification_type === 'SYSTEM_MSG') {
      return;
    }
    if (!userXInStore(state, screenType, id)) {
      await fetchUserX(dispatch, { userId: id, username: username }, screenType);
    }
    if (notification_type === 'P_VIEW') {
      if (analyticsStatus === AsyncAnalyticsStatusTextList.ANALYTICS_ENABLED) {
        track('ViewYourInsights', AnalyticVerb.Pressed, AnalyticCategory.Settings);
        navigation.navigate('InsightScreen');
      } else {
        navigation.navigate('SettingsScreen', { showModel: 'true' });
      }
    } else {
      let NavLength = navigation?.getState()?.routes;
      if (NavLength[0]?.name == 'Profile') {
        navigation.push('Profile', {
          userXId: isOwnProfile ? undefined : id,
          screenType: screenType,
          showShareModalParm: false,
        });
      } else {
        navigation.navigate('Profile', {
          userXId: isOwnProfile ? undefined : id,
          screenType: screenType,
          showShareModalParm: false,
        });
      }
    }
  };

  let checkNavigation =
    (notification_type === 'CMT' ||
      (notification_type === 'M_VIEW' && notification_object) ||
      notification_type === 'MOM_3+' ||
      notification_type === 'MOM_TAG' ||
      notification_type === 'MOM_FRIEND') &&
    notification_object;

  let LeaderBoard = verbage?.includes('leaderboard') && notification_type != 'MysteryBox';
  const renderContent = () => (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={checkNavigation ? onNotificationTap : navigateToProfile}
        style={styles.avatarContainer}>
        {/* <Avatar style={styles.avatar} uri={avatar} /> */}
        {notification_type === 'MysteryBox' ? (
          <Image style={styles.avatar} source={require('../../assets/rewards/mystryboxicon.png')} />
        ) : notification_type === 'REWARDS' ? (
          <Image
            style={styles.avatar}
            source={require('../../assets/rewards/RewardsNotification.png')}
          />
        ) : notification_type === 'POTVALUE' ? (
          <Image
            style={styles.avatar}
            source={require('../../assets/rewards/RewardsNotification.png')}
          />
        ) : notification_type === 'FULLPOT' ? (
          <Image
            style={styles.avatar}
            source={require('../../assets/rewards/RewardsNotification.png')}
          />
        ) : notification_type === 'HALFPOT' ? (
          <Image
            style={styles.avatar}
            source={require('../../assets/rewards/RewardsNotification.png')}
          />
        ) : notification_type === 'QUARTERPOT' ? (
          <Image
            style={styles.avatar}
            source={require('../../assets/rewards/RewardsNotification.png')}
          />
        ) : (
          <>
            {avatar && <Avatar style={styles.avatar} uri={avatar} />}
            {!avatar && <Image style={styles.avatar} source={images.main.profile_default} />}
          </>
        )}
      </TouchableWithoutFeedback>
      {notification_type === 'SYSTEM_MSG' || notification_type === 'MOM_TAG' ? (
        // Single-line body text with timestamp
        <View style={styles.contentContainer}>
          <View style={styles.textContainerStyles}>
            {notification_type === 'SYSTEM_MSG' ? (
              <Text style={styles.actorName}>{verbage}</Text>
            ) : (
              <Text>
                <Text style={styles.actorName}>{notification_title} </Text>
                <Text style={styles.verbageStyles}>{verbage} </Text>
                <Text style={styles.timeStampStyles}>{getTimeInShorthand(timestamp)}</Text>
              </Text>
            )}
          </View>
        </View>
      ) : notification_type === 'MysteryBox' ? (
        <View style={styles.contentContainer}>
          <TouchableWithoutFeedback
            onPress={checkNavigation ? onNotificationTap : navigateToProfile}>
            <Text style={styles.actorName}>{notification_title}</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback style={styles.textContainerStyles} onPress={onNotificationTap}>
            <Text>
              <TouchableWithoutFeedback
                onPress={checkNavigation ? onNotificationTap : navigateToProfile}>
                <Text style={styles.verbageStyles}>
                  {verbage}
                  <Text style={styles.timeStampStyles}>
                    {['  ', getTimeInShorthand(timestamp)]}
                  </Text>
                </Text>
              </TouchableWithoutFeedback>
            </Text>
          </TouchableWithoutFeedback>
        </View>
      ) : (
        // Two-line title and body text with timestamp
        <View style={styles.contentContainer}>
          <TouchableWithoutFeedback
            onPress={checkNavigation ? onNotificationTap : navigateToProfile}>
            {LeaderBoard ? (
              <Text style={styles.actorNameLeader}>{'Leaderboard'}</Text>
            ) : (
              <Text style={styles.actorName}>{notification_title}</Text>
            )}
            {/* <Text style={[styles.actorName, { marginBottom: LeaderBoard ? normalize(15) : 0 }]}>
              {LeaderBoard ? 'Leaderboard' : notification_title}
            </Text> */}
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback style={styles.textContainerStyles} onPress={onNotificationTap}>
            <Text>
              <TouchableWithoutFeedback
                onPress={checkNavigation ? onNotificationTap : navigateToProfile}>
                <Text style={styles.verbageStyles}>{verbage} </Text>
                <Text style={styles.timeStampStyles}>{getTimeInShorthand(timestamp)}</Text>
              </TouchableWithoutFeedback>
            </Text>
          </TouchableWithoutFeedback>
        </View>
      )}
      {/* Friend request accept/decline button */}
      {notification_type === 'FRD_REQ' && (
        <View style={styles.buttonsContainer}>
          <AcceptDeclineButtons
            requester={{ id, username, first_name, last_name }}
            onAccept={handleAcceptRequest}
            onReject={handleDeclineFriendRequest}
          />
        </View>
      )}
      {/* Moment Image Preview */}
      {checkNavigation && (
        <TouchableWithoutFeedback style={styles.moment} onPress={onNotificationTap}>
          <Image style={styles.imageFlex} source={{ uri: momentURI }} resizeMode={'contain'} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Math.round(SCREEN_HEIGHT / 10),
    width: SCREEN_WIDTH,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: '6.3%',
  },
  avatarContainer: {
    height: 42,
    width: 42,
    justifyContent: 'center',
  },
  avatar: {
    height: 42,
    width: 42,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 5,
    marginLeft: '5%',
    marginRight: '3%',
    height: '80%',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  actorNameLeader: {
    fontSize: normalize(12),
    fontWeight: '700',
    lineHeight: normalize(14.32),
    marginBottom: normalize(15),
  },
  actorName: {
    fontSize: normalize(12),
    fontWeight: '700',
    lineHeight: normalize(14.32),
    marginBottom: 0,
  },
  moment: {
    height: normalize(72),
    width: normalize(40),
    backgroundColor: 'black',
  },
  buttonsContainer: {
    height: '80%',
  },
  textContainerStyles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  verbageStyles: {
    fontWeight: '500',
    fontSize: normalize(11),
    lineHeight: normalize(13.13),
  },
  timeStampStyles: {
    fontWeight: '500',
    fontSize: normalize(11),
    lineHeight: normalize(13.13),
    marginHorizontal: 2,
    color: '#828282',
    textAlignVertical: 'center',
  },
  imageFlex: {
    flex: 1,
  },
});

export default Notification;
