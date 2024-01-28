import React, { useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useDispatch, useSelector } from 'react-redux';

import { tutorialGIFs } from 'assets/profileTutorialVideos/lotties';
import { updateTaggScore } from 'store/actions';
import { loadUserData } from 'store/actions';
import { RootState } from 'store/rootReducer';
import { TaggScoreActionsEnum, AnalyticVerb, AnalyticCategory } from 'types';
import { SCREEN_WIDTH, track } from 'utils';

import { fetchTagScore, mysteryboxclick, storerewarddetails, claimreward } from '../../services';
import { increment_coins } from '../../services/CommonService';
import { fetchTaggDailyPot } from '../../services/RewardsService';
import { setUserLevelTier } from '../../store/reducers';

const UnlockCoin: React.FC = props => {
  const {
    user: { username },
  } = useSelector((state: RootState) => state.user);
  const userId = useSelector((state: RootState) => state.user.user.userId);
  const { userId: loggedInUserId } = useSelector((state: RootState) => state.user.user);
  const userxId = useSelector((state: RootState) => state.user?.user?.userId);
  const dispatch = useDispatch();
  const [finish, setFinish] = useState(false);
  const navigation = useNavigation();
  let type = props?.route?.params?.coin;
  let getPosition = props?.route?.params?.Position;
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [Coins, setcoin] = useState(Number);
  const [Unlocked, setunlocked] = useState(true);
  const [Potvalue, setPotvalue] = useState(Number);
  const getdata = async () => {
    switch (type) {
      case '10':
        return (
          setTitle('10 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(10)
        );
      case '100':
        return (
          setTitle('100 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(100)
        );
      case '500':
        return (
          setTitle('500 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(500)
        );
      case '200':
        return (
          setTitle('200 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(200)
        );
      case '250':
        return (
          setTitle('250 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(250)
        );
      case 'insights':
        return (
          setTitle('Profile Link Clicks'),
          setSubtitle('You’ve unlocked new insights'),
          setcoin(null)
        );
      case 'Tools':
        return (
          setTitle('Creator Tools'),
          setSubtitle('You’ve unlocked new tools for creating content!'),
          setcoin(null)
        );
      case 'Experience':
        return (
          setTitle('Content \n Experience!'),
          setSubtitle('You’ve unlocked a content experience'),
          setcoin(null)
        );

      default:
        return (
          setTitle('10 Tagg Coins'), setSubtitle('You’ve unlocked more tagg coins'), setcoin(0)
        );
    }
  };

  const handlerewads = async () => {
    navigation.navigate('LeaderBoardScreen');
    if (Potvalue >= Coins) {
      dispatch(increment_coins(Coins));
      dispatch(updateTaggScore(TaggScoreActionsEnum.PROFILE_SHARE, loggedInUserId));
      fetchTagScore(userId).then(res => {
        dispatch({
          type: setUserLevelTier.type,
          payload: res,
        });
      });
    }
  };

  const oneRewardClick = () => {
    track('NotificationCrouselOne', AnalyticVerb.Pressed, AnalyticCategory.Notification);
    if (type == 'Tools') {
      Linking.openURL('https://form.typeform.com/to/VabCeV4M'),
        navigation.navigate('LeaderBoardScreen');
    } else {
      Linking.openURL('https://form.typeform.com/to/x3s1Dojx'),
        navigation.navigate('LeaderBoardScreen');
    }
  };
  const RewardsService = async () => {
    const data = await fetchTaggDailyPot();
    setPotvalue(data.tagg_coin_pot[0].dailytagg_coin_pot);
  };
  useEffect(() => {
    RewardsService();
  }, []);
  const handlereward = async () => {
    storerewarddetails(userxId, type, Coins, getPosition);
    mysteryboxclick(userxId, Unlocked);
    dispatch(loadUserData({ userId, username }));
    if (Potvalue < Coins || Potvalue === 0) {
      claimreward(userxId);
    }
    const insights = 'insights';
    switch (type) {
      case '10':
        return handlerewads(), setunlocked(false);
      case '100':
        return handlerewads(), setunlocked(false);
      case '500':
        return handlerewads(), setunlocked(false);
      case '200':
        return handlerewads(), setunlocked(false);
      case '250':
        return handlerewads(), setunlocked(false);
      case 'insights':
        return navigation.navigate('InsightScreen', { reward: insights }), setunlocked(false);
      case 'Tools':
        return oneRewardClick(), setunlocked(false);
      case 'Experience':
        return oneRewardClick(), setunlocked(false);

      default:
        return handlerewads();
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  return (
    <LottieView
      resizeMode="contain"
      style={[type == 'insights' ? styles.insightview : styles.lottieview]}
      source={
        type == '10'
          ? tutorialGIFs.rewardcoin_ten
          : type == '100'
          ? tutorialGIFs.rewardcoin_hundrade
          : type == '200'
          ? tutorialGIFs.rewardcoin_fivehundrad
          : type == '250'
          ? tutorialGIFs.rewardcoin_thousand
          : type == '500'
          ? tutorialGIFs.rewardcoin_fivethousand
          : type == 'insights'
          ? tutorialGIFs.reward_insight
          : type == 'Tools'
          ? tutorialGIFs.reward_tools
          : type == 'Experience'
          ? tutorialGIFs.reward_experience
          : null
      }
      autoPlay
      loop={false}
      onAnimationFinish={() => setFinish(true)}>
      {finish && (
        <View
          style={
            type == 'insights' || type == 'Tools'
              ? styles.insighExtra
              : type == 'Experience'
              ? styles.textContainerExtra
              : styles.textContainer
          }>
          <Text
            numberOfLines={2}
            style={[type == 'Experience' ? styles.expriancetitle : styles.title]}>
            {title}
          </Text>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
      {finish && (
        <TouchableOpacity
          style={type == '250' || type == '500' ? styles.mysteryboxExtra : styles.mysterybox}
          onPress={() => handlereward()}>
          <LinearGradient
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.8, y: 1 }}
            locations={[0, 0.9, 0.2]}
            colors={['rgba(143, 0, 255 , 0.96)', 'rgba(110,231,231 , 0.8)']}
            style={styles.mysterybox}>
            <Text style={styles.btncontinue}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LottieView>
  );
};

const styles = StyleSheet.create({
  lottieview: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    bottom: 0,
  },
  insightview: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    bottom: 0,
    marginLeft: 7,
  },
  textContainer: {
    top: '18%',
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textContainerExtra: {
    top: '12%',
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  insighExtra: {
    top: '14%',
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: 34,
    lineHeight: 48,
    color: '#FFFFFF',
    letterSpacing: 0,
    textAlign: 'center',
  },
  expriancetitle: {
    width: 270,
    height: 96,
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: 34,
    lineHeight: 47.81,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    top: 15,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 25.31,
    textAlign: 'center',
    color: '#F2F2F2',
  },
  mysterybox: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 293,
    height: 45,
    borderRadius: 40,
    padding: 8,
    bottom: '18%',
    position: 'absolute',
  },
  mysteryboxExtra: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 293,
    height: 45,
    borderRadius: 40,
    padding: 8,
    bottom: '16%',
    position: 'absolute',
  },
  btncontinue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UnlockCoin;
