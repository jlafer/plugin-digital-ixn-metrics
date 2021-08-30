# Twilio Flex Plugin for Digital Interaction Metrics

This is a Twilio Flex Plugin that captures a set of metrics for digital interactions. At the end of each non-voice task, it updates selected task conversation attributes with those metrics. These can then be used in Flex Insights reporting.

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd plugin-digital-ixn-metrics

# If you use npm
npm install
```
## Development

- Copy appConfig.example.js in `public` to appConfig.js and ake any changes you need.

## Configuration
The `PluginDigitalIxnMetrics` namespace within the `attributes` property of the Flex configuration object is used to configure the plugin. Configuration consists of mapping metrics calculated by the plugin to Task attribute keys. The plugin configuration data should have the following structure. The metric names are documented below.

```bash
  PluginDigitalIxnMetrics: {
    attributes: {
      [attributeName]: [metric name],
      o o o
    }
  }
```

The `agentMsgCnt` metric contains the number of messages sent by the agent.

The `agentReplyCnt` metric contains the number of reply messages sent by the agent. A reply is a message that immediately follows a message from the other party. So, if an agent were to respond to a customer with three messages, wihout an intervening message from the customer, that would count as three messages but only a single reply. Note that `avgAgentReplyTime` is based on the number of agent replies - not on the number of agent messages.

The `agentReplyTime` metric contains the total time, in mSecs, between each customer reply message and the next reply message sent by the agent. A reply is a message that immediately follows a message from the other party.

The `timeToFirstAgentMsg` metric contains the time, in mSecs, between delivery of the interaction to the agent and the agent's first message sent to the customer.

The `customerMsgCnt` metric contains the number of messages sent by the customer.

The `customerReplyCnt` metric contains the number of reply messages sent by the customer. A reply is a message that immediately follows a message from the other party. So, if a customer were to respond to an agent with three messages, wihout an intervening message from the agent, that would count as three messages but only a single reply. Note that `avgCustomerReplyTime` is based on the number of customer replies - not on the number of customer messages.

The `customerReplyTime` metric contains the total time, in mSecs, between each agent reply message and the next reply message sent by the customer. A reply is a message that immediately follows a message from the other party.

See `appConfig.example.js` for sample configuration data. For local development, use `appConfig.js` to configure the plugin. For a Twilio-hosted deployment, update the Flex configuration using the Flex API as described [here](https://www.twilio.com/docs/flex/ui/configuration#modifying-configuration-for-flextwiliocom). Here's an example of calling the API via `curl` that can be used IF NO OTHER PLUGINS ARE CONFIGURED in the `attributes` property. As described in the document linked above, other plugins' configuration data can be preserved by first GETting the `attributes` data, editing the result to add in the `PluginDigitalIxnMetrics` key, and then POSTing back the edited result.

```bash
curl https://flex-api.twilio.com/v1/Configuration -X POST -u ACxx:auth_token \
    -H 'Content-Type: application/json' \
    -d '{
        "account_sid": "ACxx",
        "attributes": {
          "PluginDigitalIxnMetrics": {
            "attributes": {
              "average_response_time": "agentAvgReplyTime",
              "first_response_time": "timeToFirstAgentMsg",
              "conversation_measure_3": "agentMsgCnt"
            }
          }
        }
    }'
```


Run `twilio flex:plugins --help` to see all the commands currently supported by the Flex Plugins CLI. For further details refer to documentation on the [Flex Plugins CLI docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

## Deploy
The plugin can be built and deployed with the `deploy` command of the Flex CLI. To be activated in your Flex project runnning at `flex.twilio.com` you must use the `release` command. This allows you to install this and, optionally, other Flex plugins together. Again, refer to the docs cited above for more information.

## WARNING
This code is supplied on a best-effort basis, without warranty, and should be carefully reviewed and tested prior to use. It is provided for instructional purposes only. Also, it makes use of a personal npm package by the author (i.e., `jlafer-flex-util`). That package should not be treated as production-grade and you are advised to use with care.

