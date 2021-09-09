import {addChatMetrics, addMessage} from './AppState';

const config = {};
let state = {
  config: {},
  chats: {}
};

test('addChatMetrics adds new reservation to list of active chats', () => {
  const payload = {resSid: 'WRxxxx', channelSid: 'CHxxxx', ts: 0};
  state = addChatMetrics(state, payload);
  expect(state).toEqual(
    {
      config: config,
      chats: {
        WRxxxx: {
          channelSid: 'CHxxxx', startTS: 0, latestMsgByAgent: false, timeToFirstAgentMsg: 0,
          customerMsgCnt: 0, customerReplyCnt: 0, customerReplyTime: 0, latestCustomerMsgTs: 0,
          agentMsgCnt: 0, agentReplyCnt: 0, agentReplyTime: 0, latestAgentMsgTs: 0
        }
      }
    }
  )
})

test('addMessage updates chat metrics for agent', () => {
  const payload = {channelSid: 'CHxxxx', sentByWorker: true, ts: 1000};
  state = addMessage(state, payload);
  expect(state).toEqual(
    {
      config: config,
      chats: {
        WRxxxx: {
          channelSid: 'CHxxxx', startTS: 0, latestMsgByAgent: true, timeToFirstAgentMsg: 1000,
          customerMsgCnt: 0, customerReplyCnt: 0, customerReplyTime: 0, latestCustomerMsgTs: 0,
          agentMsgCnt: 1, agentReplyCnt: 1, agentReplyTime: 1000, latestAgentMsgTs: 1000
        }
      }
    }
  )
})