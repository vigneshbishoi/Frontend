import { StyleSheet } from 'react-native';

import { normalize } from 'utils/layouts';

export const styles = StyleSheet.create({
  saveButton: {
    zIndex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: normalize(12),
    lineHeight: normalize(14.32),
    marginTop: 5,
    zIndex: 999,
  },
  flashButtonContainer: {
    zIndex: 3,
    height: 86,
    width: 49,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  flashButtonContainerBackground: {
    position: 'absolute',
    zIndex: 1,
    top: normalize(50),
    right: 0,
    marginRight: normalize(18),
    height: 86,
    width: 49,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  galleryIcon: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    width: 40,
    height: 40,
  },
  galleryIconEmpty: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    width: 40,
    height: 40,
    backgroundColor: 'grey',
  },
  blurView: {
    position: 'absolute',
    zIndex: 1,
    top: normalize(50),
    right: 0,
    marginRight: normalize(18),
    height: 86,
    width: 49,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24.5,
  },
  buttonStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23043A',
    padding: 5,
    marginVertical: 10,
    width: 315,
    height: 79,
    borderRadius: 10,
  },
  gallaryIcon: {
    borderRadius: 4,
    marginRight: 8,
  },
});
