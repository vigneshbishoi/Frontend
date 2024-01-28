import React, { useEffect, useState } from 'react';

import { useIsFocused } from '@react-navigation/native';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';

import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { normalize, SCREEN_HEIGHT, SCREEN_WIDTH } from 'utils';

import { fetchTaggDailyPot } from '../../services/RewardsService';

const Rewards: React.FC = () => {
  const isFocused = useIsFocused();
  const [DailyPot, setDailyPot] = useState();
  // console.log('dailypot===', DailyPot);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [Usd_Coins, setUsd_coins] = useState();

  const RewardsService = async () => {
    const data = await fetchTaggDailyPot();
    if (data.tagg_coin_pot[0]?.dailytagg_coin_pot < 0) {
      setDailyPot(0);
    } else {
      setDailyPot(data.tagg_coin_pot[0]?.dailytagg_coin_pot);
    }
    if (data.tagg_coin_pot[0]?.usd_coins < 0) {
      setUsd_coins(0);
    } else {
      setUsd_coins(data.tagg_coin_pot[0]?.usd_coins);
    }
  };
  useEffect(() => {
    if (isFocused) {
      RewardsService();
      setTimeout(() => {
        RewardsService();
      }, 500);
    }
  }, []);
  useEffect(() => {
    RewardsService();
    const countDown = (() => {
      let nextMidnight = new Date();
      nextMidnight.setHours(3, 0, 0, 0);

      const getRemainingTime: any = () => {
        let now = new Date();

        let time = (nextMidnight.getTime() - now.getTime()) / 1000;

        if (time < 0) {
          nextMidnight = new Date();
          nextMidnight.setDate(nextMidnight.getDate() + 1); //add a day
          nextMidnight.setHours(3, 0, 0, 0);

          return getRemainingTime();
        }

        return time;
      };

      const parseTime = (time: any) => {
        const hours = Math.floor(time / 3600);
        let rest = time - hours * 3600;
        const minutes = Math.floor(rest / 60);
        rest = rest - minutes * 60;
        const seconds = Math.floor(rest);
        const milliseconds = (rest - seconds) * 1000;

        return [hours, minutes, seconds, milliseconds];
      };

      let timeout: any;

      return () => {
        if (!timeout) {
          const refresh = () => {
            const parsedTime = parseTime(getRemainingTime());
            setTimer({ hours: parsedTime[0], minutes: parsedTime[1], seconds: parsedTime[2] });
            setTimeout(() => {
              refresh();
            }, parsedTime[3]);
          };
          refresh();
        } else {
          const parsedTime = parseTime(getRemainingTime());
          setTimer({ hours: parsedTime[0], minutes: parsedTime[1], seconds: parsedTime[2] });
        }
      };
    })();

    countDown();
  }, []);
  const rewardConfig = [
    {
      icon: icons.Moments,
      title: 'Posting engaging content',
    },
    {
      icon: icons.MenuButton,
      title: 'Sharing interesting links with taggs',
    },
    {
      icon: icons.ProfileIconGradient,
      title: 'Customizing profile',
    },
    {
      icon: icons.ReShareCopyLinkIcon,
      title: 'Sharing your profile as a link-in-bio',
    },
  ];

  return (
    <>
      {DailyPot == undefined ? (
        <View style={[styles.loadingImg, { marginTop: SCREEN_HEIGHT * 0.42 }]}>
          <Image source={require('assets/gifs/loading-animation.gif')} style={styles.image} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl
              tintColor="transparent"
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                RewardsService();
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
            <View style={styles.countContainer}>
              <LinearGradient
                colors={['#8F00FF', '#6EE7E7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.earnedTodayContainer}>
                <View style={styles.earnedTodayWrapper}>
                  <Text style={styles.toBeEarnedText}>To be earned today</Text>
                  <View style={styles.cointAmountWrapper}>
                    <Text style={styles.coinAmoutText}>
                      {Number.parseInt(DailyPot)}
                      {/* {DailyPot ? Number.parseInt(DailyPot) : null} */}
                    </Text>
                    <Image
                      source={images.main.score_coin}
                      style={styles.scoreCoin}
                      resizeMode={'contain'}
                    />
                  </View>
                  <Text style={styles.redeemableText}>Redeemable for up to</Text>
                  <Text style={styles.redeemableAmountText}>${Usd_Coins}</Text>
                </View>
              </LinearGradient>
              <View style={styles.countDownContainer}>
                <Text style={styles.countDownText}>Countdown</Text>
                <View style={styles.counterWrapper}>
                  <View>
                    <Text style={styles.countDownTimeText}>{timer.hours}</Text>
                    <Text style={styles.timeText}>Hr</Text>
                  </View>
                  <Text style={[styles.countDownTimeText, styles.colonText]}>:</Text>
                  <View>
                    <Text style={styles.countDownTimeText}>{timer.minutes}</Text>
                    <Text style={styles.timeText}>Min</Text>
                  </View>
                  <Text style={[styles.countDownTimeText, styles.colonText]}>:</Text>
                  <View>
                    <Text style={styles.countDownTimeText}>{timer.seconds}</Text>
                    <Text style={styles.timeText}>Sec</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.disclaimerText}>
              Click the coin count on your profile to redeem your earnings
            </Text>
            <Text style={styles.waysToEarnText}>Ways to earn rewards</Text>
            {rewardConfig.map(item => (
              <View style={styles.rewardsSection}>
                <SvgXml xml={item.icon} width={normalize(35)} height={normalize(35)} />
                <Text style={styles.titleText}>{item.title}</Text>
                <Image
                  source={images.main.coinIconPlus}
                  style={styles.coin}
                  resizeMode={'contain'}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default Rewards;
const styles = StyleSheet.create({
  mainView: {
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    paddingLeft: 14,
    paddingRight: 15,
  },
  contentContainer: {
    marginTop: 80,
  },
  countContainer: {
    height: 176,
    flexDirection: 'row',
    width: '100%',
    borderRadius: 8,
  },
  earnedTodayContainer: {
    width: '60%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  earnedTodayWrapper: {
    marginLeft: 24,
    marginTop: 21,
  },
  countDownContainer: {
    width: '40%',
    backgroundColor: '#4D2C8D',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  disclaimerText: {
    marginVertical: 24,
    color: '#ffffff',
    fontSize: normalize(15),
    fontWeight: '500',
    lineHeight: normalize(21),
    textAlign: 'left',
    paddingRight: 10,
  },
  waysToEarnText: {
    color: '#ffffff',
    fontSize: normalize(20),
    fontWeight: '600',
    lineHeight: normalize(28),
    textAlign: 'left',
    marginBottom: 24,
  },
  rewardsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.2);',
    height: 74,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: '500',
    lineHeight: normalize(21),
    width: '70%',
  },
  coin: {
    height: 40,
    width: 40,
  },
  icon: {
    height: 37,
    width: 35,
  },
  toBeEarnedText: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: '600',
    lineHeight: normalize(21),
  },
  coinAmoutText: {
    color: '#FAEE05',
    fontSize: normalize(34),
    fontWeight: '600',
    lineHeight: normalize(48),
    marginRight: 8,
  },
  cointAmountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  redeemableText: {
    color: '#FFFFFF',
    fontSize: normalize(10),
    fontWeight: '400',
    lineHeight: normalize(14),
    marginTop: 16,
  },
  redeemableAmountText: {
    color: '#70E76E',
    fontSize: normalize(12),
    fontWeight: '600',
    lineHeight: normalize(17),
  },
  scoreCoin: {
    width: 35,
    height: 35,
  },
  countDownText: {
    color: '#FFFFFF',
    fontSize: normalize(13),
    fontWeight: '500',
    lineHeight: normalize(18),
    textAlign: 'center',
  },
  countDownTimeText: {
    color: '#ffffff',
    fontSize: normalize(18),
    fontWeight: '600',
    lineHeight: normalize(25),
    textAlign: 'center',
  },
  colonText: {
    marginHorizontal: 5,
  },
  timeText: {
    color: '#ffffff',
    fontSize: normalize(10),
    fontWeight: '400',
    lineHeight: normalize(14),
    textAlign: 'center',
  },
  counterWrapper: {
    flexDirection: 'row',
    marginTop: 10,
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
});
