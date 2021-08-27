import * as R from 'ramda';
import {INIT_CHAT_METRICS, TERM_CHAT_METRICS, CHAT_MSG_SENT} from './actions';
import {setChatChannelCallbacks} from '../helpers';

const initialState = {
  chats: {}
};

export default function reduce(state = initialState, action) {
  const {type, payload, meta} = action;
  switch (type) {
    /* NOTE: using the Flex action CHANNEL_LOAD_FULFILLED is not good for 2 reasons:
      1) using Flex actions is not part of the public API of Flex
      2) setting a callback from within a reducer is considered an anti-pattern
      However, I can't see any other way to learn when the chat channel is ready
    */
    case 'CHANNEL_LOAD_FULFILLED':
      const channelSid = meta.channelSid;
      setChatChannelCallbacks(channelSid);
      return state;
    case INIT_CHAT_METRICS:
      return addChatMetrics(state, payload);
    case CHAT_MSG_SENT:
      return addMessage(state, payload);
    case TERM_CHAT_METRICS:
      return termChatMetrics(state, payload);
    default:
      return state;
  }
}

const addChatMetrics = (state, payload) => {
  const {resSid, channelSid, ts} = payload;
  const chat = initiateChat(channelSid, ts);
  const chats = R.assoc(resSid, chat, state.chats);
  return {...state, chats};
};

const addMessage = (state, payload) => {
  const {channelSid, sentByWorker, ts} = payload;
  const [resSid, chat] = getChatAndKeyByChannelSid(state.chats, channelSid);
  const newChat = R.clone(chat);
  if (sentByWorker) {
    newChat.agentMsgCnt += 1;
  }
  else {
    newChat.customerMsgCnt += 1;
  }
  const chats = R.assoc(resSid, newChat, state.chats);
  return {...state, chats};
};

const getChatAndKeyByChannelSid = (chats, channelSid) => {
  return R.toPairs(chats).find(([_key, val]) => val.channelSid === channelSid);
};

const termChatMetrics = (state, payload) => {
  const {resSid} = payload;
  const chat = state.chats[resSid];
  if (!chat) {
    console.warn('termChatMetrics: chat not found in state???', payload);
    return state;
  }
  const {startTS} = chat;
  const chats = R.dissoc(resSid, state.chats);
  return {...state, chats};
};

const initiateChat = (channelSid, startTS) => {
  return {
    channelSid, startTS, customerMsgCnt: 0, agentMsgCnt: 0, customerMsgDur: 0, agentMsgDur: 0
  };
};
