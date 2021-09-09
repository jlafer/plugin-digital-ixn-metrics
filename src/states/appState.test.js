import * as R from 'ramda';
import {addChatMetrics, addMessage, termChatMetrics} from './AppState';

const config = {};
let state = {
  config: {},
  chats: {}
};
const initialChat = {
  latestMsgByAgent: false, timeToFirstAgentMsg: 0,
  customerMsgCnt: 0, customerReplyCnt: 0, customerReplyTime: 0, latestCustomerMsgTs: 0,
  agentMsgCnt: 0, agentReplyCnt: 0, agentReplyTime: 0, latestAgentMsgTs: 0
};

test('addChatMetrics adds new reservation to list of active chats', () => {
  const payload = {resSid: 'WRxxxx', channelSid: 'CHxxxx', ts: 0};
  const expected = {...state, chats: {...state.chats, WRxxxx: {...initialChat, channelSid: 'CHxxxx', startTS: 0}}};
  state = addChatMetrics(state, payload);
  expect(state).toEqual(expected)
})

test('addMessage updates chat metrics for agent', () => {
  const payload = {channelSid: 'CHxxxx', sentByWorker: true, ts: 1000};
  const currentChat = state.chats.WRxxxx;
  const expected = {...state,
    chats: {...state.chats,
      WRxxxx: {...currentChat,
        latestMsgByAgent: true, timeToFirstAgentMsg: 1000, agentMsgCnt: 1,
        agentReplyCnt: 1, agentReplyTime: 1000, latestAgentMsgTs: 1000
      }
    }
  };
  state = addMessage(state, payload);
  expect(state).toEqual(expected);
})

test('addMessage updates chat metrics for customer', () => {
  const payload = {channelSid: 'CHxxxx', sentByWorker: false, ts: 3000};
  const currentChat = state.chats.WRxxxx;
  const expected = {...state,
    chats: {...state.chats,
      WRxxxx: {...currentChat,
        latestMsgByAgent: false, customerMsgCnt: 1, customerReplyCnt: 1,
        customerReplyTime: 2000, latestCustomerMsgTs: 3000
      }
    }
  };
  state = addMessage(state, payload);
  expect(state).toEqual(expected);
})

test('addMessage handles 2nd consecutive msg from customer', () => {
  const payload = {channelSid: 'CHxxxx', sentByWorker: false, ts: 4000};
  const currentChat = state.chats.WRxxxx;
  const expected = {...state,
    chats: {...state.chats,
      WRxxxx: {...currentChat,
        latestMsgByAgent: false, customerMsgCnt: 2, customerReplyCnt: 1,
        customerReplyTime: 2000, latestCustomerMsgTs: 4000
      }
    }
  };
  state = addMessage(state, payload);
  expect(state).toEqual(expected);
})

test('termChatMetrics removes reservation from list of active chats', () => {
  const payload = {resSid: 'WRxxxx'};
  const expected = {...state, chats: R.dissoc('WRxxxx', state.chats)};
  state = termChatMetrics(state, payload);
  expect(state).toEqual(expected)
})
