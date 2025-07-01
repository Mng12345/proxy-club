import express from "express";
import proxyApi from "express-http-proxy";
const app = express();
let server;
const proxyRules = /* @__PURE__ */ new Map();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLm1qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3Byb3h5L1NpbXBsZUJhY2tlbmRTZXJ2ZXJXb3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgcHJveHlBcGkgZnJvbSAnZXhwcmVzcy1odHRwLXByb3h5JztcbmltcG9ydCB7IElTZXJ2ZXJQcm94eVJ1bGUgfSBmcm9tICdAYXBwL3NoYXJlZCc7XG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbmxldCBzZXJ2ZXI6IGltcG9ydCgnaHR0cCcpLlNlcnZlciB8IHVuZGVmaW5lZDtcbmNvbnN0IHByb3h5UnVsZXMgPSBuZXcgTWFwPHN0cmluZywgSVNlcnZlclByb3h5UnVsZT4oKTtcblxucHJvY2Vzcy5vbignbWVzc2FnZScsIChtZXNzYWdlOiB7XG4gIHR5cGU6IHN0cmluZztcbiAgcHJveHlSdWxlcz86IElTZXJ2ZXJQcm94eVJ1bGVbXTtcbiAgcnVsZUlkPzogc3RyaW5nO1xufSkgPT4ge1xuICB0cnkge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgaGFuZGxlSW5pdChtZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZVJ1bGUnOlxuICAgICAgICBpZiAobWVzc2FnZS5ydWxlSWQpIGhhbmRsZUNsb3NlUnVsZShtZXNzYWdlLnJ1bGVJZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3BlblJ1bGUnOlxuICAgICAgICBpZiAobWVzc2FnZS5ydWxlSWQpIGhhbmRsZU9wZW5SdWxlKG1lc3NhZ2UucnVsZUlkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHByb2Nlc3Muc2VuZD8uKHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgbWVzc2FnZVR5cGU6IG1lc3NhZ2UudHlwZVxuICAgIH0pO1xuICB9XG59KTtcblxuZnVuY3Rpb24gaGFuZGxlSW5pdChtZXNzYWdlOiB7IHByb3h5UnVsZXM/OiBJU2VydmVyUHJveHlSdWxlW10gfSkge1xuICB0cnkge1xuICAgIGNvbnN0IHBvcnQgPSBwYXJzZUludChwcm9jZXNzLmFyZ3ZbMl0pO1xuICAgIHNlcnZlciA9IGFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgcHJvY2Vzcy5zZW5kPy4oe1xuICAgICAgICB0eXBlOiAnc2VydmVyX3N0YXJ0ZWQnLFxuICAgICAgICBwb3J0XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHByb3ZpZGVkIHJ1bGVzXG4gICAgICBtZXNzYWdlLnByb3h5UnVsZXM/LmZvckVhY2gocnVsZSA9PiB7XG4gICAgICAgIGlmICghcnVsZS5jbG9zZWQpIHtcbiAgICAgICAgICBhZGRQcm94eVJ1bGUocnVsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW5pdCBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFByb3h5UnVsZShydWxlOiBJU2VydmVyUHJveHlSdWxlKSB7XG4gIHRyeSB7XG4gICAgYXBwLnVzZShydWxlLnBhdGgsIHByb3h5QXBpKHJ1bGUucmVtb3RlU2VydmVyKSk7XG4gICAgcHJveHlSdWxlcy5zZXQocnVsZS51aWQsIHJ1bGUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGFkZCBwcm94eSBydWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVDbG9zZVJ1bGUocnVsZUlkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBydWxlID0gcHJveHlSdWxlcy5nZXQocnVsZUlkKTtcbiAgICBpZiAocnVsZSkge1xuICAgICAgYXBwLmRlbGV0ZShydWxlLnBhdGgpO1xuICAgICAgcnVsZS5jbG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENsb3NlIHJ1bGUgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVPcGVuUnVsZShydWxlSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJ1bGUgPSBwcm94eVJ1bGVzLmdldChydWxlSWQpO1xuICAgIGlmIChydWxlKSB7XG4gICAgICBydWxlLmNsb3NlZCA9IGZhbHNlO1xuICAgICAgYWRkUHJveHlSdWxlKHJ1bGUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE9wZW4gcnVsZSBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbnByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gIGlmIChzZXJ2ZXIpIHtcbiAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgcHJvY2Vzcy5zZW5kPy4oe1xuICAgICAgICB0eXBlOiAnc2VydmVyX2Nsb3NlZCdcbiAgICAgIH0pO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3Muc2VuZD8uKHtcbiAgICAgIHR5cGU6ICdzZXJ2ZXJfY2xvc2VkJ1xuICAgIH0pO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxNQUFNLE1BQU0sUUFBQTtBQUNaLElBQUk7QUFDSixNQUFNLGlDQUFpQixJQUFBO0FBRXZCLFFBQVEsR0FBRyxXQUFXLENBQUMsWUFJakI7QUFDSixNQUFJO0FBQ0YsWUFBUSxRQUFRLE1BQUE7QUFBQSxNQUNkLEtBQUs7QUFDSCxtQkFBVyxPQUFPO0FBQ2xCO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSSxRQUFRLE9BQVEsaUJBQWdCLFFBQVEsTUFBTTtBQUNsRDtBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUksUUFBUSxPQUFRLGdCQUFlLFFBQVEsTUFBTTtBQUNqRDtBQUFBLE1BQ0Y7QUFDRSxjQUFNLElBQUksTUFBTSw2QkFBNkIsUUFBUSxJQUFJLEVBQUU7QUFBQSxJQUFBO0FBQUEsRUFDL0QsU0FDTyxPQUFPO0FBQ2QsWUFBUSxPQUFPO0FBQUEsTUFDYixNQUFNO0FBQUEsTUFDTixPQUFPLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxNQUM1RCxhQUFhLFFBQVE7QUFBQSxJQUFBLENBQ3RCO0FBQUEsRUFBQTtBQUVMLENBQUM7QUFFRCxTQUFTLFdBQVcsU0FBOEM7QUFDaEUsTUFBSTtBQUNGLFVBQU0sT0FBTyxTQUFTLFFBQVEsS0FBSyxDQUFDLENBQUM7QUFDckMsYUFBUyxJQUFJLE9BQU8sTUFBTSxNQUFNO0FBQzlCLGNBQVEsT0FBTztBQUFBLFFBQ2IsTUFBTTtBQUFBLFFBQ047QUFBQSxNQUFBLENBQ0Q7QUFHRCxjQUFRLFlBQVksUUFBUSxDQUFBLFNBQVE7QUFDbEMsWUFBSSxDQUFDLEtBQUssUUFBUTtBQUNoQix1QkFBYSxJQUFJO0FBQUEsUUFBQTtBQUFBLE1BQ25CLENBQ0Q7QUFBQSxJQUFBLENBQ0Y7QUFBQSxFQUFBLFNBQ00sT0FBTztBQUNkLFVBQU0sSUFBSSxNQUFNLGdCQUFnQixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFBLEVBQUE7QUFFNUY7QUFFQSxTQUFTLGFBQWEsTUFBd0I7QUFDNUMsTUFBSTtBQUNGLFFBQUksSUFBSSxLQUFLLE1BQU0sU0FBUyxLQUFLLFlBQVksQ0FBQztBQUM5QyxlQUFXLElBQUksS0FBSyxLQUFLLElBQUk7QUFBQSxFQUFBLFNBQ3RCLE9BQU87QUFDZCxVQUFNLElBQUksTUFBTSw2QkFBNkIsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFBQSxFQUFBO0FBRXpHO0FBRUEsU0FBUyxnQkFBZ0IsUUFBZ0I7QUFDdkMsTUFBSTtBQUNGLFVBQU0sT0FBTyxXQUFXLElBQUksTUFBTTtBQUNsQyxRQUFJLE1BQU07QUFDUixVQUFJLE9BQU8sS0FBSyxJQUFJO0FBQ3BCLFdBQUssU0FBUztBQUFBLElBQUE7QUFBQSxFQUNoQixTQUNPLE9BQU87QUFDZCxVQUFNLElBQUksTUFBTSxzQkFBc0IsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFBQSxFQUFBO0FBRWxHO0FBRUEsU0FBUyxlQUFlLFFBQWdCO0FBQ3RDLE1BQUk7QUFDRixVQUFNLE9BQU8sV0FBVyxJQUFJLE1BQU07QUFDbEMsUUFBSSxNQUFNO0FBQ1IsV0FBSyxTQUFTO0FBQ2QsbUJBQWEsSUFBSTtBQUFBLElBQUE7QUFBQSxFQUNuQixTQUNPLE9BQU87QUFDZCxVQUFNLElBQUksTUFBTSxxQkFBcUIsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFBQSxFQUFBO0FBRWpHO0FBRUEsUUFBUSxHQUFHLFdBQVcsTUFBTTtBQUMxQixNQUFJLFFBQVE7QUFDVixXQUFPLE1BQU0sTUFBTTtBQUNqQixjQUFRLE9BQU87QUFBQSxRQUNiLE1BQU07QUFBQSxNQUFBLENBQ1A7QUFDRCxjQUFRLEtBQUssQ0FBQztBQUFBLElBQUEsQ0FDZjtBQUFBLEVBQUEsT0FDSTtBQUNMLFlBQVEsT0FBTztBQUFBLE1BQ2IsTUFBTTtBQUFBLElBQUEsQ0FDUDtBQUNELFlBQVEsS0FBSyxDQUFDO0FBQUEsRUFBQTtBQUVsQixDQUFDOyJ9
