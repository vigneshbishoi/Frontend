import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  content: {
    width: '95%',
    //height: 300,
    marginHorizontal: 10,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  lockIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    fontSize: 18,
    lineHeight: 21,
    marginTop: 25,
    marginHorizontal: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '90%',
    marginTop: 24,
    alignSelf: 'center',
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: '#828282',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginHorizontal: 10,
  },
  description1: {
    fontSize: 16,
    fontWeight: '400',
    color: '#828282',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
    marginHorizontal: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 30,
  },
  mainContainerBtn: {
    width: '94%',
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simpleBtn: {
    width: '49.1%',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  XIconContainer: {},
});
