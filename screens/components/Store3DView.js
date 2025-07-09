// screens/components/Store3DView.js
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Store3DView() {
  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // ✅ Load your GLB model from Vercel
    const modelUrl = 'https://expressscan-store-map.vercel.app/store.glb';

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(2, 2, 2);           // optional: resize
        model.position.set(0, 0, 0);        // center it
        scene.add(model);
        console.log('✅ Model loaded');
      },
      undefined,
      (error) => {
        console.error('❌ Model load failed:', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}
