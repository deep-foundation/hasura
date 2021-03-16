import { ApolloClientTokenizedProvider } from '@deepcase/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider } from '@deepcase/store/local';
import dynamic from 'next/dynamic';
import 'normalize.css';
import React, { useRef, useState } from 'react';
import { useFrame } from 'react-three-fiber';
import { Mesh } from 'three';
import 'three-vrcontroller-module';
import { DemoTokenProvider } from './index';

const VRCanvas = dynamic(() => import('@react-three/xr').then(m => m.VRCanvas), { ssr: false });
// @ts-ignore
const DefaultXRControllers = dynamic(() => import('@react-three/xr').then(m => m.DefaultXRControllers), { ssr: false });

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export function PageConnected() {
  return <div style={{
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
  }}>
    <VRCanvas>
      <DefaultXRControllers />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </VRCanvas>
  </div>;
}

export default function Page() {
  return (
    <LocalStoreProvider>
      <DemoTokenProvider>
        <ApolloClientTokenizedProvider options={{ client: 'hasura-example-client', path: `${process.env.HASURA_PATH}/v1/graphql`, ssl: !!+process.env.HASURA_SSL, ws: !!process?.browser }}>
          {!!process.browser && <PageConnected/>}
        </ApolloClientTokenizedProvider>
      </DemoTokenProvider>
    </LocalStoreProvider>
  );
}
