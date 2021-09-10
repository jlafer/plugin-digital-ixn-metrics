import * as R from 'ramda';
import {Manager} from '@twilio/flex-ui';
import {messageSent} from './states';

export const setChatChannelCallbacks = (channelSid) => {
  const manager = Manager.getInstance();
  manager.chatClient.getChannelBySid(channelSid)
    .then((channel) => {
      channel.on('messageAdded', (message) => {
        onMessage(manager, channelSid, message);
      });
    });
};

export const onMessage = async (manager, channelSid, message) => {
  const {author, body} = message;
  const ts = Date.now();
  //console.log(`--------------------messageAdded: author = ${author}`);
  //console.log(`  body = ${body}`);
  const workerName = workerNameDecode(manager.workerClient.name);
  manager.store.dispatch( messageSent(channelSid, (author === workerName), ts) );
};

// addMetricsToTask :: (task, data) -> task.attributes
export const addMetricsToTask = (task, data) => {
  const conversations = R.mergeRight(task.attributes.conversations, data);
  return R.assoc('conversations', conversations, task.attributes);
};

const workerNameDecode = name =>
  name.replace('@', '_40').replace('.', '_2E').replace('+', '_2B');