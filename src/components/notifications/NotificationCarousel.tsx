import React, { useRef, useState } from 'react';

import {
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { SvgXml } from 'react-native-svg';
import Video from 'react-native-video';

import { Videos } from 'assets';
import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { AnalyticCategory, AnalyticVerb } from 'types';
import { normalize, SCREEN_HEIGHT, SCREEN_WIDTH, track } from 'utils';

export const NotificationCarousel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const onTikTokImageClick = () => {
    track('NotificationCrouselOne', AnalyticVerb.Pressed, AnalyticCategory.Notification);
    Linking.openURL('https://www.tiktok.com/t/ZTdt61VEm/');
  };
  const onCoinIntroductionClick = () => {
    track('NotificationCrouselTwo', AnalyticVerb.Pressed, AnalyticCategory.Notification);
    setShowVideo(true);
  };
  const onCommunityImageClick = () => {
    track('NotificationCrouselThree', AnalyticVerb.Pressed, AnalyticCategory.Notification);
    Linking.openURL('https://my.community.com/tagg');
  };
  const data = [
    {
      key: 'merchandise_drop',
      bgImage: images.main.tikTokImg,
      onPress: onTikTokImageClick,
    },
    {
      key: 'coin_introduction',
      bgImage: images.main.coinIntroductionImg,
      onPress: onCoinIntroductionClick,
    },
    {
      key: 'join_community',
      bgImage: images.main.communityCarouselImg,
      onPress: onCommunityImageClick,
    },
  ];
  const renderItem: (item: any) => Object = ({ item }) => (
    <Pressable onPress={() => item.onPress()}>
      <ImageBackground source={item.bgImage} style={styles.carouselImage} />
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <Carousel
        data={data}
        renderItem={renderItem}
        sliderWidth={SCREEN_WIDTH}
        itemWidth={SCREEN_WIDTH}
        onSnapToItem={setCurrentPage}
        autoplay={true}
        loop={true}
        autoplayInterval={4000}
      />
      <Pagination
        activeDotIndex={currentPage}
        dotsLength={data.length}
        containerStyle={styles.paginationStyle}
        dotColor={'#FFFFFF'}
        inactiveDotColor={'#FFFFFF'}
        inactiveDotOpacity={0.8}
        dotStyle={styles.paginationDotStyle}
      />
      <Modal transparent visible={showVideo}>
        <View style={styles.modalWrapper}>
          <TouchableOpacity style={styles.closeIconWrapper} onPress={() => setShowVideo(false)}>
            <SvgXml
              xml={icons.BackArrow}
              height={normalize(18)}
              width={normalize(18)}
              color={'#ffff'}
              style={[styles.backButtonShadow]}
            />
          </TouchableOpacity>
          <Video
            ref={videoRef}
            onEnd={() => setShowVideo(false)}
            resizeMode={'cover'}
            volume={1}
            ignoreSilentSwitch={'ignore'}
            playInBackground={false}
            source={Videos.coin_introduction_video}
            style={styles.video}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  video: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeIconWrapper: {
    position: 'absolute',
    top: 60,
    left: 32,
    zIndex: 1,
  },
  modalWrapper: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButtonShadow: {
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  paginationStyle: {
    position: 'absolute',
    bottom: -20,
    alignItems: 'center',
    width: '100%',
  },
  carouselImage: {
    width: '100%',
    height: 190,
  },
  paginationDotStyle: {
    marginHorizontal: -4,
  },
});

export default NotificationCarousel;
