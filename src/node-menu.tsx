/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Common, Renderer } from "@k8slens/extensions";

type Node = Renderer.K8sApi.Node;

const {
  Component: {
    terminalStore,
    createTerminalTab,
    ConfirmDialog,
    MenuItem,
    Icon,
  },
  Navigation,
} = Renderer;
const {
  App,
} = Common;

export function NodeMenu(props: Renderer.Component.KubeObjectMenuProps<Node>) {
  const { object: node, toolbar } = props;

  if (!node) {
    return null;
  }

  const nodeName = node.getName();
  const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
  const isCloudNode = node.metadata.labels['yandex.cloud/node-group-id'];

  const sendToTerminal = (command: string, tabId?: string) => {
    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
      tabId,
    });
    Navigation.hideDetails();
  };

  const pssh = ()=> {
    if(isCloudNode){
      const tab = createTerminalTab({
        title: `Node: ${node.metadata.labels['kubernetes.io/hostname']}`
      })
      sendToTerminal(`pssh ${node.status.addresses.pop().address}`, tab.id);
    }
  }

  const shell = () => {
    if(node.metadata.labels['kubernetes.io/hostname'] === 'colima'){
      const tab = createTerminalTab({
        title: `Node: colima`
      })
      sendToTerminal('colima ssh', tab.id);
      return
    }
    createTerminalTab({
      title: `Node: ${nodeName}`,
      node: nodeName,
    });
    Navigation.hideDetails();
  };

  const cordon = () => {
    sendToTerminal(`${kubectlPath} cordon ${nodeName}`);
  };

  const unCordon = () => {
    sendToTerminal(`${kubectlPath} uncordon ${nodeName}`);
  };

  const drain = () => {
    const command = `${kubectlPath} drain ${nodeName} --delete-local-data --ignore-daemonsets --force`;

    ConfirmDialog.open({
      ok: () => sendToTerminal(command),
      labelOk: `Drain Node`,
      message: (
        <p>
          {"Are you sure you want to drain "}
          <b>{nodeName}</b>
          ?
        </p>
      ),
    });
  };

  return (
    <>
      {
        isCloudNode && (
          <MenuItem onClick={pssh}>
            <Icon
              material="key"
              interactive={toolbar}
              tooltip={toolbar && "PSSH"}
            />
            <span className="title">PSSH</span>
          </MenuItem>
        )
      }
      <MenuItem onClick={shell}>
        <Icon
          svg="ssh"
          interactive={toolbar}
          tooltip={toolbar && "Node shell"}
        />
        <span className="title">Shell</span>
      </MenuItem>
      {
        node.isUnschedulable()
          ? (
            <MenuItem onClick={unCordon}>
              <Icon
                material="play_circle_filled"
                tooltip={toolbar && "Uncordon"}
                interactive={toolbar}
              />
              <span className="title">Uncordon</span>
            </MenuItem>
          )
          : (
            <MenuItem onClick={cordon}>
              <Icon
                material="pause_circle_filled"
                tooltip={toolbar && "Cordon"}
                interactive={toolbar}
              />
              <span className="title">Cordon</span>
            </MenuItem>
          )
      }
      <MenuItem onClick={drain}>
        <Icon
          material="delete_sweep"
          tooltip={toolbar && "Drain"}
          interactive={toolbar}
        />
        <span className="title">Drain</span>
      </MenuItem>
    </>
  );
}
