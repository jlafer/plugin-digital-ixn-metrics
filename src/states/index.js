import { combineReducers } from 'redux';

import {INIT_CHAT_METRICS, TERM_CHAT_METRICS, CHAT_MSG_SENT} from './actions';
import appStateReducer from "./AppState";

export const namespace = 'plugin-digital-ixn-metrics';

export default combineReducers({
  appState: appStateReducer
});

export const initiateChatMetrics = (resSid, channelSid, ts) => ({
  type: INIT_CHAT_METRICS, payload: {resSid, channelSid, ts}
});

export const terminateChatMetrics = (resSid) => ({
  type: TERM_CHAT_METRICS, payload: {resSid}
});

export const messageSent = (channelSid, sentByWorker, ts) => ({
  type: CHAT_MSG_SENT, payload: {channelSid, sentByWorker, ts}
});
