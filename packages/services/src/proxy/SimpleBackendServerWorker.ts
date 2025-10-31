import express from 'express';
import proxyApi from 'express-http-proxy';
import { IServerProxyRule } from '@app/shared';

const app = express();
let server: import('http').Server | undefined;
const proxyRules = new Map<string, IServerProxyRule>();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

process.on('message', (message: {
  type: string;
  proxyRules?: IServerProxyRule[];
  ruleId?: string;
}) => {
  try {
    switch (message.type) {
      case 'init':
        handleInit(message);
        break;
      case 'closeRule':
        if (message.ruleId) handleCloseRule(message.ruleId);
        break;
      case 'openRule':
        if (message.ruleId) handleOpenRule(message.ruleId);
        break;
      default:
        throw new Error(`Unsupported message type: ${message.type}`);
    }
  } catch (error) {
    process.send?.({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      messageType: message.type
    });
  }
});

function handleInit(message: { proxyRules?: IServerProxyRule[] }) {
  try {
    const port = parseInt(process.argv[2]);
    server = app.listen(port, () => {
      process.send?.({
        type: 'server_started',
        port
      });

      // Initialize with provided rules
      message.proxyRules?.forEach(rule => {
        if (!rule.closed) {
          addProxyRule(rule);
        }
      });
    });
  } catch (error) {
    throw new Error(`Init failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function addProxyRule(rule: IServerProxyRule) {
  try {
    app.use(rule.path, proxyApi(rule.remoteServer));
    proxyRules.set(rule.uid, rule);
  } catch (error) {
    throw new Error(`Failed to add proxy rule: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function handleCloseRule(ruleId: string) {
  try {
    const rule = proxyRules.get(ruleId);
    if (rule) {
      app.delete(rule.path);
      rule.closed = true;
    }
  } catch (error) {
    throw new Error(`Close rule failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function handleOpenRule(ruleId: string) {
  try {
    const rule = proxyRules.get(ruleId);
    if (rule) {
      rule.closed = false;
      addProxyRule(rule);
    }
  } catch (error) {
    throw new Error(`Open rule failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

process.on('SIGTERM', () => {
  if (server) {
    server.close(() => {
      process.send?.({
        type: 'server_closed'
      });
      process.exit(0);
    });
  } else {
    process.send?.({
      type: 'server_closed'
    });
    process.exit(0);
  }
});
