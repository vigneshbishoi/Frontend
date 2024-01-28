import React from 'react';

import { TouchableOpacity } from 'react-native';
import { ImageOrVideo } from 'react-native-image-crop-picker';

import { SvgXml } from 'react-native-svg';

import { AnalyticCategory, AnalyticVerb } from 'types';
import { track } from 'utils/analytics';
import { navigateToMediaPicker } from 'utils/camera';

import { icons } from '../../assets/icons';
import { styles } from './styles';

interface GalleryIconProps {
  callback: (media: ImageOrVideo) => void;
}

/*
 * Displays the most recent photo in the user's gallery
 * On click, navigates to the image picker
 */
export const GalleryIcon: React.FC<GalleryIconProps> = ({ callback }) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={() => {
      track('GalleryIcon', AnalyticVerb.Pressed, AnalyticCategory.Camera);
      navigateToMediaPicker(callback);
    }}
    style={styles.buttonStyle}>
    <SvgXml
      xml={icons.gallary}
      height={35}
      width={35}
      color="#FFFFFF"
      style={[styles.gallaryIcon]}
    />
    <SvgXml xml={icons.plus} height={18} width={18} color="#FFFFFF" />
  </TouchableOpacity>
);

export default GalleryIcon;
