const React = require("react/addons");
const Config = require("editor/config");
const Ide = require("editor/components/Ide");

const TreeActions = require("editor/actions/TreeActions");
const TerminalsActions = require("editor/actions/TerminalsActions");
const IdeActions = require("editor/actions/IdeActions");
const EditorsActions = require("editor/actions/EditorsActions");
const TerminalsStore = require("editor/stores/TerminalsStore");
const EditorsStore = require("editor/stores/EditorsStore");

const RpcClient = require("editor/lib/RpcClient");

export default class HexletIdeWidget {
  constructor(domElement, options) {
    Config.extend(options);

    RpcClient.init(Config.rpc);

    this.domElement = domElement;
    this.cmd = options.cmd;
    this.bindEvents();
    this.runAutosave();
    this.render();
  }

  bindEvents() {
    var rpcClient = RpcClient.getClient();

    rpcClient.ready((proxy) => {
      TreeActions.loadTree();
      TerminalsActions.createDefaultTerminal(Config.terminal);

      IdeActions.loadCompleted();
      IdeActions.connect();
    });

    //FIXME: это хак, пока не сделано дуплексное RPC между клиентом и сервером
    rpcClient.socket.on("terminalUpdated", (msg) => {
      TerminalsActions.finishUpdateTerminal(msg);
    });

    rpcClient.socket.on("reconnect", () => {
      IdeActions.connect();
      TerminalsActions.reconnectTerminals();
    });

    rpcClient.socket.on("disconnect", () => {
      IdeActions.disconnect();
    });

    rpcClient.socket.on("run.progress", (data) => {
      IdeActions.runProgress(data);
    });

    rpcClient.socket.on("run.finish", (data) => {
      IdeActions.runFinished(data);
    });
  }

  runAutosave() {
    this.autosaveTimer = setInterval(() => {
      var editors = EditorsStore.getAllUnsaved();
      editors.forEach(EditorsActions.save);
    }, Config.autosaveInterval);
  }

  render() {
    return React.render(<Ide cmd={this.cmd} />, this.domElement);
  }

//   runCommand(cmd) {
//     TerminalsActions.runCommandInNewTerminal(cmd, Config.terminal);
//   }

//   exec() {
//     return RpcClient.getClient().run.exec(cmd);
//   }

  showReadme() {
    return IdeActions.showReadme();
  }

  run() {
    return IdeActions.run();
  }


  handleWindowMessage(e) {
    var data = e.data;
    var cmd = data.cmd;

    switch(cmd) {
      case "ide:run":
        return this.run().done((response) => {
          var result = {
            cmd: cmd,
            response: response
          };
          e.source.postMessage(result, e.origin);
        });

      case "ide:readme":
        return this.showReadme();

      default:
        return null;
    }
  }
}
