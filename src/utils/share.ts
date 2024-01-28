import Clipboard from '@react-native-clipboard/clipboard';
import CameraRoll from '@react-native-community/cameraroll';
import { DeviceEventEmitter, Linking, Platform } from 'react-native';
import Share from 'react-native-share';
import { captureScreen } from 'react-native-view-shot';

import logger from 'utils/logger';

import { MomentPostType, ShareToType } from '../types';
import {
  downloadFileToCache,
  makeTaggProfileUrl,
  makeTaggRedirectUrl,
  saveMediaToCameraRoll,
} from './common';
import { copyProfileLinkToClipboard } from './users';
import { addTaggWatermark } from './watermark';

export const shareToSocial = async (
  shareTo: ShareToType,
  moment: MomentPostType,
  isVideo: boolean,
  callback?: () => void,
  username: string,
) => {
  switch (shareTo) {
    case 'Instagram':
      onLinkToIG(moment, isVideo);
      break;
    case 'Twitter':
      onLinkToTwitter(moment, username);
      break;
    case 'SMS':
      onSMS(moment, username);
      break;
    case 'Copy Link':
      if (callback) {
        onCopyLink(moment, username, callback);
      }
      break;
    case 'Others':
      onLinkToOthers(moment, isVideo);
      break;
    default:
      logger.error('Not supported');
      break;
  }
};

export const shareProfileToSocial = async (
  shareTo: ShareToType,
  username: string,
  callback?: () => void,
  shareTagg?: string,
) => {
  switch (shareTo) {
    case 'Messenger':
      if (shareTagg?.length > 0) {
        onProfileLinkToMessenger(`${username}/${shareTagg}`);
      } else {
        onProfileLinkToMessenger(username);
      }
      break;
    case 'Twitter':
      if (shareTagg?.length > 0) {
        onProfileLinkToTwitter(`${username}/${shareTagg}`);
      } else {
        onProfileLinkToTwitter(username);
      }
      break;
    case 'SMS':
      if (shareTagg?.length > 0) {
        onProfileToSMS(`${username}/${shareTagg}`);
      } else {
        onProfileToSMS(username);
      }
      break;
    case 'Copy Link':
      if (shareTagg?.length > 0) {
        onCopyProfileLink(`${username}/${shareTagg}`, callback);
      } else {
        onCopyProfileLink(username, callback);
      }
      break;
    case 'Instagram':
      if (shareTagg?.length > 0) {
        setTimeout(() => {
          onLinkToINSTA();
        }, 1500);
      } else {
        onLinkToINSTA();
      }
      break;
    case 'Others':
      if (shareTagg?.length > 0) {
        onProfileLinkToOthers(`${username}/${shareTagg}`);
      } else {
        onProfileLinkToOthers(username);
      }
      break;
    default:
      logger.error('Not supported');
      break;
  }
};

const onLinkToIG = async (moment: MomentPostType, isVideo: boolean) => {
  addTaggWatermark(
    await downloadFileToCache(moment.moment_url),
    moment.user.username,
    isVideo,
    async watermarkedMediaUri => {
      const localIdentifier = await saveMediaToCameraRoll(watermarkedMediaUri, isVideo);
      const encodedPath = encodeURIComponent(localIdentifier);
      Linking.openURL(`instagram://library?OpenInEditor=1&LocalIdentifier=${encodedPath}`);
    },
  );
};

const onLinkToINSTA = async () => {
  captureScreen({
    format: 'jpg',
    quality: 0.8,
  }).then(async uri => {
    let uris = await CameraRoll.save('file:///' + uri, {
      type: 'photo',
    });
    let path = uris.split('//')[1];
    const encodedPaths = encodeURIComponent(path);
    DeviceEventEmitter.emit('RemoveTaggShareScreen');
    Linking.openURL(`instagram://library?OpenInEditor=1&LocalIdentifier=${encodedPaths}`);
  });
};

const onProfileLinkToMessenger = async (username: string) => {
  Linking.openURL(`fb-messenger://share?link=${makeTaggProfileUrl(username)}`);
};

const onLinkToTwitter = async (moment: MomentPostType, username: string) => {
  Linking.openURL(`twitter://post?message=${makeMessage(moment)}?username=${username}`);
};

const onProfileLinkToTwitter = async (username: string) => {
  Linking.openURL(`twitter://post?message=${makeProfileMessage(username)}`);
};

const onSMS = async (moment: MomentPostType, username: string) => {
  const operator = Platform.select({ ios: '&', android: '?' });
  Linking.openURL(`sms:${operator}body=${makeMessage(moment)}?username=${username}`);
};

const onProfileToSMS = async (username: string) => {
  const operator = Platform.select({ ios: '&', android: '?' });
  Linking.openURL(`sms:${operator}body=${makeProfileMessage(username)}`);
};

const onLinkToOthers = async (moment: MomentPostType, isVideo: boolean) => {
  const name = moment.user.first_name + ' ' + moment.user.last_name;
  addTaggWatermark(
    await downloadFileToCache(moment.moment_url),
    moment.user.username,
    isVideo,
    watermarkedMediaUri => {
      Share.open({
        title: 'Share to Others',
        message: `Check out ${name}'s moment on Tagg!`,
        url: watermarkedMediaUri,
      });
    },
  );
};

const onProfileLinkToOthers = async (username: string) => {
  Share.open({
    title: 'Share to Others',
    message:
      username?.indexOf('/') >= 0 && username?.indexOf('/') != -1
        ? `Check out ${username.slice(0, username.indexOf('/') + 1)}'s tagg on Tagg!`
        : `Check out ${username}'s profile on Tagg!`,
    url: makeTaggProfileUrl(username),
  });
};

export const onCopyLink = async (
  moment: MomentPostType,
  username: string,
  callback: () => void,
) => {
  Clipboard.setString(`${makeTaggRedirectUrl(moment)}?username=${username}`);
  callback();
};

export const onCopyProfileLink = async (username: string, callback: () => void) => {
  copyProfileLinkToClipboard(username);
  callback();
};

const makeMessage = (moment: MomentPostType) => {
  const name = moment.user.first_name + ' ' + moment.user.last_name;
  const redirectUrl = makeTaggRedirectUrl(moment);
  return `Check out ${name}'s moment on Tagg! ${redirectUrl}`;
};

const makeProfileMessage = (username: string) => {
  const redirectUrl = makeTaggProfileUrl(username);

  if (username?.indexOf('/') >= 0 && username?.indexOf('/') != -1) {
    return `Check out ${username.slice(
      0,
      username.indexOf('/') + 1,
    )}'s tagg on Tagg! ${redirectUrl}`;
  } else {
    return `Check out ${username}'s profile on Tagg! ${redirectUrl}`;
  }
};
