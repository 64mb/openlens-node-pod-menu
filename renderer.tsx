/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@k8slens/extensions";
import { NodeMenu } from "./src/node-menu";
import { PodAttachMenu } from "./src/attach-menu";
import { PodShellMenu } from "./src/shell-menu";
import { PodLogsMenu } from "./src/logs-menu";
import { DeploymentMenu } from "./src/deployment-menu";
import { DaemonSetMenu } from "./src/daemonset-menu";
import { SecretDetails } from "./src/secret-details";
import React from "react";

export default class PodMenuRendererExtension extends Renderer.LensExtension {
  setTopBarColor = (color = '#2e3136')=>{
    const clusterManager = window.document.querySelector('div.ClusterManager')
    if(clusterManager){
      const topBar = clusterManager.childNodes[0]
      if(topBar){
        (topBar as HTMLElement).style.backgroundColor = color
      }
    }
  }

  check = (check = '', tag = 'common')=>{
    const checkLower = check.toLowerCase()
    if(checkLower === tag || checkLower.includes(`-${tag}-`) || checkLower.match(`^${tag}-`)){
      return true
    }
    return false
  }

  headListener = ()=>{
    const iframes = window.document.querySelectorAll('iframe');

    this.setTopBarColor();

    if(iframes.length < 1){
      return
    }

    for(const iframe of iframes){
      if(iframe.className === 'hidden'){
        continue
      }
      const name = iframe.getAttribute('name');

      if(this.check(name, 'enterprise')){
        this.setTopBarColor('#212121');
      } else if(this.check(name, 'opensource')){
        this.setTopBarColor('#f57c00');
      }
      else if(this.check(name, 'staging')){
        this.setTopBarColor('#fbc02d');
      }
      else if(this.check(name, 'prod')){
        this.setTopBarColor('#d32f2f');
      }
    }
  }
  interval: NodeJS.Timer = null;

  onActivate(): Promise<void> {
    if(this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(this.headListener, 500)
    return Promise.resolve();
  }
  onDeactivate(): Promise<void> {
    clearInterval(this.interval)
    return Promise.resolve();
  }
  kubeObjectMenuItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Node>) => <NodeMenu {...props} />,
      },
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Pod>) => <PodAttachMenu {...props} />,
      },
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Pod>) => <PodShellMenu {...props} />,
      },
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Pod>) => <PodLogsMenu {...props} />,
      },
    },
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Deployment>) => <DeploymentMenu {...props} />,
      },
    },
    {
      kind: "DaemonSet",
      apiVersions: ["apps/v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.DaemonSet>) => <DaemonSetMenu {...props} />,
      },
    },
  ];
  kubeObjectDetailItems = [
    {
      kind: "Secret",
      apiVersions: ["v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Secret>) => (
          <SecretDetails {...props} />
        )
      }
    }
  ];
}
