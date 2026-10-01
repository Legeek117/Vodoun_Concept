import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/**
 * BakedModel — applique une texture « baked » (éclairage cuit dans Blender)
 * sur tous les mailles d'un GLB, via un unique MeshBasicMaterial.
 *
 * Pourquoi : aucun calcul d'illumination par fragment, zéro lumière dynamique,
 * zéro shadow map → le rendu 3D « photo-réaliste » à coût minimal.
 * (Équivalent du BakedModel.ts du portfolio de Henry Heffernan.)
 *
 * ⚠️ Règle d'or : l'objet ne doit être animé que par TRANSLATION ou échelle.
 * Toute rotation ferait défiler la lumière cuite avec l'objet (artefact).
 *
 * Props :
 *  url        : chemin du GLB (ex. '/masque.glb')
 *  textureUrl : chemin de la texture baked (ex. '/masque_baked.webp')
 *  scaleTo    : dimension max cible (ex. 2.8) — normalise l'objet
 *  position   : [x, y, z] optionnel
 */
export default function BakedModel({
  url,
  textureUrl,
  scaleTo,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
}) {
  const gltf = useLoader(GLTFLoader, url);
  const texture = useLoader(TextureLoader, textureUrl);

  const material = useMemo(() => {
    const tex = texture.clone();
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: tex });
  }, [texture]);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);

    // Applique le matériau baked à tous les meshes (partage du draw call)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    // Normalisation éventuelle de la taille
    if (scaleTo) {
      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) clone.scale.setScalar(scaleTo / maxDim);
      clone.updateMatrixWorld(true);

      const box2 = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      box2.getCenter(center);
      clone.position.sub(center);
    }

    return clone;
  }, [gltf, material, scaleTo]);

  return <primitive object={scene} position={position} rotation={rotation}>{children}</primitive>;
}