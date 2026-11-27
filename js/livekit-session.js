(function () {
  "use strict";

  var LiveKit = window.LivekitClient || window.LiveKit || window.livekit;
  var Room = LiveKit && LiveKit.Room;
  var RoomEvent = LiveKit && LiveKit.RoomEvent;
  var Track = LiveKit && LiveKit.Track;

  function getConfig() {
    return window.LIVEKIT_CONFIG || { tokenApiUrl: "http://localhost:3001", agentName: "my-agent" };
  }

  function getRemoteAudioEl() {
    var el = document.getElementById("livekit-remote-audio");
    if (!el) {
      el = document.createElement("audio");
      el.id = "livekit-remote-audio";
      el.autoplay = true;
      el.playsInline = true;
      el.style.display = "none";
      document.body.appendChild(el);
    }
    return el;
  }

  window.LiveKitSession = {
    room: null,
    mode: null,
    _micEnabled: true,
    _cameraEnabled: false,
    _connectPromise: null,

    isConnected: function () {
      return !!(this.room && this.room.state === "connected");
    },

    buildDuringContext: function () {
      var uid = typeof getCurrentUserId === "function" ? getCurrentUserId() : "zhang";
      var user = typeof USER_DB !== "undefined" && USER_DB[uid] ? USER_DB[uid] : null;
      var during = user && user.during ? user.during : {};
      var episodes =
        typeof getPodcastEpisodes === "function" ? getPodcastEpisodes() : [];

      return {
        userId: uid,
        guideName: during.agentName || "王建国 AI",
        guideAvatar: during.guideAvatar || "",
        location:
          typeof getCurrentLocationName === "function"
            ? getCurrentLocationName()
            : "",
        aiMsgCounter: typeof aiMsgCounter !== "undefined" ? aiMsgCounter : 0,
        unlockedTopics: episodes.map(function (e) {
          return e.title;
        }),
      };
    },

    _bindRoomEvents: function (room) {
      var self = this;
      room.on(RoomEvent.TrackSubscribed, function (track, publication, participant) {
        if (track.kind === Track.Kind.Audio) {
          track.attach(getRemoteAudioEl());
        }
        if (track.kind === Track.Kind.Video && !participant.isLocal) {
          var remoteVideo = document.getElementById("guide-remote-video");
          if (remoteVideo) track.attach(remoteVideo);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, function (track) {
        track.detach().forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
      });

      room.on(RoomEvent.Disconnected, function () {
        self.room = null;
        self.mode = null;
        self._connectPromise = null;
      });
    },

    connect: function (mode) {
      var self = this;
      mode = mode || "audio";

      if (this.isConnected()) {
        if (mode === "video") return this.enableCamera(true);
        return Promise.resolve(this.room);
      }

      if (this._connectPromise) return this._connectPromise;

      if (!Room) {
        return Promise.reject(new Error("livekit-client not loaded"));
      }

      var cfg = getConfig();
      var uid =
        typeof getCurrentUserId === "function" ? getCurrentUserId() : "zhang";
      var roomName = "guide-" + uid + "-" + Date.now();
      var identity = "tourist-" + uid;
      var metadata = this.buildDuringContext();

      this._connectPromise = fetch(cfg.tokenApiUrl + "/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName,
          identity: identity,
          mode: mode,
          metadata: metadata,
        }),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () { return {}; }).then(function (body) {
              throw new Error(body.error || "Token request failed");
            });
          }
          return res.json();
        })
        .then(function (data) {
          var room = new Room({ adaptiveStream: true, dynacast: true });
          self._bindRoomEvents(room);
          return room.connect(data.url, data.token).then(function () {
            self.room = room;
            self.mode = mode;
            return room.localParticipant.setMicrophoneEnabled(true).then(function () {
              self._micEnabled = true;
              if (mode === "video") {
                return self.enableCamera(true);
              }
            });
          });
        })
        .catch(function (err) {
          self._connectPromise = null;
          throw err;
        });

      return this._connectPromise;
    },

    disconnect: function () {
      var self = this;
      this._connectPromise = null;
      if (!this.room) return Promise.resolve();

      var room = this.room;
      this.room = null;
      this.mode = null;
      this._micEnabled = true;
      this._cameraEnabled = false;

      return room.disconnect().catch(function () {}).then(function () {
        var audioEl = document.getElementById("livekit-remote-audio");
        if (audioEl) {
          audioEl.pause();
          audioEl.srcObject = null;
        }
        var preview = document.getElementById("user-local-preview");
        if (preview) preview.srcObject = null;
        var remoteVideo = document.getElementById("guide-remote-video");
        if (remoteVideo) remoteVideo.srcObject = null;
      });
    },

    toggleMute: function () {
      if (!this.room) return Promise.resolve(false);
      var next = !this._micEnabled;
      var self = this;
      return this.room.localParticipant.setMicrophoneEnabled(next).then(function () {
        self._micEnabled = next;
        return next;
      });
    },

    isMicEnabled: function () {
      return this._micEnabled;
    },

    enableCamera: function (enabled) {
      if (!this.room) return Promise.resolve(false);
      var self = this;
      return this.room.localParticipant.setCameraEnabled(!!enabled).then(function () {
        self._cameraEnabled = !!enabled;
        var preview = document.getElementById("user-local-preview");
        if (preview && enabled) {
          self.room.localParticipant.videoTrackPublications.forEach(function (pub) {
            if (pub.track) pub.track.attach(preview);
          });
        }
        if (preview && !enabled) {
          preview.srcObject = null;
        }
        return self._cameraEnabled;
      });
    },

    showGuideAvatar: function (guideInfo) {
      var avatarEl = document.getElementById("guide-video-avatar");
      var remoteVideo = document.getElementById("guide-remote-video");
      if (!avatarEl) return;
      var info = guideInfo || (typeof _getGuideInfo === "function" ? _getGuideInfo() : {});
      if (info.avatar) avatarEl.src = info.avatar;
      if (info.name) avatarEl.alt = info.name;
      avatarEl.classList.remove("hidden");
      if (remoteVideo) remoteVideo.classList.add("hidden");
    },
  };
})();
