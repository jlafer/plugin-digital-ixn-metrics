import { Manager } from '@twilio/flex-ui';
import {messageSent} from './states';

export const setChatChannelCallbacks = (channelSid) => {
  console.log(`-----------setChatChannelCallbacks: channelSid:`, channelSid);
  const manager = Manager.getInstance();
  manager.chatClient.getChannelBySid(channelSid)
    .then((channel) => {
      console.log('--------------------setChatChannelCallbacks: got channel:', channel);
      channel.on('messageAdded', (message) => {
        onMessage(manager, channelSid, message);
      });
    });
};

export const onMessage = async (manager, channelSid, message) => {
  const {author, body} = message;
  const ts = Date.now();
  console.log(`--------------------messageAdded: author = ${author}`);
  console.log(`  body = ${body}`);
  const workerName = manager.workerClient.name.replace('@', '_40').replace('.', '_2E');
  console.log(`  worker = ${workerName}`);
  manager.store.dispatch( messageSent(channelSid, (author === workerName), ts) );
  if (author === workerName) {
  }
  else {
  }
};
