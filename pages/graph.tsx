import { useSubscription, useMutation } from '@apollo/react-hooks';
import { ApolloClientTokenizedProvider } from '@deepcase/react-hasura/apollo-client-tokenized-provider';
import gql from 'graphql-tag';
import React, { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { makeStyles } from '@material-ui/core';
import ColorHash from 'color-hash';

import 'normalize.css';

import * as THREE from 'three';
import 'three-vrcontroller-module';

import { DemoTokenProvider } from './index';
import { useLocalStore, LocalStoreProvider } from '@deepcase/store/local';
import { NODES, INSERT_NODES, UPDATE_NODES, DELETE_NODES } from '../imports/gql';

const ForceGraph2D = dynamic(() => import('react-force-graph').then(m => m.ForceGraph2D), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph').then(m => m.ForceGraph3D), { ssr: false });
const ForceGraphVR = dynamic(() => import('react-force-graph').then(m => m.ForceGraphVR), { ssr: false });
const ForceGraphAR = dynamic(() => import('react-force-graph').then(m => m.ForceGraphAR), { ssr: false });

const colorHash = new ColorHash();

const modes = { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR };

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    left: 0, top: 0,
    width: '100%', height: '100%',
    backgroundColor: '#000000',
    '& > div, & > div > div': {
      position: 'absolute',
      left: 0, top: 0,
      width: '100%', height: '100%',
    }
  },
}));

export function PageConnected() {
  const classes = useStyles();
  const nq = useSubscription(NODES);
  const [insert] = useMutation(INSERT_NODES);
  const [update] = useMutation(UPDATE_NODES);
  const [delet] = useMutation(DELETE_NODES);
  const [mode, setMode] = useLocalStore('force-graph-mode', 'ForceGraph2D');
  const ForceGraph = modes[mode];
  const [selectedNode, setSelectedNode] = useState<number | void>();
  const [operation, setOperation] = useState<string | void>();

  const dataRef = useRef({ nodes: [], links: [] });
  const data = useMemo(() => {
    const data = {
      nodes: (nq?.data?.nodes || []).map(n => ({ id: n.id, _node: n, type: n.id, ...dataRef?.current?.nodes?.find(o => o.id === n.id) })),
      links: [
        ...(nq?.data?.nodes || []).filter(n => n.from_id).map(n => ({ id: `${n.id}_from`, _node: n, type: 'from', ...dataRef?.current?.links?.find(o => o.id === `${n.id}_from`), source: n.id, target: n.from_id })),
        ...(nq?.data?.nodes || []).filter(n => n.to_id).map(n => ({ id: `${n.id}_to`, _node: n, type: 'to', ...dataRef?.current?.links?.find(o => o.id === `${n.id}_to`), source: n.id, target: n.to_id })),
        ...(nq?.data?.nodes || []).filter(n => n.type_id).map(n => ({ id: `${n.id}_type`, _node: n, type: 'type', ...dataRef?.current?.links?.find(o => o.id === `${n.id}_type`), source: n.id, target: n.type_id })),
      ],
    };
    dataRef.current = data;
    return data;
  }, [nq, selectedNode]);

  return <>
    <div className={classes.root}>
      <ForceGraph
        backgroundColor="#000000"
        d3VelocityDecay={0.9}
        graphData={data}
        nodeColor={n => n.id === selectedNode ? '#ffffff' : n?._node?.type_id ? colorHash.hex(n?._node?.type_id) : colorHash.hex(n?._node?.id)}
        linkOpacity={1}
        linkColor={n => n.type === 'type' ? '#2e2e2e' : n?._node?.type_id ? colorHash.hex(n?._node?.type_id) : colorHash.hex(n?._node?.id)}
        linkWidth={n => n.type === 'type' ? 0.3 : 1}
        linkLabel={n => n.type}
        nodeLabel={n => n.type}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onBackgroundClick={() => setSelectedNode()}
        onNodeClick={async (node) => {
          if (operation) {
            if (operation === 'from') {
              await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { from_id: +node.id } } });
              setOperation();
            } else if (operation === 'to') {
              await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { to_id: +node.id } } });
              setOperation();
            } else if (operation === 'type') {
              await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { type_id: +node.id } } });
              setOperation();
            } else if (operation === 'link') {
              await insert({ variables: { objects: { from_id: +selectedNode, to_id: +node.id } } });
              setOperation();
              setSelectedNode();
            }
          } else {
            setSelectedNode(+node.id);
          }
        }}
      />
    </div>
    <div style={{
      position: 'absolute',
      left: 0, top: 0,
    }}>
      <button disabled={mode == 'ForceGraphVR'} onClick={() => setMode('ForceGraphVR')}>VR</button>
      <button disabled={mode == 'ForceGraph3D'} onClick={() => setMode('ForceGraph3D')}>3D</button>
      <button disabled={mode == 'ForceGraph2D'} onClick={() => setMode('ForceGraph2D')}>2D</button>
      <br/>
      <button disabled={!!operation} onClick={async () => insert({ variables: { objects: {} } })}>node</button>
      <button disabled={!!operation} onClick={async () => {
        await delet({ variables: { where: { id: { _eq: +selectedNode } } } });
        setSelectedNode();
      }}>delete</button>
      <br/>
      <button disabled={!!operation} onClick={() => setOperation('type')}>set type</button>
      <button disabled={!!operation} onClick={async () => {
        await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { type_id: null } } });
        setSelectedNode();
      }}>unset type</button>
      <br/>
      <button disabled={!!operation} onClick={() => setOperation('from')}>set from</button>
      <button disabled={!!operation} onClick={async () => {
        await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { from_id: null } } });
        setSelectedNode();
      }}>unset from</button>
      <br/>
      <button disabled={!!operation} onClick={() => setOperation('to')}>set to</button>
      <button disabled={!!operation} onClick={async () => {
        await update({ variables: { where: { id: { _eq: +selectedNode } }, set: { to_id: null } } });
        setSelectedNode();
      }}>unset to</button>
      <br/>
      <button disabled>{selectedNode || '?'}</button>
      <button disabled={!selectedNode} onClick={() => setSelectedNode()}>unselect</button>
      <button disabled={!operation} onClick={() => setOperation()}>cancel</button>
    </div>
  </>;
}

export default function Page() {
  return (
    <LocalStoreProvider>
      <DemoTokenProvider>
        <ApolloClientTokenizedProvider options={{ client: 'hasura-example-client', path: `${process.env.NEXT_PUBLIC_HASURA_PATH}/v1/graphql`, ssl: !!+process.env.NEXT_PUBLIC_HASURA_SSL, ws: !!process?.browser }}>
          {!!process.browser && <PageConnected/>}
        </ApolloClientTokenizedProvider>
      </DemoTokenProvider>
    </LocalStoreProvider>
  );
}
