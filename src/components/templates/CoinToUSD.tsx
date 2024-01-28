import React from 'react';

import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { COIN_TO_USD } from 'constants/strings';
import { RootState } from 'store/rootReducer';
import { normalize, SCREEN_WIDTH } from 'utils';

interface CoinToUSDProps extends ViewProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CoinToUSD: React.FC<CoinToUSDProps> = props => {
  const { isOpen, setIsOpen } = props;
  const { tagg_score, coin_to_usd } = useSelector((state: RootState) => state.user.profile);

  const HandleDecimale = coin_to_usd?.charAt(coin_to_usd?.indexOf('.') + 1);

  return (
    <Modal animationType="fade" transparent visible={isOpen}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.container}
        onPress={() => setIsOpen(!isOpen)}>
        <LinearGradient
          colors={['#0A004E', '#8F00FF']}
          useAngle={true}
          angle={154.72}
          angleCenter={{ x: 0.5, y: 0.5 }}
          style={{ borderRadius: normalize(8) }}>
          <View style={styles.mainView} onStartShouldSetResponder={() => true}>
            <Image style={styles.coinImg} source={icons.Coins} resizeMode={'cover'} />
            <View style={styles.coinView}>
              <Text style={styles.coinText}>{tagg_score}</Text>
              <Image
                source={images.main.score_coin}
                style={styles.singlecoinImg}
                resizeMode={'cover'}
              />
              <View style={{ marginHorizontal: normalize(14) }}>
                <View style={styles.equalLine} />
                <View style={[styles.equalLine, { marginTop: normalize(7) }]} />
              </View>
              <Text style={styles.usdText}>
                {coin_to_usd != undefined && HandleDecimale == 0
                  ? parseInt(coin_to_usd)
                  : HandleDecimale != 0
                  ? coin_to_usd
                  : 0}
                <Text style={styles.usdTextUpdate}> USD</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsOpen(!isOpen)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.descriptionText}>{COIN_TO_USD}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  mainView: {
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: normalize(24),
    borderRadius: normalize(8),
  },
  coinImg: {
    width: normalize(108),
    height: normalize(88),
    marginBottom: normalize(16),
  },
  singlecoinImg: {
    width: normalize(27),
    height: normalize(27),
    marginTop: normalize(2),
  },
  coinView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
    flexWrap: 'wrap',
  },
  coinText: {
    fontSize: normalize(22),
    color: 'white',
    alignItems: 'center',
    fontWeight: '500',
    justifyContent: 'center',
  },
  usdText: {
    fontSize: normalize(22),
    alignItems: 'center',
    fontWeight: '600',
    color: '#70E76E',
    justifyContent: 'center',
  },
  usdTextUpdate: {
    fontSize: normalize(15),
    fontWeight: '500',
    color: '#70E76E',
  },
  equalLine: {
    width: normalize(20),
    borderWidth: normalize(1.4),
    borderColor: 'white',
  },
  closeText: {
    color: 'white',
    fontSize: normalize(13),
    fontWeight: '600',
  },
  closeButton: {
    width: '100%',
    backgroundColor: 'black',
    height: normalize(27),
    borderRadius: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  descriptionText: {
    color: 'white',
    fontSize: normalize(11),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CoinToUSD;
