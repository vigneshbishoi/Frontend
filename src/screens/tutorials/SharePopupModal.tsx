import {
  SHARE_NOW,
  SHARE_YOUR_PROFILE,
  SAHRE_PROFILE_TUTORIAL_DIS,
  AsyncAnalyticsStatusTextList,
} from 'constants';

import React, { Dispatch, SetStateAction } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { useDispatch, useSelector } from 'react-redux';

import { tutorialAssets } from 'assets/tutorial-assets';
import { updateAnalyticStatus, updateProfileTutorialStage, updateTaggScore } from 'store/actions';
import { RootState } from 'store/rootReducer';
import { ASYNC_STORAGE_KEYS, ProfileTutorialStage, TaggScoreActionsEnum } from 'types';
import { onCopyProfileLink } from 'utils';

interface SharePopups {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}
const SharePopupModal: React.FC<SharePopups> = ({ visible, setVisible }) => {
  const { username, userId: loggedInUserId } = useSelector((state: RootState) => state.user.user);
  const { analyticsStatus = '' } = useSelector((state: RootState) => state.user);
  const { profile_tutorial_stage } = useSelector((state: RootState) => state.user.profile);

  const dispatch = useDispatch();
  const image = tutorialAssets.shareProfileGif;

  const copyLinkCallback = async () => {
    AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.ANALYTICS_SHARE_POP,
      AsyncAnalyticsStatusTextList.ANALYTICS_SHARE_POP,
    );
    setVisible(false);
    dispatch(updateTaggScore(TaggScoreActionsEnum.PROFILE_SHARE, loggedInUserId));
    if (profile_tutorial_stage === ProfileTutorialStage.TRACK_LOGIN_AFTER_POST_MOMENT_1) {
      await dispatch(updateProfileTutorialStage(ProfileTutorialStage.SHOW_POST_MOMENT_2));
    }
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

  const ShareButton = () => (
    <View style={styles.buttonView}>
      <TouchableOpacity
        style={[styles.longButton]}
        onPress={() => {
          onCopyProfileLink(username, copyLinkCallback);
        }}>
        <Text style={[styles.buttonText]}>{SHARE_NOW}</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDismiss = async () => {
    setVisible(false);
    if (profile_tutorial_stage === ProfileTutorialStage.TRACK_LOGIN_AFTER_POST_MOMENT_1) {
      await dispatch(updateProfileTutorialStage(ProfileTutorialStage.SHOW_POST_MOMENT_2));
    }
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          console.log('Modal has been closed.');
        }}>
        <TouchableOpacity activeOpacity={1} style={styles.topModalClose} onPress={handleDismiss}>
          <Animatable.View animation="fadeIn" style={styles.topModalContainer}>
            <View style={[styles.popupContainer, {}]}>
              <Image source={image} style={styles.image} />
              <Text style={styles.text}>{SHARE_YOUR_PROFILE}</Text>
              <Text style={styles.discription}>{SAHRE_PROFILE_TUTORIAL_DIS}</Text>
              <ShareButton />
            </View>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  topModalContainer: {
    zIndex: 999999999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topModalClose: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: '5%',
  },
  image: {
    width: 220,
    height: 120,
    resizeMode: 'cover',
  },
  text: {
    width: '80%',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
    // fontFamily: 'SF Pro Text',
    marginTop: 8,
  },
  discription: {
    width: '90%',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    color: '#828282',
    padding: 8,
  },
  longButton: {
    width: '60%',
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5D81CB',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  buttonView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
export default SharePopupModal;
