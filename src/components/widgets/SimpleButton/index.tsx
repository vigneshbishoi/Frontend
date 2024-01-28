import React from 'react';

import { ActivityIndicator, Image, Text, TouchableOpacity, ViewStyle, View } from 'react-native';

import { SvgXml } from 'react-native-svg';

import { icons } from 'assets/icons/index';
import { images } from 'assets/images';

import styles from './styles';

interface Props {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loader?: boolean;
  containerStyles?: ViewStyle | ViewStyle[];
  isEditTagg?: boolean;
  updateTo2Coin?: boolean;
  tagg_score?: any;
}

const SimpleButton: React.FC<Props> = ({
  onPress,
  title,
  disabled,
  containerStyles,
  loader,
  isEditTagg = false,
  updateTo2Coin = false,
  tagg_score = 0,
}) => (
  <TouchableOpacity
    disabled={disabled}
    style={[styles.container, containerStyles, disabled && styles.disabled]}
    onPress={onPress}>
    {loader ? (
      <ActivityIndicator />
    ) : (
      <>
        {title == 'showCoinInText' ? (
          <Text style={styles.title}>
            Holding <Image source={images.main.score_coin} style={styles.coin} /> 250
          </Text>
        ) : updateTo2Coin ? (
          <View style={styles.direction}>
            <Text style={styles.title}>{title}</Text>
            {isEditTagg == true && (
              <>
                <Image source={images.main.score_coin} style={[styles.coin, styles.towcoin]} />
                <Text style={styles.title}>2</Text>
              </>
            )}
            {tagg_score < 2 && isEditTagg == true && (
              <SvgXml xml={icons.Info} height={17.5} width={17.5} style={styles.info} />
            )}
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </>
    )}
  </TouchableOpacity>
);

export default SimpleButton;
