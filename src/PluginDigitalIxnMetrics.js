import * as R from 'ramda';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, {namespace, initiateChatMetrics, terminateChatMetrics} from './states';
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
  const {store} = manager;
  const {dispatch} = store;
  const {task} = payload;
  const {taskChannelUniqueName} = task;
  if (taskChannelUniqueName !== 'voice') {
    const chat = store.getState()[namespace].appState.chats[task.sid];
    console.log('--------------------final chat stats:', chat);
    const data = {};
    data.first_response_time = chat.timeToFirstAgentMsg;
    data.conversation_measure_1 = chat.agentReplyCnt;
    data.conversation_measure_2 = chat.agentReplyDur;
    data.conversation_measure_3 = chat.customerReplyCnt;
    data.conversation_measure_4 = chat.customerReplyDur;
    updateTaskConversations(task, data);
    dispatch( terminateChatMetrics(task.sid) );
  }
});

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
    const {store, serviceConfiguration} = manager;
    store.addReducer(namespace, reducers);

    // get the Flex configuration
    const {attributes} = serviceConfiguration;
    console.log(`${PLUGIN_NAME}: configuration:`, serviceConfiguration);

    flex.Actions.addListener("afterAcceptTask", afterAcceptTask(manager));
    flex.Actions.addListener("afterCompleteTask", afterCompleteTask(manager));
  }
}
