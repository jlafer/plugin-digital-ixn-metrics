import * as R from 'ramda';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import {getPluginConfiguration} from 'jlafer-flex-util';

import reducers, {namespace, initiateChatMetrics, terminateChatMetrics, setExecutionContext} from './states';
import {verifyAndFillConfiguration} from './configHelpers';
import { addMetricsToTask } from './helpers';

const PLUGIN_NAME = 'PluginDigitalIxnMetrics';

const afterAcceptTask = R.curry((manager, payload) => {
  const {store, workerClient} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName, attributes} = task;
  const {channelSid} = attributes;
  console.log(`----------------------${PLUGIN_NAME}.afterAcceptTask: channel = ${taskChannelUniqueName}`);
  console.log('  task:', task);
  console.log('  tasks:', workerClient.tasks);
  if (taskChannelUniqueName !== 'voice') {
    const ts = Date.now();
    dispatch( initiateChatMetrics(task.sid, channelSid, ts) );
  };
});

const afterCompleteTask = R.curry((manager, payload) => {
  console.log('--------------------afterCompleteTask; called');
  const {store} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName} = task;
  if (taskChannelUniqueName !== 'voice') {
    const state = store.getState()[namespace].appState;
    const {chats, config} = state;
    console.log('--------------------afterCompleteTask; config:', config);
    const chat = chats[task.sid];
    console.log('--------------------final chat stats:', chat);
    const data = getConfiguredMetrics(config, chat);
    console.log('--------------------afterCompleteTask; configured stats:', data);
    updateTaskConversations(task, data);
    dispatch( terminateChatMetrics(task.sid) );
  }
});

const getConfiguredMetrics = (config, chat) => {
  if (chat.agentReplyCnt > 0) {
    chat.agentAvgReplyTime = chat.agentReplyDur / chat.agentReplyCnt;
  }
  else {
    chat.agentAvgReplyTime = null;
    chat.timeToFirstAgentMsg = null;
  }
  chat.customerAvgReplyTime = (chat.customerReplyCnt > 0)
    ? chat.customerReplyDur / chat.customerReplyCnt
    : null;

  return R.toPairs(config.fields).reduce(
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

// mutates task attributes
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
    const rawConfig = getPluginConfiguration(manager, PLUGIN_NAME);
    const config = verifyAndFillConfiguration(rawConfig);
    const {store} = manager;
    store.addReducer(namespace, reducers);

    // get the Flex configuration
    console.log(`${PLUGIN_NAME}: configuration:`, config);
    store.dispatch( setExecutionContext({config}) );

    flex.Actions.addListener("afterAcceptTask", afterAcceptTask(manager));
    flex.Actions.addListener("afterCompleteTask", afterCompleteTask(manager));
  }
}
