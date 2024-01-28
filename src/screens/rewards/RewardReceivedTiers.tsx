import { default as React, useEffect } from 'react';

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import LottieView from 'lottie-react-native';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { SvgXml } from 'react-native-svg';

import { lotties } from 'assets/gamification/lotties';
import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { ButtonWithGradientBackground } from 'components/widgets/buttonWithGradientBackground';

import { MainStackParams } from 'routes';
import { isIPhoneX, normalize, SCREEN_HEIGHT, SCREEN_WIDTH } from 'utils';

import { RewardType } from '../../types';

type RewardReceivedRouteProps = RouteProp<MainStackParams, 'RewardReceived'>;

type RewardReceivedNavigationProps = StackNavigationProp<MainStackParams, 'RewardReceived'>;

interface RewardReceivedProps {
  route: RewardReceivedRouteProps;
  navigation: RewardReceivedNavigationProps;
}
const RewardReceivedTiers: React.FC<RewardReceivedProps> = ({ route, navigation }) => {
  const { rewardUnwrapped } = route.params;
  console.log('reward===', rewardUnwrapped);

  const RewardReceivedTextBundle = {
    [RewardType.LEVEL_ONE_TIER]: {
      title: 'You’re now a New Kid. Keep earning coins to level up.',
      icon: icons.Tier1,
    },
    [RewardType.LEVEL_TWO_TIER]: {
      title: 'You’re now an Apprentice. Keep earning coins to level up.',
      icon: lotties.level2,
    },
    [RewardType.LEVEL_THREE_TIER]: {
      title: 'You’re now an Artisan. Keep earning coins to level up.',
      icon: lotties.level3,
    },
    [RewardType.LEVEL_FOUR_TIER]: {
      title: 'You’re now a Specialist. Keep earning coins to level up.',
      icon: lotties.level4,
    },
    [RewardType.LEVEL_FIVE_TIER]: {
      title: 'You’re now a Socialite. Keep earning coins to level up.',
      icon: lotties.level5,
    },
  };
  const onContinuePress = () => {
    navigation.goBack();
  };
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarVisible: false,
    });
  }, [navigation]);

  return (
    <LinearGradient colors={['#385A5E', '#421566']} style={styles.container}>
      <SafeAreaView>
        <StatusBar barStyle="light-content" />
        <View style={styles.mainView}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{'Congratulations!'}</Text>
            <Text style={styles.subHeading}>{RewardReceivedTextBundle[rewardUnwrapped].title}</Text>
          </View>
          <View style={styles.mainAssetsContainer}>
            {rewardUnwrapped === RewardType.LEVEL_ONE_TIER ? (
              <SvgXml
                xml={RewardReceivedTextBundle[rewardUnwrapped].icon}
                width={170}
                height={170}
              />
            ) : (
              <LottieView
                style={styles.lottie}
                source={RewardReceivedTextBundle[rewardUnwrapped].icon}
                autoPlay
                loop
              />
            )}
          </View>
          <View style={styles.buttonContainer}>
            <ButtonWithGradientBackground
              onPress={onContinuePress}
              title={'Continue'}
              buttonStyles={styles.buttonStyles}
              buttonTextStyles={styles.buttonTextStyles}
              buttonStartIcon={images.main.Lock}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flexDirection: 'column',
    alignItems: 'center',
  },
  textContainer: {
    top: '10%',
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    lineHeight: normalize(48),
    fontSize: normalize(34),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subHeading: {
    lineHeight: normalize(25),
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#F2F2F2',
    paddingTop: '3%',
    textAlign: 'center',
    paddingHorizontal: '7%',
  },
  mainAssetsContainer: {
    height: SCREEN_HEIGHT * 0.3,
    top: '20%',
    zIndex: -1,
  },
  buttonStyles: {
    width: 280,
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonTextStyles: {
    fontWeight: '700',
    fontSize: normalize(18),
    lineHeight: normalize(25),
    color: 'white',
  },
  container: {
    flex: 1,
  },
  buttonContainer: { bottom: isIPhoneX() ? '25%' : '18%', position: 'absolute' },
  lottie: { top: '-8%', width: 300, height: 300, alignSelf: 'center' },
});

export default RewardReceivedTiers;
