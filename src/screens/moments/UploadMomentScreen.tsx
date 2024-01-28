import React, { useEffect, useCallback, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import CameraRoll from '@react-native-community/cameraroll';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import debounce from 'lodash/debounce';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SvgXml } from 'react-native-svg';
import Video from 'react-native-video';

import { useDispatch, useStore } from 'react-redux';

import { images } from 'assets/images';
import { GalleryIcon } from 'components';
import { MainStackParams } from 'routes';
import { AnalyticCategory, AnalyticVerb } from 'types';
import { isUrlAVideo, normalize, SCREEN_HEIGHT, track, navigateToProfile, fetchUserX } from 'utils';

import { showGIFFailureAlert } from 'utils/camera';
import logger from 'utils/logger';

import { icons } from '../../assets/icons';

import { getToprthreeUsermoment } from '../../services/LeaderBoardService';

type UploadMomentScreenRouteProps = RouteProp<MainStackParams, 'UploadMomentScreen'>;

export type UploadMomentScreenNavigationProps = StackNavigationProp<
  MainStackParams,
  'UploadMomentScreen'
>;
interface UploadMomentScreenProps {
  route: UploadMomentScreenRouteProps;
  navigation: UploadMomentScreenNavigationProps;
}
const UploadMomentScreen: React.FC<UploadMomentScreenProps> = ({ route }) => {
  const state = useStore().getState();
  const dispatch = useDispatch();
  const [mostRecentPhoto, setMostRecentPhoto] = useState<string>('');
  const { screenType, selectedCategory, viaPostNow } = route;
  const [Moments, setMoment] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      Topthreeusermoment();
    }
  }, [isFocused]);

  useEffect(() => {
    CameraRoll.getPhotos({ first: 1 })
      .then(lastPhoto => {
        if (lastPhoto.edges.length > 0) {
          const image = lastPhoto.edges[0].node.image;
          setMostRecentPhoto(image.uri);
        }
      })
      .catch(_err => logger.log('Unable to fetch preview photo for gallery'));
  }, []);
  const navigateToEditMedia = (uri: string) => {
    const isVideo = isUrlAVideo(uri);
    track(
      viaPostNow ? 'PostNowPopupToSelectMedia' : 'SelectMedia',
      AnalyticVerb.Pressed,
      AnalyticCategory.MomentUpload,
    );

    navigation.navigate('EditMedia', {
      screenType,
      media: {
        uri,
        isVideo,
      },
      selectedCategory,
      viaPostNowPopup: viaPostNow,
    });
  };
  const navigationHandler = useCallback(
    debounce(
      data => {
        navigateToProfile(state, dispatch, navigation, screenType, {
          userId: data?.user.id,
          username: data?.user.username,
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
  const navigateToMoment = useCallback(
    debounce(
      async (data: any) => {
        await fetchUserX(
          dispatch,
          { userId: data?.user?.id, username: data?.user?.username },
          screenType,
        );

        const object = { moment_id: data?.moment, moment_category: data?.moment_category };
        navigation.push('IndividualMoment', {
          moment: object,
          userXId: data?.user?.id,
          screenType,
        });
      },
      400,
      { leading: true, trailing: false },
    ),
    [],
  );
  const Topthreeusermoment = async () => {
    const moment = await getToprthreeUsermoment();
    setMoment(moment);
  };

  return (
    <>
      <LinearGradient colors={['#4E0E80', '#20003A']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ScrollView>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.exitIconbutton}
                onPress={async () => {
                  // navigation.goBack()
                  await AsyncStorage.setItem('MomentPage', '');
                  DeviceEventEmitter.emit('UploadLeader', { show: false });
                  DeviceEventEmitter.emit('UploadProfile', { show: false });
                }}>
                <SvgXml
                  xml={icons.exit}
                  height={normalize(18)}
                  width={normalize(18)}
                  color="black"
                  style={[styles.exitIcon]}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create a Moment</Text>
            </View>
            <View style={styles.buttonBox}>
              <GalleryIcon
                mostRecentPhotoUri={mostRecentPhoto}
                callback={media => {
                  const filename = media.filename;
                  track(
                    'SelectingMediaFromGallery',
                    AnalyticVerb.Finished,
                    AnalyticCategory.Camera,
                    {
                      fileType: filename?.split('.').pop(),
                    },
                  );
                  if (filename && (filename.endsWith('gif') || filename.endsWith('GIF'))) {
                    showGIFFailureAlert(() => navigateToEditMedia(media.path));
                  } else {
                    navigateToEditMedia(media.path);
                  }
                }}
              />
            </View>
            <Text style={styles.uploadTitle}>Upload Video Content</Text>
            <Text style={styles.contentTitle}>Engaging content earns coins</Text>
            <View style={styles.dataWrapper}>
              {Moments && !!Moments.length ? (
                <>
                  {Moments &&
                    Moments.map((item: any) => (
                      <>
                        <View style={styles.imageContainer}>
                          <Pressable
                            style={styles.videoContainer}
                            onPress={() => navigateToMoment(item)}>
                            {item.moment_url.toString().endsWith('mp4') ? (
                              <>
                                <Video
                                  source={{
                                    uri: item.moment_url,
                                  }}
                                  // onLoadStart={() => setLoading(true)}
                                  // onReadyForDisplay={() => setLoading(false)}
                                  style={styles.videoContainer}
                                  resizeMode={'cover'}
                                  ignoreSilentSwitch={'obey'}
                                  volume={1}
                                  repeat={true}
                                />
                                <SvgXml
                                  xml={icons.playicon}
                                  height={25}
                                  width={18.95}
                                  color="black"
                                  style={[styles.playicon]}
                                />
                              </>
                            ) : (
                              <Image
                                style={styles.videoContainer}
                                source={{ uri: item.moment_url }}
                              />
                            )}
                          </Pressable>
                          <Pressable
                            style={styles.userprofile}
                            onPress={() => navigateToUserProfile(item)}>
                            <Image
                              style={styles.profileimage}
                              source={images.main.profile_default}
                            />
                            <Image
                              style={styles.profileimageData}
                              source={
                                item.user.profile
                                  ? { uri: item.user.profile }
                                  : images.main.profile_default
                              }
                            />
                            <Text style={styles.username}>{item.user.username}</Text>
                          </Pressable>
                          <View style={styles.rectangleContainer}>
                            <View style={styles.coincontain}>
                              <Image source={icons.MomentCoin2} style={styles.CoinsImage} />
                              <Text style={styles.Maxcoin}> +{parseInt(item?.Moment_coins)}</Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ))}
                </>
              ) : (
                <View style={[styles.loadingImg, { marginTop: SCREEN_HEIGHT * 0.2 }]}>
                  <Image
                    source={require('assets/gifs/loading-animation.gif')}
                    style={styles.image}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rectangleContainer: {
    bottom: 0,
    height: 135,
    width: 275,
    borderRadius: 12,
    backgroundColor: '#5F298A',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataWrapper: {
    marginTop: 9,
    paddingBottom: 100,
  },
  imageContainer: {
    justifyContent: 'flex-end',
    marginTop: 24,
    height: 221,
    width: 315,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28.13,
    color: '#FFFFFF',
  },
  exitIconbutton: {
    height: 18,
    width: 18,
    position: 'absolute',
    left: 28,
  },
  exitIcon: {
    height: 18,
    width: 18,
    position: 'absolute',
    left: 0,
  },

  buttonBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 39,
  },
  buttonStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23043A',
    padding: 5,
    marginVertical: 10,
    width: 304,
    height: 79,
    borderRadius: 10,
  },
  gallaryIcon: {
    borderRadius: 4,
    marginRight: 8,
  },
  uploadTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18.28,
    color: '#FFFFFF',
  },
  contentTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28.13,
    color: '#FFFFFF',
    marginTop: 39,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    height: 210,
    width: 110,
    borderRadius: 10,
    zIndex: 1,
  },
  profileimage: {
    width: 39,
    height: 39,
    borderRadius: 20,
    left: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileimageData: {
    width: 39,
    height: 39,
    borderRadius: 20,
    left: 5,
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  userprofile: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    width: 120,
    height: 40,
    top: 167,
    left: 84,
    zIndex: 1,
  },
  username: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 25,
    color: '#FFFFFF',
    left: 10,
  },

  coincontain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    position: 'absolute',
    width: 162,
    height: 36,
    left: 100,
    top: 35,
  },
  CoinsImage: {
    height: 36,
    width: 36,
  },
  Maxcoin: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25.62,
    color: '#FFFFFF',
  },
  playicon: {
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 1,
    left: 45.5,
    right: '12.1%',
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

export default UploadMomentScreen;
