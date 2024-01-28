import React, { useEffect, useLayoutEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DeviceEventEmitter, StatusBar, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { images } from 'assets/images';
import { LinksWidget } from 'components';
import GenericWidget from 'components/widgets/GenericWidget';
import SocialWidget from 'components/widgets/SocialWidget';
import VideoLinkWidget from 'components/widgets/VideoLinkWidget';
import { TaggShopData } from 'constants/widgets';
import { MainStackParams } from 'routes';
import {
  ApplicationLinkWidgetLinkTypes,
  ApplicationLinkWidgetTypes,
  GenericLinkWidgetTypes,
  SocialMediaTypes,
  VideoLinkWidgetLinkTypes,
  WidgetType,
} from 'types';
import { SCREEN_WIDTH } from 'utils';

type ShareTaggRouteProps = RouteProp<MainStackParams, 'ShareTaggScreen'>;

type ShareTaggNavigationProps = StackNavigationProp<MainStackParams, 'ShareTaggScreen'>;

interface ShareTaggScreenProps {
  route: ShareTaggRouteProps;
  navigation: ShareTaggNavigationProps;
}
const ShareTaggScreen: React.FC<ShareTaggScreenProps> = () => {
  const [itemData, setItemData] = useState({});
  const navigationDirect = useNavigation();

  useEffect(() => {
    getData();
    DeviceEventEmitter.addListener('RemoveTaggShareScreen', () => {
      navigationDirect.goBack();
    });
  }, []);

  useLayoutEffect(() => {
    navigationDirect.setOptions({
      headerShown: false,
    });
  }, []);

  const getData = async () => {
    const asyncAnalyticsStatus = await AsyncStorage.getItem('ShareTagg');
    setItemData(JSON.parse(asyncAnalyticsStatus));
  };

  const makeWidgetLogo = (type?: string) => {
    switch (type) {
      case VideoLinkWidgetLinkTypes.PINTEREST:
        return images.widgetLogo.Pinterest;
      case ApplicationLinkWidgetLinkTypes.YOUTUBE_MUSIC:
        return images.widgetLogo.Youtubemusic;
      case ApplicationLinkWidgetLinkTypes.TIDAL:
        return images.widgetLogo.Tidal;
      case VideoLinkWidgetLinkTypes.VSCO:
        return images.widgetLogo.vsco;
      case VideoLinkWidgetLinkTypes.ONLYFANS:
        return images.widgetLogo.onlyFans;
      case GenericLinkWidgetTypes.LIKETOKNOWIT:
        return images.widgetLogo.liketoknowttLogo;
      case GenericLinkWidgetTypes.WEBSITE:
        return images.widgetLogo.website;
      case GenericLinkWidgetTypes.DISCORD:
        return images.widgetLogo.discord;
      case GenericLinkWidgetTypes.EMAIL:
        return images.widgetLogo.email;
      case SocialMediaTypes.INSTAGRAM:
        return images.widgetLogo.instagram;
      case VideoLinkWidgetLinkTypes.TIKTOK:
        return images.widgetLogo.tiktok;
      case VideoLinkWidgetLinkTypes.YOUTUBE:
        return images.widgetLogo.youtube;
      case SocialMediaTypes.SNAPCHAT:
        return images.widgetLogo.snapchat;
      case SocialMediaTypes.TWITTER:
        return images.widgetLogo.twitter;
      case VideoLinkWidgetLinkTypes.TWITCH:
        return images.widgetLogo.twitch;
      case ApplicationLinkWidgetLinkTypes.DEEZER:
        return images.widgetLogo.deezer;
      case ApplicationLinkWidgetLinkTypes.SPOTIFY:
        return images.widgetLogo.spotify;
      case ApplicationLinkWidgetLinkTypes.APPLE_MUSIC:
        return images.widgetLogo.appleMusic;
      case GenericLinkWidgetTypes.ARTICLE:
        return images.widgetLogo.article;
      case ApplicationLinkWidgetLinkTypes.DEPOP:
        return images.widgetLogo.depop;
      case ApplicationLinkWidgetLinkTypes.ETSY:
        return images.widgetLogo.etsy;
      case ApplicationLinkWidgetLinkTypes.AMAZON:
        return images.widgetLogo.amazon;
      case ApplicationLinkWidgetLinkTypes.AMAZON_AFFILIATE:
        return images.widgetLogo.amazon;
      case ApplicationLinkWidgetLinkTypes.APPLE_PODCAST:
        return images.widgetLogo.applePodcast;
      case SocialMediaTypes.FACEBOOK:
        return images.widgetLogo.facebook;
      case ApplicationLinkWidgetLinkTypes.POSHMARK:
        return images.widgetLogo.poshmark;
      case ApplicationLinkWidgetLinkTypes.APP_STORE:
        return images.widgetLogo.appStore;
    }
  };

  const widget = (item: WidgetType) => {
    // const taggView = data?.individual.find(widget => widget.widget_id === item.id);
    const taggView = item.id;

    switch (item.type) {
      case ApplicationLinkWidgetTypes.APPLICATION_LINK:
        let enable = false;
        if (item.link_type == 'VSCO') {
          if (item.linkData?.siteName == undefined) {
            enable = true;
          } else {
            enable = false;
          }
        } else {
          enable = false;
        }
        return (
          <View>
            <LinksWidget
              data={item}
              fallbackImage={
                TaggShopData?.filter(tagg => tagg.link_type === item.link_type)[0]?.img
              }
              disabled
              VSCO={enable}
              widgetLogo={makeWidgetLogo(item.link_type)}
              taggClickCount={taggView?.views}
              background_url={item.background_url ?? ''}
              style={styles.taggView}
              innerStyle={styles.innerTaggView}
              titleStyle={styles.titleStyle}
            />
          </View>
        );
      case ApplicationLinkWidgetTypes.VIDEO_LINK:
        return (
          <VideoLinkWidget
            data={item}
            disabled
            widgetLogo={makeWidgetLogo(item.link_type)}
            taggClickCount={taggView?.views}
            style={styles.taggView}
            innerStyle={styles.innerTaggView}
            titleStyle={styles.titleStyle}
          />
        );
      case ApplicationLinkWidgetTypes.GENERIC_LINK:
        return (
          <GenericWidget
            data={item}
            disabled
            widgetLogo={makeWidgetLogo(item.link_type)}
            taggClickCount={taggView?.views}
            style={styles.taggView}
            innerStyle={styles.innerTaggView}
            titleStyle={styles.titleStyle}
          />
        );
      case ApplicationLinkWidgetTypes.SOCIAL:
        return (
          <SocialWidget
            data={item}
            disabled
            widgetLogo={makeWidgetLogo(item.link_type)}
            taggClickCount={taggView?.views}
            style={styles.taggView}
            innerStyle={styles.innerTaggView}
            titleStyle={styles.titleStyle}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <LinearGradient colors={['#0D0152', '#421566']} style={styles.container}>
      <>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>{widget(itemData)}</View>
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
  },
  taggView: {
    height: '100%',
    width: '100%',
  },
  innerTaggView: {
    height: '32.5%',
    width: '70%',
    marginTop: '40%',
  },
  titleStyle: { fontSize: 30, marginTop: 20 },
});

export default ShareTaggScreen;
