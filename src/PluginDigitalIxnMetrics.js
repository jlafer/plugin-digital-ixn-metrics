import * as R from 'ramda';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, {
  namespace, initiateChatMetrics, terminateChatMetrics
} from './states';

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
  console.log(`${PLUGIN_NAME}.afterCompleteTask: task:`, task);
  if (taskChannelUniqueName !== 'voice')
    dispatch( terminateChatMetrics(task.sid) );
});

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
