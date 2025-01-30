/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Renderer } from "@k8slens/extensions";

type DaemonSet = Renderer.K8sApi.DaemonSet;

const {
  Component: {
    terminalStore,
    createTerminalTab,
    ConfirmDialog,
    MenuItem,
    SearchInput,
    Checkbox,
    Icon,
  },
  Navigation,
} = Renderer;

export function DaemonSetMenu(props: Renderer.Component.KubeObjectMenuProps<DaemonSet>) {
  const { object: daemonSet, toolbar } = props;

  if (!daemonSet) {
    return null;
  }

  const daemonSetName = daemonSet.getName();
  const daemonSetNamespace = daemonSet.metadata.namespace;

  const sendToTerminal = (command: string, tabId?: string) => {
    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
      tabId,
    });
    Navigation.hideDetails();
  };

  let searchQuery = '';
  let searchPretty = false;


  const logsShow = ()=>{
    const tab = createTerminalTab({
      title: `DaemonSet: ${daemonSetName}`
    })
    sendToTerminal(`stern daemonset/${daemonSetName} --color auto --max-log-requests 500 --namespace ${daemonSetNamespace} --output ${searchPretty ? 'extjson' : 'default'} --since 1s ${searchQuery ? `-i '${searchQuery}'` : ''} ${searchPretty ? '| jq .' : ''}`, tab.id);
  }

  const logs = () => {
    ConfirmDialog.open({
      ok: () => logsShow(),
      labelOk: `Logs`,
      message: (
        <p>
          {"Enter grep logs filter: "}
          <SearchInput 
            style={{marginTop: '4px', marginBottom: '4px'}} 
            placeholder="Search..." 
            onChange={(v)=>searchQuery = v}
            onSubmit={()=>{
              logsShow();
            }}
          ></SearchInput>
          <Checkbox label="Pretty JSON" onChange={(v)=>searchPretty=v}></Checkbox>
        </p>
      ),
    });
  };

  return (
    <>
      <MenuItem onClick={logs}>
        <Icon
          material="subject"
          tooltip={toolbar && "DaemonSet Logs"}
          interactive={toolbar}
        />
        <span className="title">DaemonSet Logs</span>
      </MenuItem>
    </>
  );
}
