/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Renderer } from "@k8slens/extensions";

type Deployment = Renderer.K8sApi.Deployment;

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

export function DeploymentMenu(props: Renderer.Component.KubeObjectMenuProps<Deployment>) {
  const { object: deployment, toolbar } = props;

  if (!deployment) {
    return null;
  }

  const deploymentName = deployment.getName();
  const deploymentNamespace = deployment.metadata.namespace;

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
      title: `Deployment: ${deploymentName}`
    })
    sendToTerminal(`stern deployment/${deploymentName} --color auto --max-log-requests 500 --namespace ${deploymentNamespace} --output ${searchPretty ? 'extjson' : 'default'} --since 1s ${searchQuery ? `-i '${searchQuery}'` : ''} ${searchPretty ? '| jq .' : ''}`, tab.id);
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
          tooltip={toolbar && "Deployment Logs"}
          interactive={toolbar}
        />
        <span className="title">Deployment Logs</span>
      </MenuItem>
    </>
  );
}
