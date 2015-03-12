/* global require module window */

var AppDispatcher = require("editor/dispatcher/AppDispatcher");
var IdeConstants = require("editor/constants/IdeConstants");
var IdeStore = require("editor/stores/IdeStore");
var ActionTypes = IdeConstants.ActionTypes;

var rpc = require("editor/lib/RpcClient");

var IdeActions = {
  globalClick: function() {
    "use strict";
    AppDispatcher.dispatch({
      actionType: ActionTypes.IDE_GLOBAL_CLICK
    });
  },

  toggleFullscreen: function() {
    "use strict";

    var fullscreen = !IdeStore.getState().fullscreen;
    var cmd = fullscreen ? "ideFullscreen" : "ideEmbedded";
    var message = { cmd: cmd };

    window.parent.postMessage(message, "*");

    AppDispatcher.dispatch({
      actionType: ActionTypes.IDE_TOGGLE_FULL_SCREEN,
      fullscreen: fullscreen
    });
  },

  loadCompleted: function() {
    "use strict";

    AppDispatcher.dispatch({
      actionType: ActionTypes.IDE_LOADED
    });
  },

  connect: function() {
    "use strict";

    AppDispatcher.dispatch({
      actionType: ActionTypes.IDE_CONNECTED
    });
  },

  disconnect: function() {
    "use strict";

    AppDispatcher.dispatch({
      actionType: ActionTypes.IDE_DISCONNECTED
    });
  },

  showReadme() {
    rpc.getClient().fs.read("./README.md").then(function(result) {
      AppDispatcher.dispatch({
        actionType: ActionTypes.IDE_SHOW_README,
        content: result,
        title: "README.md"
      });
    });

  }
};

module.exports = IdeActions;
