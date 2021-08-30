var appConfig = {
  pluginService: {
    enabled: true,
    url: '/plugins',
  },
  ytica: false,
  logLevel: 'info',
  showSupervisorDesktopView: true,
  enableReduxLogging: true,
  attributes: {
    PluginDigitalIxnMetrics: {
      attributes: {
        average_response_time: 'agentAvgReplyTime',
        first_response_time: 'timeToFirstAgentMsg',
        conversation_measure_3: 'agentMsgCnt'
      }
    }
  }

};
