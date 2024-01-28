import React, { useState } from 'react';

import {
  StyleProp,
  Text,
  TextStyle,
  View,
  Dimensions,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { isMentionPartType, parseValue, Part, PartType } from 'react-native-controlled-mentions';
import { TouchableOpacity } from 'react-native-gesture-handler';

import TaggTypeahead from '../components/common/TaggTypeahead';
import { TAGG_LIGHT_BLUE } from '../constants';
import { UserType } from '../types';
import { normalize } from './layouts';

/**
 * Part renderer
 *
 * https://github.com/dabakovich/react-native-controlled-mentions#rendering-mentioninputs-value
 */
const window = Dimensions.get('window');

const renderPart = (part: Part, index: number, handlePress: (user: UserType) => void) => {
  // Just plain text
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [moreBtnStatus, setmoreBtnStatus] = useState(false);
  const ExceedTextValue: number = 100;

  if (moreBtnStatus) {
    LayoutAnimation.linear();
    return (
      <>
        <Text style={style.captionText} key={index}>
          {part.text}
        </Text>
        <View style={style.mainViewText}>
          <Text
            onPress={() => {
              setmoreBtnStatus(false);
            }}
            style={style.textColor1}>
            Hide
          </Text>
        </View>
      </>
    );
  }

  if (!part.partType && part.text.length > ExceedTextValue) {
    LayoutAnimation.linear();
    return (
      <Text style={style.captionText} key={index}>
        {part.text.slice(0, ExceedTextValue)}
        <Text
          onPress={() => {
            setmoreBtnStatus(true);
          }}
          style={style.textColor}>
          ... More
        </Text>
      </Text>
    );
  }

  if (!part.partType) {
    return <Text key={index}>{part.text}</Text>;
  }

  // Mention type part
  if (isMentionPartType(part.partType)) {
    return (
      <TouchableOpacity
        key={`${index}-${part.data?.trigger}`}
        onPress={() => {
          if (part.data) {
            handlePress({
              userId: part.data.id,
              username: part.data.name,
            });
          }
        }}>
        <Text style={part.partType.textStyle}>{part.text}</Text>
      </TouchableOpacity>
    );
  }

  // Other styled part types
  return (
    <Text key={`${index}-pattern`} style={part.partType.textStyle}>
      {part.text}
    </Text>
  );
};

interface RenderProps {
  value: string;
  styles: StyleProp<TextStyle>;
  partTypes: PartType[];
  onPress: (user: UserType) => void;
}

/**
 * Value renderer. Parsing value to parts array and then mapping the array using 'renderPart'
 *
 * https://github.com/dabakovich/react-native-controlled-mentions#rendering-mentioninputs-value
 */
export const renderTextWithMentions: React.FC<RenderProps> = ({
  value,
  styles,
  partTypes,
  onPress,
}) => {
  const { parts } = parseValue(value, partTypes);
  return (
    <Text style={styles}>
      {parts.map((part, index) => renderPart(part, index, styles, onPress))}
    </Text>
  );
};

export const mentionPartTypes: (
  theme: 'blue' | 'white',
  component: 'caption' | 'comment',
  isShowBelowStyle?: boolean,
) => PartType[] = (theme, component, isShowBelowStyle = false) => [
  {
    trigger: '@',
    renderSuggestions: props => (
      <TaggTypeahead component={component} isShowBelowStyle={isShowBelowStyle} {...props} />
    ),
    allowedSpacesCount: 0,
    isInsertSpaceAfterMention: true,
    textStyle: _textStyle(theme),
  },
];

const _textStyle: (theme: 'blue' | 'white') => StyleProp<TextStyle> = theme => {
  switch (theme) {
    case 'blue':
      return {
        color: TAGG_LIGHT_BLUE,
        top: normalize(3),
      };
    case 'white':
    default:
      return {
        color: 'white',
        fontWeight: '800',
        top: normalize(3),
      };
  }
};

export const style = StyleSheet.create({
  captionText: {
    // position: 'relative',
    marginHorizontal: '5%',
    color: '#ffffff',
    fontWeight: '500',
    fontSize: normalize(13),
    letterSpacing: normalize(0.6),
    lineHeight: 21.09,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: normalize(5),
  },
  textColor: {
    color: 'white',
    fontWeight: '500',
  },
  textColor1: {
    color: 'white',
    fontWeight: '500',
  },
  mainViewText: {
    width: window.width - 100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
