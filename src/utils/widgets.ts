// @ts-ignore
// import LinkPreview from 'react-native-link-preview'; //old link preview library, is outdated and does not support timeouts
import { getLinkPreview } from 'link-preview-js';

import {
  ApplicationLinkWidgetLinkTypes,
  GenericLinkWidgetTypes,
  MomentWidgetType,
  VideoLinkWidgetLinkTypes,
} from 'types';

export async function generateLinkData(
  url: string,
  link_type?: ApplicationLinkWidgetLinkTypes | VideoLinkWidgetLinkTypes | MomentWidgetType,
): Promise<any> {
  if (url !== undefined && !(url.startsWith('https://') || url.startsWith('http://'))) {
    url = 'https://' + url;
  }

  let linkData = {
    images: [''],
    title: '',
  };
  try {
    if (
      link_type === VideoLinkWidgetLinkTypes.YOUTUBE ||
      link_type === ApplicationLinkWidgetLinkTypes.YOUTUBE_MUSIC
    ) {
      let data;
      if (
        url.match(
          /^(http|https)?:\/\/(?:www\.)?youtube\.com(?:.*|\/)\?(?=.*=((\w|-){3}))(?:\S+)?$/i,
        )
      ) {
        data = await fetch(`https://noembed.com/embed?url=${url}`).then(data => data.json());
      } else if (url.includes('channel') || url.includes('c') || url.includes('user')) {
        data = await fetch(`https://noembed.com/embed?url=${url}`).then(data => data.json());
        if (!data.title) {
          data.title = 'Youtube';
          data.thumbnail_url = '';
        }
      } else {
        const uri = url.replace('youtu', 'youtube').replace('.be/', '.com/watch?v=');
        data = await fetch(`https://noembed.com/embed?url=${uri}`).then(data => data.json());
      }

      linkData = {
        images: [data.thumbnail_url],
        title: data.title,
      };
    } else {
      linkData = await getLinkPreview(url, {
        // imagesPropertyType: "og", // fetches only open-graph images
        headers: {
          'user-agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
          // "Accept-Language": "en-US", // fetches site for English language
          // ...other optional HTTP request headers
        },
        timeout: 2000,
      }).then();
      // linkData = await LinkPreview.getPreview(url); //old library - this hangs sometimes!
    }

    if (link_type === GenericLinkWidgetTypes.EMAIL && url.includes('@')) {
      linkData.images = [''];
    }

    return linkData;
  } catch (e) {
    return linkData;
  }
}
