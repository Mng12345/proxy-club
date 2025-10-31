import express from "express";
import proxyApi from "express-http-proxy";
const app = express();
let server;
const proxyRules = /* @__PURE__ */ new Map();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on("message", (message) => {
  try {
    switch (message.type) {
      case "init":
        handleInit(message);
        break;
      case "closeRule":
        if (message.ruleId) handleCloseRule(message.ruleId);
        break;
      case "openRule":
        if (message.ruleId) handleOpenRule(message.ruleId);
        break;
      default:
        throw new Error(`Unsupported message type: ${message.type}`);
    }
  } catch (error) {
    process.send?.({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
      messageType: message.type
    });
  }
});
function handleInit(message) {
  try {
    const port = parseInt(process.argv[2]);
    server = app.listen(port, () => {
      process.send?.({
        type: "server_started",
        port
      });
      message.proxyRules?.forEach((rule) => {
        if (!rule.closed) {
          addProxyRule(rule);
        }
      });
    });
  } catch (error) {
    throw new Error(`Init failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function addProxyRule(rule) {
  try {
    app.use(rule.path, proxyApi(rule.remoteServer));
    proxyRules.set(rule.uid, rule);
  } catch (error) {
    throw new Error(`Failed to add proxy rule: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function handleCloseRule(ruleId) {
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
function handleOpenRule(ruleId) {
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
process.on("SIGTERM", () => {
  if (server) {
    server.close(() => {
      process.send?.({
        type: "server_closed"
      });
      process.exit(0);
    });
  } else {
    process.send?.({
      type: "server_closed"
    });
    process.exit(0);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLm1qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3Byb3h5L1NpbXBsZUJhY2tlbmRTZXJ2ZXJXb3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgcHJveHlBcGkgZnJvbSAnZXhwcmVzcy1odHRwLXByb3h5JztcbmltcG9ydCB7IElTZXJ2ZXJQcm94eVJ1bGUgfSBmcm9tICdAYXBwL3NoYXJlZCc7XG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbmxldCBzZXJ2ZXI6IGltcG9ydCgnaHR0cCcpLlNlcnZlciB8IHVuZGVmaW5lZDtcbmNvbnN0IHByb3h5UnVsZXMgPSBuZXcgTWFwPHN0cmluZywgSVNlcnZlclByb3h5UnVsZT4oKTtcblxucHJvY2Vzcy5lbnYuTk9ERV9UTFNfUkVKRUNUX1VOQVVUSE9SSVpFRCA9ICcwJztcblxucHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlOiB7XG4gIHR5cGU6IHN0cmluZztcbiAgcHJveHlSdWxlcz86IElTZXJ2ZXJQcm94eVJ1bGVbXTtcbiAgcnVsZUlkPzogc3RyaW5nO1xufSkgPT4ge1xuICB0cnkge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgaGFuZGxlSW5pdChtZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZVJ1bGUnOlxuICAgICAgICBpZiAobWVzc2FnZS5ydWxlSWQpIGhhbmRsZUNsb3NlUnVsZShtZXNzYWdlLnJ1bGVJZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3BlblJ1bGUnOlxuICAgICAgICBpZiAobWVzc2FnZS5ydWxlSWQpIGhhbmRsZU9wZW5SdWxlKG1lc3NhZ2UucnVsZUlkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHByb2Nlc3Muc2VuZD8uKHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgbWVzc2FnZVR5cGU6IG1lc3NhZ2UudHlwZVxuICAgIH0pO1xuICB9XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlSW5pdChtZXNzYWdlOiB7IHByb3h5UnVsZXM/OiBJU2VydmVyUHJveHlSdWxlW10gfSkge1xuICB0cnkge1xuICAgIGNvbnN0IHBvcnQgPSBwYXJzZUludChwcm9jZXNzLmFyZ3ZbMl0pO1xuICAgIHNlcnZlciA9IGFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgcHJvY2Vzcy5zZW5kPy4oe1xuICAgICAgICB0eXBlOiAnc2VydmVyX3N0YXJ0ZWQnLFxuICAgICAgICBwb3J0XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHByb3ZpZGVkIHJ1bGVzXG4gICAgICBtZXNzYWdlLnByb3h5UnVsZXM/LmZvckVhY2gocnVsZSA9PiB7XG4gICAgICAgIGlmICghcnVsZS5jbG9zZWQpIHtcbiAgICAgICAgICBhZGRQcm94eVJ1bGUocnVsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW5pdCBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFByb3h5UnVsZShydWxlOiBJU2VydmVyUHJveHlSdWxlKSB7XG4gIHRyeSB7XG4gICAgYXBwLnVzZShydWxlLnBhdGgsIHByb3h5QXBpKHJ1bGUucmVtb3RlU2VydmVyKSk7XG4gICAgcHJveHlSdWxlcy5zZXQocnVsZS51aWQsIHJ1bGUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGFkZCBwcm94eSBydWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVDbG9zZVJ1bGUocnVsZUlkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBydWxlID0gcHJveHlSdWxlcy5nZXQocnVsZUlkKTtcbiAgICBpZiAocnVsZSkge1xuICAgICAgYXBwLmRlbGV0ZShydWxlLnBhdGgpO1xuICAgICAgcnVsZS5jbG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENsb3NlIHJ1bGUgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVPcGVuUnVsZShydWxlSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJ1bGUgPSBwcm94eVJ1bGVzLmdldChydWxlSWQpO1xuICAgIGlmIChydWxlKSB7XG4gICAgICBydWxlLmNsb3NlZCA9IGZhbHNlO1xuICAgICAgYWRkUHJveHlSdWxlKHJ1bGUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE9wZW4gcnVsZSBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbnByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gIGlmIChzZXJ2ZXIpIHtcbiAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgcHJvY2Vzcy5zZW5kPy4oe1xuICAgICAgICB0eXBlOiAnc2VydmVyX2Nsb3NlZCdcbiAgICAgIH0pO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3Muc2VuZD8uKHtcbiAgICAgIHR5cGU6ICdzZXJ2ZXJfY2xvc2VkJ1xuICAgIH0pO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxNQUFNLE1BQU0sUUFBQTtBQUNaLElBQUk7QUFDSixNQUFNLGlDQUFpQixJQUFBO0FBRXZCLFFBQVEsSUFBSSwrQkFBK0I7QUFFM0MsUUFBUSxHQUFHLFdBQVcsQ0FBQyxZQUlqQjtBQUNKLE1BQUk7QUFDRixZQUFRLFFBQVEsTUFBQTtBQUFBLE1BQ2QsS0FBSztBQUNILG1CQUFXLE9BQU87QUFDbEI7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJLFFBQVEsT0FBUSxpQkFBZ0IsUUFBUSxNQUFNO0FBQ2xEO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSSxRQUFRLE9BQVEsZ0JBQWUsUUFBUSxNQUFNO0FBQ2pEO0FBQUEsTUFDRjtBQUNFLGNBQU0sSUFBSSxNQUFNLDZCQUE2QixRQUFRLElBQUksRUFBRTtBQUFBLElBQUE7QUFBQSxFQUMvRCxTQUNPLE9BQU87QUFDZCxZQUFRLE9BQU87QUFBQSxNQUNiLE1BQU07QUFBQSxNQUNOLE9BQU8saUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQzVELGFBQWEsUUFBUTtBQUFBLElBQUEsQ0FDdEI7QUFBQSxFQUFBO0FBRUwsQ0FBQztBQUVELFNBQVMsV0FBVyxTQUE4QztBQUNoRSxNQUFJO0FBQ0YsVUFBTSxPQUFPLFNBQVMsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUNyQyxhQUFTLElBQUksT0FBTyxNQUFNLE1BQU07QUFDOUIsY0FBUSxPQUFPO0FBQUEsUUFDYixNQUFNO0FBQUEsUUFDTjtBQUFBLE1BQUEsQ0FDRDtBQUdELGNBQVEsWUFBWSxRQUFRLENBQUEsU0FBUTtBQUNsQyxZQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2hCLHVCQUFhLElBQUk7QUFBQSxRQUFBO0FBQUEsTUFDbkIsQ0FDRDtBQUFBLElBQUEsQ0FDRjtBQUFBLEVBQUEsU0FDTSxPQUFPO0FBQ2QsVUFBTSxJQUFJLE1BQU0sZ0JBQWdCLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQUEsRUFBQTtBQUU1RjtBQUVBLFNBQVMsYUFBYSxNQUF3QjtBQUM1QyxNQUFJO0FBQ0YsUUFBSSxJQUFJLEtBQUssTUFBTSxTQUFTLEtBQUssWUFBWSxDQUFDO0FBQzlDLGVBQVcsSUFBSSxLQUFLLEtBQUssSUFBSTtBQUFBLEVBQUEsU0FDdEIsT0FBTztBQUNkLFVBQU0sSUFBSSxNQUFNLDZCQUE2QixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFBLEVBQUE7QUFFekc7QUFFQSxTQUFTLGdCQUFnQixRQUFnQjtBQUN2QyxNQUFJO0FBQ0YsVUFBTSxPQUFPLFdBQVcsSUFBSSxNQUFNO0FBQ2xDLFFBQUksTUFBTTtBQUNSLFVBQUksT0FBTyxLQUFLLElBQUk7QUFDcEIsV0FBSyxTQUFTO0FBQUEsSUFBQTtBQUFBLEVBQ2hCLFNBQ08sT0FBTztBQUNkLFVBQU0sSUFBSSxNQUFNLHNCQUFzQixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFBLEVBQUE7QUFFbEc7QUFFQSxTQUFTLGVBQWUsUUFBZ0I7QUFDdEMsTUFBSTtBQUNGLFVBQU0sT0FBTyxXQUFXLElBQUksTUFBTTtBQUNsQyxRQUFJLE1BQU07QUFDUixXQUFLLFNBQVM7QUFDZCxtQkFBYSxJQUFJO0FBQUEsSUFBQTtBQUFBLEVBQ25CLFNBQ08sT0FBTztBQUNkLFVBQU0sSUFBSSxNQUFNLHFCQUFxQixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFBLEVBQUE7QUFFakc7QUFFQSxRQUFRLEdBQUcsV0FBVyxNQUFNO0FBQzFCLE1BQUksUUFBUTtBQUNWLFdBQU8sTUFBTSxNQUFNO0FBQ2pCLGNBQVEsT0FBTztBQUFBLFFBQ2IsTUFBTTtBQUFBLE1BQUEsQ0FDUDtBQUNELGNBQVEsS0FBSyxDQUFDO0FBQUEsSUFBQSxDQUNmO0FBQUEsRUFBQSxPQUNJO0FBQ0wsWUFBUSxPQUFPO0FBQUEsTUFDYixNQUFNO0FBQUEsSUFBQSxDQUNQO0FBQ0QsWUFBUSxLQUFLLENBQUM7QUFBQSxFQUFBO0FBRWxCLENBQUM7In0=
