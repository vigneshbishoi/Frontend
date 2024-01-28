import { AsyncAnalyticsStatusTextList } from 'constants';

import React, { useCallback, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { RouteProp, useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import debounce from 'lodash/debounce';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { TabView } from 'react-native-tab-view';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { tutorialGIFs } from 'assets/profileTutorialVideos/lotties';
import { NotificationBell } from 'components';

import { MainStackParams } from 'routes';
import { getNotificationsData } from 'services';
import { updateNewNotificationReceived } from 'store/actions';
import { RootState } from 'store/rootReducer';
import { AnalyticCategory, AnalyticVerb, ASYNC_STORAGE_KEYS, RewardType, ScreenType } from 'types';
import {
  getDateAge,
  getTokenOrLogout,
  isIPhoneX,
  navigateToProfile,
  normalize,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  track,
} from 'utils';

import { dailyEarnCoin, dailyTopProfiles, topThreeuser } from '../../services/LeaderBoardService';
import { fetchUserProfile } from '../../services/UserProfileService';
import UploadMomentScreen from '../moments/UploadMomentScreen';
import LeaderBoardTutorial from './LeaderBoardTutorial';
import Rewards from './Rewards';

type LeaderBoardRouteProps = RouteProp<MainStackParams, 'LeaderBoardScreen'>;

type LeaderBoardNavigationProps = StackNavigationProp<MainStackParams, 'LeaderBoardScreen'>;

interface LeaderBoardScreenProps {
  route: LeaderBoardRouteProps;
  navigation: LeaderBoardNavigationProps;
}
const LeaderBoardScreen: React.FC<LeaderBoardScreenProps> = props => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [topleaders, settopLeaders] = useState([]);
  const [Position, setPosition] = useState(Number);
  const [showGemModal, setShowGemModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoad, setImageLoad] = useState(false);
  const [level, setLevel] = useState(RewardType.LEVEL_ONE_TIER);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderList, setLeaderList] = useState([]);
  const [userEarnCoin, setUserEarnCoin] = useState(0);
  const [activeTab, setActiveTab] = useState('Leaderboard');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showModall, setShowModall] = useState(false);
  const [reopenModal, setReopenModal] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [Show, setShow] = useState(false);
  const { avatar } = useSelector((state: RootState) => state.user);
  const userId = useSelector((state: RootState) => state.user?.user?.userId);
  const state = useStore().getState();
  const dispatch = useDispatch();
  const screenType = ScreenType.DiscoverMoments;
  const { analyticsStatus = '' } = useSelector((state: RootState) => state.user);
  const { notifications } = useSelector((state: RootState) => state.notifications);
  const { username } = useSelector((state: RootState) => state.user.profile);
  const [selectedTab, setSelectedTab] = useState<number>(1);
  const [routes] = React.useState([
    { key: 'reward', title: 'Rewards' },
    { key: 'leaderboard', title: 'Leaderboard' },
  ]);
  let type = props?.route?.params?.Rewards;

  const getHeaderTitle = () => (
    <View style={styles.row}>
      <Pressable
        onPress={() => {
          setSelectedTab(0);
          setActiveTab('Rewards');
          track('Rewards', AnalyticVerb.Pressed, AnalyticCategory.Leaderboard);
        }}>
        <Text style={[activeTab === 'Rewards' ? styles.activeTabText : styles.inactiveTabText]}>
          Rewards
        </Text>
      </Pressable>
      <Divider style={styles.seperatorLine} />
      <Pressable
        onPress={() => {
          setSelectedTab(1);
          setActiveTab('Leaderboard');
          navigation.setParams({ Rewards: 'Leaderboard' });
        }}>
        <Text style={[activeTab === 'Leaderboard' ? styles.activeTabText : styles.inactiveTabText]}>
          Leaderboard
        </Text>
      </Pressable>
    </View>
  );
  navigation.setOptions({
    headerTitle: () => !showTutorial && getHeaderTitle(),
  });
  const [userXId, setUserXID] = useState();
  const { tagg_score } = useSelector((state: RootState) =>
    userXId && state.userX[screenType][userXId]
      ? state.userX[screenType][userXId].profile
      : state.user.profile,
  );
  const [score, setScore] = useState(tagg_score);
  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        navigation.getParent()?.setOptions({
          tabBarVisible: !showTutorial ? true : false,
        });
      }, 200);
    }, [navigation, showTutorial]),
  );

  useEffect(() => {
    if (type === undefined || type === 'Leaderboard') {
      setSelectedTab(1);
      setActiveTab('Leaderboard');
    } else if (type === 'Rewards') {
      setSelectedTab(0);
      setActiveTab('Rewards');
    }
    navigation.setOptions({
      headerBackImage: () => null,
    });
    Topthreeuser();
    if (isFocused) {
      Topthreeuser();
      LeaderShipService();
      getCount();
      setTimeout(() => {
        getCount();
      }, 500);
    }
  }, [isFocused, notifications]);
  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 1500);
  }, []);

  useEffect(() => {
    DeviceEventEmitter.addListener('UploadLeader', data => {
      if (isFocused) {
        setShowModall(data?.show);
        setReopenModal(data?.show);
      }
    });
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setShowModall(false);
    }
    if (isFocused && reopenModal) {
      setShowModall(true);
    }
  }, [isFocused]);

  const getCount = async () => {
    const sortedNotifications = (notifications ?? [])
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    const notificationsUpdate = await getNotificationsData();
    notificationsUpdate.slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    if (
      todayNotification(sortedNotifications)?.length !=
      todayNotification(notificationsUpdate)?.length
    ) {
      dispatch(updateNewNotificationReceived(true));
    }
  };

  const todayNotification = (Data: any) => {
    let today = [];
    for (const n of Data) {
      const notificationDate = moment(n.timestamp);
      const dateAge = getDateAge(notificationDate);
      if (dateAge === 'unknown') {
        continue;
      }
      if (dateAge == 'today') {
        today.push(n);
      }
    }
    return today;
  };
  const Topthreeuser = async () => {
    const leaders = await topThreeuser();
    settopLeaders(leaders);
  };

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LEADERBOARD_TUTORIAL).then(data => {
      if (data !== 'true') {
        setShowTutorial(true);
      }
      setShowContent(true);
    });
    LeaderShipService();
  }, []);

  useEffect(() => {
    if (analyticsStatus === AsyncAnalyticsStatusTextList.PROFILE_LINK_COPIED && isFocused) {
      setTimeout(() => {
        navigation.navigate('UnwrapReward', {
          rewardUnwrapping: RewardType.SHARE_PROFILE_TO_ENABLE_ANALYTICS,
          screenType,
        });
      }, 500);
    }
  }, [analyticsStatus]);

  const LeaderShipService = async () => {
    setLoading(true);
    const data = await dailyTopProfiles();
    if (userId != null && userId != undefined) {
      const userCoin = await dailyEarnCoin(userId);
      setUserEarnCoin(Number(userCoin?.today_score > 0) ? userCoin?.today_score : 0);
    }
    if (data?.length > 0) {
      setLeaderList(data);
    }
    setLoading(false);
  };

  const getColor = (index: number) => {
    if ((index - 1) % 3 === 0) {
      return '#6EE7E7';
    } else if ((index + 1) % 3 === 0) {
      return '#C172FF';
    } else if (index % 3 === 0) {
      return '#698DD3';
    }
  };
  const getColorHigh = (index: number) => {
    if (index === 0) {
      return '#FBE203';
    } else if (index === 1) {
      return '#F1F1F1';
    } else if (index === 2) {
      return '#CD7532';
    }
  };
  const getImageBackground = (index: number) => {
    if ((index - 1) % 3 === 0) {
      return images.main.lightBlueShadow;
    } else if ((index + 1) % 3 === 0) {
      return images.main.purpleShadow;
    } else if (index % 3 === 0) {
      return images.main.darkBlueShadow;
    }
  };
  const getImageBackgroundHigh = (index: number) => {
    if (index === 0) {
      return images.main.lightGoldShadow;
    } else if (index === 1) {
      return images.main.lightWhiteShadow;
    } else if (index === 2) {
      return images.main.lightSunShadow;
    }
  };
  const getIconHigh = (index: number) => {
    if (index === 0) {
      return images.main.rank1;
    } else if (index === 1) {
      return images.main.rank2;
    } else if (index === 2) {
      return images.main.rank3;
    }
  };
  const tierTextBundle = {
    [RewardType.LEVEL_ONE_TIER]: {
      title: 'New kid on the block',
      loggedInUserDescription:
        "Okay newbie, let’s see what you’ve got! The more creative your content is, the more engagement you'll get.",
      otherUserDescription:
        'This creator just arrived! Check out their profile, taggs, and moments and make them feel welcome to the Tagg community.',
      icon: icons.Tier1Outlined,
    },
    [RewardType.LEVEL_TWO_TIER]: {
      title: 'Apprentice',
      loggedInUserDescription:
        'Now you’re getting the hang of things! You are gaining engagement and can now get benefits we give committed creators!!',
      otherUserDescription:
        'Creativity and originality are the keys to engagement! Check out this creator’s vibes! 👀',
      icon: icons.Tier2Outlined,
    },
    [RewardType.LEVEL_THREE_TIER]: {
      title: 'Artisan',
      loggedInUserDescription:
        'You’re mastering being engaging now. Keep contributing great content to the community, you’re killing it! You can now enjoy even more benefits!!',
      otherUserDescription:
        'This creator gets the vibe of Tagg! Explore their profile, taggs, and moments for inspo 🤔.',
      icon: icons.Tier3Outlined,
    },
    [RewardType.LEVEL_FOUR_TIER]: {
      title: 'Specialist',
      loggedInUserDescription:
        'You’re in the top 10% of all content-creators on Tagg. But don’t stop now, keep sharing awesome content with the community to level up!✨',
      otherUserDescription:
        'This creator is in the top percentage of Tagg creators. They have brought new trends and aesthetics to the community. Check out their stuff 😌.',
      icon: icons.Tier4Outlined,
    },
    [RewardType.LEVEL_FIVE_TIER]: {
      title: 'Socialite',
      loggedInUserDescription:
        'You’re in the top 1% of all Tagg creators! 🤩 You can now get the max benefits we offer committed creators. Keep making the Tagg community fun, you’re doing awesome!!',
      otherUserDescription:
        'This creator is in the highest percentage of Tagg creators. Their moments, taggs, and profile have been nothing short of inventive and creative! You’ll benefit from checking them out 😄.',
      icon: icons.Tier5Outlined,
    },
  };

  const levelImg = (data: any) => {
    switch (data) {
      case RewardType.LEVEL_ONE_TIER:
        return icons.Tier1Outlined;
      case RewardType.LEVEL_TWO_TIER:
        return icons.Tier2Outlined;
      case RewardType.LEVEL_THREE_TIER:
        return icons.Tier3Outlined;
      case RewardType.LEVEL_FOUR_TIER:
        return icons.Tier4Outlined;
      case RewardType.LEVEL_FIVE_TIER:
        return icons.Tier5Outlined;
      default:
        return icons.Tier5Outlined;
    }
  };
  const showGemDescriptionModal = async (value: any) => {
    let userId = value?.user_id;
    const token = await getTokenOrLogout(dispatch);
    const res = await fetchUserProfile(userId, token);
    let coinscore = res.profile_info.tagg_score;
    setScore(coinscore);
    setUserXID(value?.user_id);
    setLevel(value.tier);
    setShowGemModal(true);
  };
  const gemDescriptionModal = () => {
    const description =
      userXId == userId
        ? tierTextBundle[level].loggedInUserDescription
        : tierTextBundle[level].otherUserDescription;
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showGemModal}
        onRequestClose={() => {
          // console.log('Modal has been closed.');
        }}>
        <TouchableOpacity
          style={styles.centeredView}
          onPress={() => setShowGemModal(!showGemModal)}>
          <View style={styles.modalView} onStartShouldSetResponder={() => true}>
            <View style={styles.tierIcon}>
              <SvgXml xml={tierTextBundle[level].icon} width={50} height={50} />
            </View>
            <View>
              <Text style={styles.modalHeader}>{tierTextBundle[level].title}</Text>
            </View>
            <View>
              <Text style={styles.modalDescription}>{description}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.tagScorePoint}>Tagg Coin:{score}</Text>
              <Image source={images.main.score_coin} style={styles.coin} />
            </View>
            <View>
              <Pressable
                style={[styles.buttonmodal, styles.buttonClose]}
                onPress={() => setShowGemModal(!showGemModal)}>
                <Text style={styles.textStyleClose}>Close</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  const navigationHandler = useCallback(
    debounce(
      data => {
        navigateToProfile(state, dispatch, navigation, screenType, {
          userId: data?.user_id,
          username: data?.username,
        });
      },
      400,
      { leading: true, trailing: false },
    ),
    [],
  );
  const navigateToUserProfile = (data: any) => {
    navigationHandler(data);
  };
  const onContinuePress = () => {
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LEADERBOARD_TUTORIAL, 'true');
    setShowTutorial(false);
  };
  const handlebox = () => {
    const users = [
      { name: 1, pct: 50 },
      { name: 2, pct: 50 },
      { name: 3, pct: 50 },
      { name: 4, pct: 25 },
      { name: 5, pct: 10 },
      { name: 6, pct: 0 },
      { name: 7, pct: 10 },
      // { name: 8, pct: 10 },
    ];

    const expanded = users.flatMap(user => Array(user.pct).fill(user));

    const winner = expanded[Math.floor(Math.random() * expanded.length)];
    const val = winner.name;
    let coin = '';
    switch (val) {
      case 1:
        coin = '10';
        break;
      case 2:
        coin = '100';
        break;
      case 3:
        coin = '200';
        break;
      case 4:
        coin = '250';
        break;
      case 5:
        coin = '500';
        break;
      case 6:
        coin = 'insights';
        break;
      case 7:
        coin = 'Experience';
        break;
      // case 8:
      //   coin = 'Experience';
      //   break;

      default:
        break;
    }
    if (topleaders[0]?.username === username) {
      setPosition(1);
    } else if (topleaders[1]?.username === username) {
      setPosition(2);
    } else if (topleaders[2]?.username === username) {
      setPosition(3);
    }
    if (coin !== null) {
      navigation.navigate('UnlockCoin', { coin: coin, Position: Position });
    }
  };

  const RewardRoute = () => showContent && <Rewards />;

  const LeaderBoardRoute = () =>
    showContent && (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            tintColor="transparent"
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              getCount();
              LeaderShipService();
              setTimeout(() => {
                setRefreshing(false);
              }, 3000);
            }}
          />
        }>
        <View style={styles.mainView}>
          {refreshing && (
            <View style={styles.loadingImg}>
              <Image source={require('assets/gifs/loading-animation.gif')} style={styles.image} />
            </View>
          )}
          {leaderList && !!leaderList.length ? (
            <>
              <Text style={styles.headingText}>{'Daily Top Profiles'}</Text>
              <View style={styles.earnedTodaytitle}>
                <View style={styles.earnedToday}>
                  <View style={styles.alignCenterView}>
                    <Image source={icons.EditImage} style={styles.totalEarnedProfileImageEmpty} />
                    <Image
                      source={avatar ? { uri: avatar } : images.main.profileImg}
                      style={styles.totalEarnedProfileImage}
                    />
                  </View>
                  <Text style={styles.earnedTodayText}>{`Earned today: ${userEarnCoin}`}</Text>
                  <Image source={images.main.score_coin} style={styles.totalScoreCoinImage} />
                </View>
                {Show === true ? (
                  (topleaders[0]?.username == username && topleaders[0]?.is_unlocked == false) ||
                  (topleaders[1]?.username == username && topleaders[1]?.is_unlocked == false) ||
                  (topleaders[2]?.username == username && topleaders[2]?.is_unlocked == false) ? (
                    <TouchableOpacity onPress={() => handlebox()} style={styles.animatebtn}>
                      <View style={styles.mysterybox}>
                        <LottieView
                          resizeMode={'cover'}
                          source={tutorialGIFs.animated_mysterybox}
                          autoPlay
                          loop={false}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null
                ) : null}
              </View>
              <View style={styles.dataWrapper}>
                {leaderList &&
                  leaderList.map((item: any, index) => {
                    const imageBg = getImageBackground(index + 1);
                    const imageBgHigh = getImageBackgroundHigh(index);
                    const color = getColor(index + 1);
                    const colorHigh = getColorHigh(index);
                    const iconHigh = getIconHigh(index);
                    return (
                      <>
                        <View style={styles.imageContainer}>
                          <Pressable
                            style={styles.userProfileContainer}
                            onPress={() => navigateToUserProfile(item)}>
                            <View style={styles.alignCenter}>
                              <View>
                                {index === 0 ? (
                                  <Image
                                    source={images.main.ray}
                                    style={[styles.imageBgContainer, styles.rank1]}
                                  />
                                ) : null}
                                <ImageBackground
                                  source={index <= 2 ? imageBgHigh : imageBg}
                                  style={styles.imageBgContainer}>
                                  <View
                                    style={[
                                      styles.userProfileImage,
                                      styles.alingCenter,
                                      index === 0 ? styles.rgbcolor : styles.tranclolor,
                                    ]}>
                                    <Image source={icons.EditImage} style={styles.emptyImg} />
                                    <Image
                                      source={
                                        item?.profile_image
                                          ? { uri: item?.profile_image }
                                          : images.main.profileImg
                                      }
                                      style={[
                                        styles.userProfileImage,
                                        { borderColor: index < 3 ? colorHigh : color },
                                      ]}
                                    />
                                  </View>
                                  {index <= 2 ? (
                                    <Image
                                      source={iconHigh}
                                      style={[styles.indexCountWrapper, styles.star]}
                                    />
                                  ) : (
                                    <View
                                      style={[
                                        styles.indexCountWrapper,
                                        { backgroundColor: color },
                                      ]}>
                                      <Text style={styles.countText}>{index + 1}</Text>
                                    </View>
                                  )}
                                </ImageBackground>
                              </View>
                              <View style={styles.profileNameWrapper}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                  {item?.username}
                                </Text>
                                <Pressable onPress={() => showGemDescriptionModal(item)}>
                                  <SvgXml xml={levelImg(item?.tier)} width={15} height={15} />
                                </Pressable>
                              </View>
                            </View>
                          </Pressable>
                          <View style={styles.alignCenter}>
                            <View style={styles.coinTextWrapper}>
                              <Text style={styles.coinAmountText}>{item?.today_score}</Text>
                              <Image
                                source={images.main.score_coin}
                                style={styles.earnedCoinsImage}
                              />
                            </View>
                            <Text style={styles.coinEarnedTodayText}>{'Earned today'}</Text>
                          </View>
                        </View>
                        {index !== leaderList.length - 1 && <Divider style={styles.dividerLine} />}
                      </>
                    );
                  })}
              </View>
            </>
          ) : (
            <>
              {loading ? (
                <View style={[styles.loadingImg, { marginTop: SCREEN_HEIGHT * 0.34 }]}>
                  <Image
                    source={require('assets/gifs/loading-animation.gif')}
                    style={styles.image}
                  />
                </View>
              ) : (
                <View style={styles.noUserWrapper}>
                  <View style={styles.noUserContainer}>
                    <Text style={styles.earnedTodayNoUserText}>{'Earned Today'}</Text>
                    <Image
                      source={avatar ? { uri: avatar } : images.main.profileImg}
                      style={styles.userProfileImageNoUser}
                      onLoadStart={() => setImageLoad(true)}
                      onLoadEnd={() => setImageLoad(false)}
                    />
                    {imageLoad && (
                      <ActivityIndicator style={styles.loader} size="large" color={'white'} />
                    )}
                    <View style={styles.noOfCoinContainer}>
                      <Text style={styles.noOfCoinsText}>{userEarnCoin}</Text>
                      <Image source={images.main.score_coin} style={styles.coinImageNoUser} />
                    </View>
                  </View>
                  <Text style={styles.noUserText}>{'Earn coins and get real rewards'}</Text>
                </View>
              )}
            </>
          )}
        </View>
        {gemDescriptionModal()}
      </ScrollView>
    );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'reward':
        return RewardRoute();
      case 'leaderboard':
        return LeaderBoardRoute();
      default:
        return null;
    }
  };

  const setTabIndex = () => {
    if (selectedTab == 0) {
      setSelectedTab(1);
      setActiveTab('Leaderboard');
    } else {
      setSelectedTab(0);
      setActiveTab('Rewards');
    }
  };

  const renderTabView = () => <></>;

  return (
    <LinearGradient
      colors={showTutorial ? ['#0A004E', '#8F00FF'] : ['#0D0152', '#421566']}
      style={styles.container}>
      <>
        <StatusBar barStyle="light-content" />
        {/* <View style={[styles.zoomIcon, { top: isIPhoneX() ? insets.top + 5 : insets.top + 10 }]}>
          <SvgXml xml={icons.ZoomIcon} width={40} height={40} />
        </View> */}
        {showTutorial ? (
          <LeaderBoardTutorial onContinuePress={onContinuePress} />
        ) : (
          <>
            <View
              style={[
                styles.notification,
                { top: isIPhoneX() ? insets.top + 11 : insets.top + 10 },
              ]}>
              <NotificationBell screenType={screenType} />
            </View>
            <TabView
              navigationState={{ index: selectedTab, routes }}
              renderScene={renderScene}
              onIndexChange={setTabIndex}
              renderTabBar={renderTabView}
            />
          </>
        )}
        <Modal
          animationType="fadein"
          transparent={false}
          visible={showModall}
          onRequestClose={() => {
            // console.log('Modal has been closed.');
          }}>
          <View style={styles.countainerView}>
            <UploadMomentScreen
              route={{ screenType: 'UPLOAD' }}
              isFocused={isFocused}
              navigation={navigation}
            />
          </View>
        </Modal>
      </>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainView: {
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentContainer: {
    marginTop: 80,
  },
  countainerView: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  notification: {
    position: 'absolute',
    zIndex: 999,
    right: normalize(isIPhoneX() ? 15 : 10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoomIcon: {
    position: 'absolute',
    zIndex: 999,
    left: normalize(isIPhoneX() ? 15 : 10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingText: {
    color: '#FFFFFF',
    fontSize: normalize(22),
    fontWeight: '700',
    lineHeight: normalize(31),
    letterSpacing: 0,
    textAlign: 'center',
  },
  earnedTodaytitle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedToday: {
    backgroundColor: '#463778',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 29,
    marginBottom: 5,
  },
  earnedTodayText: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontWeight: '500',
    lineHeight: normalize(17),
    letterSpacing: 0,
    textAlign: 'center',
    marginLeft: 16,
  },
  countText: {
    fontSize: normalize(12),
    fontWeight: '600',
    lineHeight: normalize(17),
    color: '#333333',
  },
  nameText: {
    fontSize: normalize(12),
    fontWeight: '500',
    lineHeight: normalize(17),
    color: '#FFFFFF',
    marginRight: 7,
    textAlign: 'center',
    maxWidth: '88%',
  },
  coinAmountText: {
    fontSize: normalize(20),
    fontWeight: '700',
    lineHeight: normalize(28),
    color: '#FFFFFF',
    marginRight: 4,
  },
  coinEarnedTodayText: {
    fontSize: normalize(13),
    fontWeight: '500',
    lineHeight: normalize(18),
    color: '#FFFFFF',
    marginTop: 8,
  },
  dividerLine: {
    backgroundColor: '#522AB8',
    marginHorizontal: 33,
    marginTop: 16,
    height: 1.5,
  },
  totalEarnedProfileImage: {
    height: 42,
    width: 42,
    borderRadius: 50,
  },
  totalScoreCoinImage: {
    height: 22,
    width: 22,
    borderRadius: 50,
    marginTop: 3,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH,
    paddingHorizontal: 33,
    marginTop: 16,
  },
  imageBgContainer: {
    height: 150,
    width: 150,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rank1: {
    position: 'absolute',
    height: 160,
    width: 160,
    top: -5,
    left: -5,
  },
  userProfileImage: {
    height: 110,
    width: 110,
    borderRadius: 100,
    borderWidth: 2,
  },
  alingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexCountWrapper: {
    height: 27,
    width: 27,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 7,
  },
  star: {
    height: 31,
    width: 31,
  },
  profileNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'center',
    // maxWidth: '75%',
  },
  earnedCoinsImage: {
    height: 30,
    width: 30,
    borderRadius: 50,
    marginTop: 3,
  },
  dataWrapper: {
    marginTop: 9,
    paddingBottom: 100,
  },
  alignCenter: {
    alignItems: 'center',
    width: 150,
  },
  coinTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noUserWrapper: {
    alignItems: 'center',
    marginTop: 69,
    width: SCREEN_WIDTH,
    paddingHorizontal: 26,
  },
  noUserContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    height: 228,
    width: '100%',
    alignItems: 'center',
  },
  noUserText: {
    fontSize: normalize(18),
    lineHeight: normalize(25),
    color: '#FFFFFF',
    marginTop: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  earnedTodayNoUserText: {
    fontSize: normalize(18),
    lineHeight: normalize(25),
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userProfileImageNoUser: {
    height: 110,
    width: 110,
    marginTop: 16,
    borderRadius: 100,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonmodal: {
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    width: SCREEN_WIDTH / 1.5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#618CD9',
  },
  textStyleClose: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tierIcon: {
    backgroundColor: '#F2F2F2',
    padding: 20,
    borderRadius: 50,
    marginTop: -80,
  },
  modalHeader: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 25,
  },
  modalDescription: {
    color: '#4F4F4F',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    maxWidth: SCREEN_WIDTH / 1.5,
  },
  tagScorePoint: {
    color: '#618CD9',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 30,
  },
  coin: {
    width: 22,
    height: 22,
    bottom: -1,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingImg: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 50,
    width: 120,
    justifyContent: 'center',
  },
  emptyImg: {
    height: 80,
    width: 80,
    position: 'absolute',
  },
  loader: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  totalEarnedProfileImageEmpty: {
    height: 34,
    width: 34,
    position: 'absolute',
  },
  alignCenterView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noOfCoinsText: {
    color: '#FFFFFF',
    fontSize: normalize(20),
    lineHeight: 28,
    fontWeight: '600',
  },
  rgbcolor: {
    backgroundColor: 'rgba(251, 226, 3, 0.7)',
  },
  tranclolor: {
    backgroundColor: 'transparent',
  },
  coinImageNoUser: {
    height: 20,
    width: 20,
    borderRadius: 50,
    marginLeft: 4,
    marginTop: 6,
  },
  noOfCoinContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  activeTabText: {
    color: '#ffff',
    fontSize: normalize(15),
    fontWeight: '600',
    lineHeight: normalize(21),
    letterSpacing: 0,
    textAlign: 'center',
  },
  inactiveTabText: {
    color: '#D0CDDD',
    fontSize: normalize(15),
    fontWeight: '500',
    lineHeight: normalize(21),
    letterSpacing: 0,
    textAlign: 'center',
  },
  seperatorLine: {
    marginHorizontal: 10,
    height: 13,
    width: 1,
    backgroundColor: '#BDBDBD',
    marginTop: 5,
  },
  userProfileContainer: {
    width: '37%',
    marginLeft: 5,
  },
  mysterybox: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    width: 480,
    height: 64,
    padding: 8,
  },
  animatebtn: {
    position: 'absolute',
    marginTop: 20,
  },
});

export default LeaderBoardScreen;
