import * as R from 'ramda';
import * as Flex from '@twilio/flex-ui';
import {FlexPlugin} from 'flex-plugin';
import {getPluginConfiguration} from 'jlafer-flex-util';

import reducers, {namespace, initiateChatMetrics, terminateChatMetrics, setExecutionContext} from './states';
import {verifyAndFillConfiguration} from './configHelpers';
import {addMetricsToTask} from './helpers';

const PLUGIN_NAME = 'PluginDigitalIxnMetrics';

const afterAcceptTask = R.curry((manager, payload) => {
  const {store} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName, attributes, sourceObject} = task;
  const {channelSid} = attributes;
  //console.log(`${PLUGIN_NAME}.afterAcceptTask: channel = ${taskChannelUniqueName}`);
  console.log('  task:', task);
  console.log('  sourceObject:', sourceObject);
  if (taskChannelUniqueName !== 'voice') {
    dispatch( initiateChatMetrics(task.sid, channelSid, sourceObject.dateCreated.getTime()) );
  };
});

const afterCompleteTask = R.curry((manager, payload) => {
  const {store} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName} = task;
  if (taskChannelUniqueName !== 'voice') {
    const state = store.getState()[namespace].appState;
    const {chats, config} = state;
    const chat = chats[task.sid];
    const data = getConfiguredMetrics(config, chat);
    updateTaskConversations(task, data);
    dispatch( terminateChatMetrics(task.sid) );
  }
});

const getConfiguredMetrics = (config, chat) => {
  if (chat.agentReplyCnt > 0) {
    chat.agentAvgReplyTime = chat.agentReplyTime / chat.agentReplyCnt;
  }
  else {
    chat.agentAvgReplyTime = null;
    chat.timeToFirstAgentMsg = null;
  }
  chat.customerAvgReplyTime = (chat.customerReplyCnt > 0)
    ? chat.customerReplyTime / chat.customerReplyCnt
    : null;

  return R.toPairs(config.attributes).reduce(
    (accum, [fld, src]) => 
      {
        const value = (typeof chat[src] === 'number')
          ? Math.round(chat[src])
          : null;
        return {...accum, [fld]: value}
      },
    {}
  )
};

// NOTE: mutates task attributes
const updateTaskConversations = (task, data) => {
  return new Promise((resolve, reject) => {
    const attributes = addMetricsToTask(task, data);
    task.setAttributes(attributes)
    resolve(`task attributes updated`);
  });
};

export default class PluginDigitalIxnMetrics extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    console.log(`${PLUGIN_NAME}: initializing in Flex ${Flex.VERSION} instance`);

    // get the Flex configuration
    const rawConfig = getPluginConfiguration(manager, PLUGIN_NAME);
    const config = verifyAndFillConfiguration(rawConfig);
    console.log(`${PLUGIN_NAME}: configuration:`, config);

    const {store} = manager;
    store.addReducer(namespace, reducers);
    store.dispatch( setExecutionContext({config}) );

    flex.Actions.addListener("afterAcceptTask", afterAcceptTask(manager));
    flex.Actions.addListener("afterCompleteTask", afterCompleteTask(manager));
  }
}
