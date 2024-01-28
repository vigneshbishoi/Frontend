import React, { useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/core';
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import ImagePicker2 from 'react-native-image-crop-picker';
import { SvgXml } from 'react-native-svg';

import { useDispatch, useSelector } from 'react-redux';

import { icons } from 'assets/icons';

import { images } from 'assets/images';

import TaggBGModal from 'components/TaggBGModal/TaggBGModal';
import { bgTypes } from 'screens/widgets/AddTagg';

import styles from 'screens/widgets/AddTagg/styles';

import { createThumbnailForTaggs } from 'services';

import { RootState } from 'store/rootReducer';
import { AnalyticCategory, AnalyticVerb, RewardType } from 'types';
import { getTokenOrLogout, track } from 'utils';

export const ImagePicker = ({
  cbForCustomThumbnailBackground,
  activeBgType,
  tmbb,
  screenType,
  userBGTaggEligiblity,
  setActiveBgType,
}: any) => {
  const {
    unLockBG,
    // taggEligiblity
  } = userBGTaggEligiblity;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tagg_score = useSelector((state: RootState) => state.user.profile.tagg_score);

  const [unlockImage, setUnlockImage] = useState<boolean>(false);
  const [bgImg, setbgImg] = useState<any>(tmbb);
  const [isLockVisible, setIsLockVisible] = useState<boolean>(false);

  const openImage = async () => {
    ImagePicker2.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      smartAlbums: ['Favorites', 'RecentlyAdded', 'SelfPortraits', 'Screenshots', 'UserLibrary'],
    }).then(async image => {
      const token = await getTokenOrLogout(dispatch);
      const filename = Math.floor(Math.random() * 1000000000) + '' + image.filename;
      const res = await createThumbnailForTaggs({ filename }, token);
      setbgImg(image.path);
      cbForCustomThumbnailBackground(
        {
          name: filename,
          type: image.mime,
          uri: image.path,
        },
        res.response_url.fields,
        res.image_path,
        res.response_url.url,
      );
      setActiveBgType(bgTypes.IMAGE);
    });
  };

  const onUnlock = () => {
    setIsLockVisible(false);
    track('UnlockImage', AnalyticVerb.Pressed, AnalyticCategory.Taggs);
    setTimeout(() => {
      navigation.navigate('UnwrapReward', {
        rewardUnwrapping: RewardType.IMAGE_BACKGROUNG_TO_MOMENT_TAGG,
        screenType,
      });
    }, 500);
  };
  const onPressHandler = () => {
    if (!unLockBG || !unlockImage) {
      return setIsLockVisible(true);
    }
    openImage();
  };

  useEffect(() => {
    if (tmbb) {
      setbgImg(bgImg);
    }
  }, [tmbb]);

  useEffect(() => {
    if (!unLockBG || tagg_score <= 200) {
      setUnlockImage(false);
    } else {
      setUnlockImage(true);
    }
  }, [unLockBG]);

  useEffect(() => {
    if (
      bgTypes.SOLID === activeBgType ||
      bgTypes.GRADIENT === activeBgType ||
      bgTypes.NONE === activeBgType
    ) {
      setbgImg('');
    }
  }, [activeBgType]);
  return (
    <>
      <TouchableWithoutFeedback disabled={false} onPress={onPressHandler}>
        <View
          style={[
            styles.bgType,
            styles.bgTypeImage,
            activeBgType === bgTypes.IMAGE ? styles.activeBgType : {},
          ]}>
          <Image
            source={bgImg ? { uri: bgImg } : images.taggsShop.chessBg}
            style={styles.bgImage}
          />
          <View style={styles.bgTypeImageViewLocked}>
            {!unlockImage && <SvgXml xml={icons.WhiteLock} width={14} height={14} />}
            <Text style={styles.bgTypeText}>Image</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TaggBGModal
        visible={isLockVisible}
        disabled={tagg_score <= 200}
        setVisible={setIsLockVisible}
        onPress={onUnlock}
      />
      {/* <LockedModal
        visible={isLockVisible}
        setVisible={setIsLockVisible}
        onPress={() => setIsLockVisible(false)}
      /> */}
    </>
  );
};
