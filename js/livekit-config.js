(function () {
  "use strict";

  var meta = document.querySelector('meta[name="livekit-token-api"]');
  var tokenApiUrl = (meta && meta.getAttribute("content")) || "http://localhost:3001";

  window.LIVEKIT_CONFIG = {
    tokenApiUrl: tokenApiUrl.replace(/\/$/, ""),
    agentName: "my-agent",
  };
})();
