import { DELETE_ENDPOINT } from 'constants';

import * as React from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Modal, Text, View, Button } from 'react-native';
import { useDispatch } from 'react-redux';

import { logout } from 'store/actions';
import { userDeleteUpdate } from 'store/reducers';

import { styles } from './styles';

interface DeleteModalProps {
  title: string;
  description: string;
  visible?: boolean;
  username: string;
}

const DeleteModal = ({
  title = '',
  description = '',
  visible = false,
  username = '',
}: DeleteModalProps): React.ReactElement => {
  const dispatch = useDispatch();
  const DismissModal = () => {
    dispatch({
      type: userDeleteUpdate.type,
      payload: false,
    });
  };

  const DeleteButton = async () => {
    let token = await AsyncStorage.getItem('token');
    fetch(DELETE_ENDPOINT + `${username}/`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(response => response.text())
      .then(text => {
        if (text.length === 27) {
          dispatch({
            type: userDeleteUpdate.type,
            payload: false,
          });
          dispatch(logout());
        } else {
          dispatch({
            type: userDeleteUpdate.type,
            payload: false,
          });
        }
      });
  };

  return (
    <Modal visible={visible} animationType={'fade'} transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description1}>{description}</Text>
        </View>
        <View style={styles.mainContainerBtn}>
          <View style={styles.simpleBtn}>
            <Button
              color={'red'}
              title={'Delete'}
              onPress={() => {
                DeleteButton();
              }}
            />
          </View>
          <View style={styles.simpleBtn}>
            <Button
              color={'blue'}
              title="Cancel"
              onPress={() => {
                DismissModal();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteModal;
