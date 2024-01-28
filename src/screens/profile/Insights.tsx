import React, { useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import { Text, SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useDispatch, useSelector } from 'react-redux';

import { AddTag } from 'components/addTag/AddTag';
import { MomentChart } from 'components/charts/MomentChart';
import { ProfileLinkChart } from 'components/charts/ProfileLinkChart';
import { ViewsChart } from 'components/charts/ViewsChart';
import { Divider } from 'components/divider/Divider';
import { RangePicker } from 'components/rangePicker';

import {
  getFriendTotal,
  getProfileLinks,
  getMomentInsightsSummary,
  getProfileViewsSummary,
  getTaggClicksSummary,
  dailyEarnCoin,
} from 'services';
import { RootState } from 'store/rootReducer';
import { AnalyticCategory, AnalyticVerb, ProfileInsightsEnum } from 'types';
import { track, normalize, SCREEN_WIDTH } from 'utils';
import { getTokenOrLogout } from 'utils/users';

import { icons } from '../../assets/icons';

export const Insights = props => {
  const {
    user: { userId },
  } = useSelector((state: RootState) => state.user);
  const navigation = useNavigation();
  const [insights, setInsights] = useState(ProfileInsightsEnum.Week);
  let type = props?.route?.params?.reward;
  const [data, setData] = useState({
    profile: {
      total_views: 0,
    },
    moments: {
      title: '',
      labels: [],
      graph: [],
      range: '',
    },
    tagg: {
      total: '',
      top_tagg: {
        title: '',
        link_type: '',
        views: 0,
        image: '',
      },
      range: '',
    },
    friend: {
      total: '',
      gender: [],
      ageRange: [],
      location: [],
      range: '',
    },
    profileLinks: {
      totalClicks: '',
      clickConversion: '',
      range: '',
    },
    userCoin: {
      today_score_added: '',
      today_score_decrease: '',
    },
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const token = await getTokenOrLogout(dispatch);
      const profile = (await getProfileViewsSummary(token, userId, insights)) as any;
      const moments = (await getMomentInsightsSummary(userId, insights)) as any;
      const tagg = (await getTaggClicksSummary(token, userId, insights)) as any;
      const friend = (await getFriendTotal(userId, insights)) as any;
      const profileLinks = (await getProfileLinks(userId, insights)) as any;
      const userCoin = (await dailyEarnCoin(userId)) as any;
      setData({ profile, moments, tagg, friend, profileLinks, userCoin });
    };
    init();
  }, [userId, insights]);
  const routeTaggScreen = () => {
    track('TaggClickCount', AnalyticVerb.Pressed, AnalyticCategory.Insights);
    track('todayEarned', AnalyticVerb.Finished, AnalyticCategory.Profile, {
      todayEarnedCoin: data.userCoin.today_score_added,
      todaySpendCoin: data.userCoin.today_score_decrease,
    });
    navigation.navigate('TaggClickCountScreen');
  };
  const routePopularMoment = () => {
    track('MomentViews', AnalyticVerb.Pressed, AnalyticCategory.Insights);
    track('todayEarned', AnalyticVerb.Finished, AnalyticCategory.Profile, {
      todayEarnedCoin: data.userCoin.today_score_added,
      todaySpendCoin: data.userCoin.today_score_decrease,
    });
    navigation.navigate('MostPopularMoment');
  };
  const routeProfileLink = () => {
    // navigation.navigate('ProfileLinks');
  };
  const routeProfileViews = () => {
    navigation.navigate('ProfileViewsInsights');
  };
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarVisible: false,
    });
  }, []);

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            {
              type == 'insights' ? navigation.navigate('LeaderBoardScreen') : navigation.goBack();
            }
          }}>
          <SvgXml
            xml={icons.BackArrow}
            height={normalize(18)}
            width={normalize(18)}
            color="black"
            style={[styles.backButton]}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Insights</Text>
      </View>
      <View style={styles.container}>
        <RangePicker insights={insights} changeInsights={setInsights} />
        <Divider />
        <ScrollView>
          <ViewsChart onPress={routeProfileViews} profile={data.profile} insights={insights} />
          <Divider />
          <AddTag onPress={routeTaggScreen} tagg={data.tagg} />
          <Divider />
          <MomentChart insights={insights} moments={data.moments} route={routePopularMoment} />
          <Divider />
          <ProfileLinkChart
            isLocked={true}
            onPress={routeProfileLink}
            linkClicks={data.profileLinks}
          />
          <Divider />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { paddingVertical: 18, flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  date: {
    paddingHorizontal: 10,
    fontWeight: '700',
  },
  backButton: {
    marginLeft: 30,
  },
  header: {
    width: SCREEN_WIDTH * 0.62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  headerText: {
    alignSelf: 'center',
    fontWeight: '700',
    fontSize: normalize(18),
    lineHeight: normalize(25),
  },
});
