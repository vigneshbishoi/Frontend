import React, { useEffect, useState } from 'react';

import { Text, View, StyleSheet } from 'react-native';

interface MomentCommentsOff {
  show?: boolean;
}

const MomentCommentsOff = ({ show }: MomentCommentsOff): React.ReactElement => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  useEffect(() => {
    if (show === true) {
      setShowBanner(true);
    }
    setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  }, [show]);

  return (
    <>
      {showBanner && (
        <View style={styles.Container}>
          <Text style={styles.textContainer}>{'Comment no longer available'}</Text>
        </View>
      )}
    </>
  );
};

export default MomentCommentsOff;
const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#4F4F4F',
    width: '98%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 5,
    elevation: 5,
    marginTop: 20,
    position: 'absolute',
    // top:5
  },
  textContainer: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, lineHeight: 16.71 },
});
