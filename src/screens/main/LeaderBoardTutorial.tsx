import React from 'react';

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { images } from 'assets/images';
import { ButtonWithGradientBackground } from 'components/widgets/buttonWithGradientBackground';

import { normalize, SCREEN_WIDTH } from 'utils';

interface LeaderBoardTutorialProps {
  onContinuePress: () => void;
}
const LeaderBoardTutorial = ({ onContinuePress }: LeaderBoardTutorialProps) => (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
    <View style={styles.mainView}>
      <Image source={images.main.leaderBoardProfile} style={styles.profileImg} />
      <Text style={styles.titleText}>What’s the Leaderboard?</Text>
      <Text style={styles.descriptionText}>
        Earn coins for being engaging. Posting content, adding taggs, and customizing your profile
        are some ways to earn. The more you earn per day, the higher you will be on the leaderboard.
      </Text>
      <Text style={styles.titleText}>Leaderboard Rewards</Text>
      <Text style={styles.descriptionText}>
        Staying on top of the leaderboard earns you bonus rewards
      </Text>
      <View>
        <View style={styles.listContainer}>
          <Image source={images.main.mysteryBoxImage} style={styles.listImg} />
          <View>
            <Text style={styles.listTitleText}>Mystery box</Text>
            <Text style={styles.listDescriptionText}>
              Unlock prizes whenever you finish the day at the top of the leaderboard
            </Text>
          </View>
        </View>
        <View style={styles.listContainer}>
          <Image source={images.main.score_coin} style={styles.listImg} />
          <View>
            <Text style={styles.listTitleText}>Coins</Text>
            <Text style={styles.listDescriptionText}>
              Earn more coins as bonus whenever you finish the day at the top of the leaderboard
            </Text>
          </View>
        </View>
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
  </ScrollView>
);

export default LeaderBoardTutorial;
const styles = StyleSheet.create({
  contentContainer: {
    marginTop: 30,
  },
  mainView: {
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  profileImg: {
    width: SCREEN_WIDTH - 20,
    height: 170,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: normalize(20),
    fontWeight: '600',
    lineHeight: normalize(28),
    textAlign: 'center',
    marginTop: 42,
    paddingHorizontal: 17,
  },
  descriptionText: {
    color: '#FFFFFF',
    fontSize: normalize(13),
    fontWeight: '500',
    lineHeight: normalize(18),
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 25,
  },
  listContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingLeft: 29,
  },
  listImg: {
    marginRight: 16,
    width: 34,
    height: 34,
  },
  listTitleText: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: '600',
    lineHeight: normalize(21),
    textAlign: 'left',
  },
  listDescriptionText: {
    color: '#FFFFFF',
    fontSize: normalize(13),
    fontWeight: '500',
    lineHeight: normalize(18),
    textAlign: 'left',
    marginTop: 4,
    marginRight: 51,
  },
  buttonContainer: {
    marginTop: 51,
    marginBottom: 70,
  },
  buttonStyles: {
    width: 290,
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonTextStyles: {
    fontWeight: '700',
    fontSize: normalize(18),
    lineHeight: normalize(25),
    color: '#ffffff',
  },
});
