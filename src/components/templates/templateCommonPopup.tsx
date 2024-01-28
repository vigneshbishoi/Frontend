import React, { FC, useContext } from 'react';

// import { useNavigation } from '@react-navigation/native';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { human, systemWeights } from 'react-native-typography';

import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { ProfileContext } from 'screens/profile/ProfileScreen';
// import { ProfileContext } from 'screens/profile/ProfileScreen';
import { AnalyticCategory, AnalyticVerb, RewardType } from 'types';
import { normalize, SCREEN_WIDTH, track } from 'utils';

interface CommonPopup {
  level: string;
  taggScore: any;
  userXId: string | undefined;
}
const CommonPopups: FC<CommonPopup> = ({
  taggScore,
  userXId,
  level = RewardType.LEVEL_ONE_TIER,
}) => {
  const rewardLevel = level ? level : RewardType.LEVEL_ONE_TIER;
  // const navigation = useNavigation();
  // const { ownProfile } = useContext(ProfileContext);
  const { ownProfile } = useContext(ProfileContext);
  const [gemModalVisible, setGemModalVisible] = React.useState<boolean>(false);
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
  const description = userXId
    ? tierTextBundle[rewardLevel].otherUserDescription
    : tierTextBundle[rewardLevel].loggedInUserDescription;
  return (
    <View>
      <Pressable
        onPress={() => {
          if (ownProfile) {
            track('UserATierIcon', AnalyticVerb.Pressed, AnalyticCategory.Profile);
          } else {
            track('UserBTierIcon', AnalyticVerb.Pressed, AnalyticCategory.Profile);
          }
          setGemModalVisible(true);
        }}>
        <SvgXml xml={tierTextBundle[rewardLevel].icon} width={20} height={20} />
      </Pressable>
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={gemModalVisible}
          onRequestClose={() => {
            // console.log('Modal has been closed.');
          }}>
          <TouchableOpacity
            style={styles.centeredView}
            onPress={() => setGemModalVisible(!gemModalVisible)}>
            <View style={styles.modalView} onStartShouldSetResponder={() => true}>
              <View style={styles.tierIcon}>
                <SvgXml xml={tierTextBundle[rewardLevel].icon} width={50} height={50} />
              </View>
              <View>
                <Text style={styles.modalHeader}>{tierTextBundle[rewardLevel].title}</Text>
              </View>
              <View>
                <Text style={styles.modalDescription}>{description}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.tagScorePoint}>Tagg Coin: {taggScore}</Text>
                <Image source={images.main.score_coin} style={styles.coin} />
              </View>
              <View>
                <Pressable
                  style={[styles.buttonmodal, styles.buttonClose]}
                  onPress={() => setGemModalVisible(!gemModalVisible)}>
                  <Text style={styles.textStyleClose}>Close</Text>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bio: {
    ...human.bodyObject,
    ...systemWeights.semibold,
    marginTop: 10,
    textAlign: 'center',
  },
  gradientStyle: {
    borderRadius: normalize(5),
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  //modal css
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
});

export default CommonPopups;
