"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF, GLTFParser } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
  VRMExpressionPresetName,
  VRMHumanBoneName,
} from "@pixiv/three-vrm";

export default function Player() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    camera.position.set(0, 1.35, 2.0);

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(1, 1.5, 1.2);
    scene.add(dir);

    // square canvas
    const setSize = () => {
      const parent = canvas.parentElement ?? document.body;
      const w = parent.clientWidth || 480;
      const h = parent.clientHeight || 480;
      const size = Math.min(w, h);
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    setSize();
    window.addEventListener("resize", setSize);

    // loader
    const loader = new GLTFLoader();
    loader.register((parser: GLTFParser) => new VRMLoaderPlugin(parser));

    let disposed = false;
    let vrm: VRM | null = null;

    // bones
    let LSh: THREE.Object3D | null = null;
    let RSh: THREE.Object3D | null = null;
    let LUp: THREE.Object3D | null = null;
    let RUp: THREE.Object3D | null = null;
    let LLo: THREE.Object3D | null = null;
    let RLo: THREE.Object3D | null = null;

    // original local quats (to stack our pose cleanly every frame)
    const baseQ: Record<string, THREE.Quaternion> = {};

    // chosen offsets (autodetected)
    const leftOffsets  = { sh: new THREE.Euler(), up: new THREE.Euler(), lo: new THREE.Euler() };
    const rightOffsets = { sh: new THREE.Euler(), up: new THREE.Euler(), lo: new THREE.Euler() };

    // dispose helper
    const disposeObject3D = (root: THREE.Object3D) => {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        const kill = (mat: THREE.Material) => {
          // @ts-ignore
          Object.values(mat).forEach((v) => v?.isTexture && (v as THREE.Texture).dispose());
          mat.dispose();
        };
        if (Array.isArray(m)) m.forEach(kill);
        else if (m) kill(m);
      });
    };

    // talking (visemes: Aa → Ih → Ou) – triggered by Chat via window events
    let talking = false;
    let talkT = 0;
    const startTalking = (ms?: number) => {
      talking = true;
      talkT = 0;
      if (ms && ms > 0) {
        window.clearTimeout((startTalking as any)._to);
        (startTalking as any)._to = window.setTimeout(() => (talking = false), ms);
      }
    };
    const stopTalking = () => {
      talking = false;
      if (vrm?.expressionManager) {
        vrm.expressionManager.setValue(VRMExpressionPresetName.Aa, 0);
        vrm.expressionManager.setValue(VRMExpressionPresetName.Ih, 0);
        vrm.expressionManager.setValue(VRMExpressionPresetName.Ou, 0);
      }
    };
    const onTalk = (e: Event) => {
      const ms = (e as CustomEvent<{ ms?: number }>).detail?.ms;
      startTalking(ms);
    };
    const onTalkStop = () => stopTalking();
    window.addEventListener("waifu:talk", onTalk as EventListener);
    window.addEventListener("waifu:talk-stop", onTalkStop);

    // apply base * extraEuler each frame (keeps pose stable)
    const applyLocal = (bone: THREE.Object3D | null, key: string, euler: THREE.Euler) => {
      if (!bone) return;
      const q = baseQ[key];
      if (!q) return;
      const extra = new THREE.Quaternion().setFromEuler(euler);
      bone.quaternion.copy(q).multiply(extra);
      bone.updateMatrixWorld(true);
    };

    // test a candidate offset and return the elbow Y (lower is better)
    const testLeftCandidate = (sh?: THREE.Euler, up?: THREE.Euler, lo?: THREE.Euler) => {
      if (!LSh || !LUp || !LLo) return Number.POSITIVE_INFINITY;
      // apply temp
      applyLocal(LSh, "LSh", sh ?? new THREE.Euler());
      applyLocal(LUp, "LUp", up ?? new THREE.Euler());
      applyLocal(LLo, "LLo", lo ?? new THREE.Euler());
      // get elbow world Y
      const elbowWorld = new THREE.Vector3();
      LLo.getWorldPosition(elbowWorld);
      // restore (re-apply base only)
      LSh.quaternion.copy(baseQ["LSh"]);
      LUp.quaternion.copy(baseQ["LUp"]);
      LLo.quaternion.copy(baseQ["LLo"]);
      LSh.updateMatrixWorld(true);
      LUp.updateMatrixWorld(true);
      LLo.updateMatrixWorld(true);
      return elbowWorld.y;
    };

    const testRightCandidate = (sh?: THREE.Euler, up?: THREE.Euler, lo?: THREE.Euler) => {
      if (!RSh || !RUp || !RLo) return Number.POSITIVE_INFINITY;
      applyLocal(RSh, "RSh", sh ?? new THREE.Euler());
      applyLocal(RUp, "RUp", up ?? new THREE.Euler());
      applyLocal(RLo, "RLo", lo ?? new THREE.Euler());
      const elbowWorld = new THREE.Vector3();
      RLo.getWorldPosition(elbowWorld);
      RSh.quaternion.copy(baseQ["RSh"]);
      RUp.quaternion.copy(baseQ["RUp"]);
      RLo.quaternion.copy(baseQ["RLo"]);
      RSh.updateMatrixWorld(true);
      RUp.updateMatrixWorld(true);
      RLo.updateMatrixWorld(true);
      return elbowWorld.y;
    };

    // build a small search space of plausible rotations (in degrees)
    const DEG = THREE.MathUtils.degToRad;
    const shoulderRolls = [0, 15, 25, 35];    // Z-ish
    const upperRolls    = [70, 85, 95, 105];  // Z-ish (big drop from T)
    const upperPitch    = [-15, -8, 0, 8, 15];// X-ish (forward/back tweak)
    const elbowBends    = [10, 18, 26, 34];   // X-ish (natural bend)

    const pickBestOffsets = (side: "L" | "R") => {
      let best = { sh: new THREE.Euler(), up: new THREE.Euler(), lo: new THREE.Euler() };
      let bestY = Number.POSITIVE_INFINITY;

      for (const shZ of shoulderRolls) {
        for (const upZ of upperRolls) {
          for (const upX of upperPitch) {
            for (const loX of elbowBends) {
              // Left uses negative Z for roll; Right uses positive Z
              const sgn = side === "L" ? -1 : +1;

              const sh = new THREE.Euler(0, 0, sgn * DEG(shZ));
              const up = new THREE.Euler(DEG(upX), 0, sgn * DEG(upZ));
              const lo = new THREE.Euler(DEG(loX), 0, 0);

              const y = side === "L" ? testLeftCandidate(sh, up, lo) : testRightCandidate(sh, up, lo);
              if (y < bestY) {
                bestY = y;
                best = { sh, up, lo };
              }
            }
          }
        }
      }
      return best;
    };

    loader.load(
      "/aiko.vrm",
      (gltf: GLTF) => {
        if (disposed) return;
        vrm = (gltf.userData as any).vrm as VRM;

        VRMUtils.removeUnnecessaryJoints(vrm.scene);
        VRMUtils.removeUnnecessaryVertices(vrm.scene);

        scene.add(vrm.scene);

        // face camera
        vrm.scene.rotation.y = Math.PI;
        camera.lookAt(0, 1.35, 0);

        // cache bones
        LSh = vrm.humanoid?.getBoneNode(VRMHumanBoneName.LeftShoulder) ?? null;
        RSh = vrm.humanoid?.getBoneNode(VRMHumanBoneName.RightShoulder) ?? null;
        LUp = vrm.humanoid?.getBoneNode(VRMHumanBoneName.LeftUpperArm) ?? null;
        RUp = vrm.humanoid?.getBoneNode(VRMHumanBoneName.RightUpperArm) ?? null;
        LLo = vrm.humanoid?.getBoneNode(VRMHumanBoneName.LeftLowerArm) ?? null;
        RLo = vrm.humanoid?.getBoneNode(VRMHumanBoneName.RightLowerArm) ?? null;

        // save base local quaternions
        const saveQ = (bone: THREE.Object3D | null, key: string) => {
          if (bone) baseQ[key] = bone.quaternion.clone();
        };
        saveQ(LSh, "LSh"); saveQ(RSh, "RSh");
        saveQ(LUp, "LUp"); saveQ(RUp, "RUp");
        saveQ(LLo, "LLo"); saveQ(RLo, "RLo");

        // === auto-calibrate best arm-down offsets ===
        if (LSh && LUp && LLo) Object.assign(leftOffsets,  pickBestOffsets("L"));
        if (RSh && RUp && RLo) Object.assign(rightOffsets, pickBestOffsets("R"));

        let t = 0;
        renderer.setAnimationLoop(() => {
          if (!vrm) return;
          t += 0.03;

          // enforce arms-down every frame with the calibrated offsets
          applyLocal(LSh, "LSh", leftOffsets.sh);
          applyLocal(LUp, "LUp", leftOffsets.up);
          applyLocal(LLo, "LLo", leftOffsets.lo);

          applyLocal(RSh, "RSh", rightOffsets.sh);
          applyLocal(RUp, "RUp", rightOffsets.up);
          applyLocal(RLo, "RLo", rightOffsets.lo);

          // idle sway
          vrm.scene.rotation.y = Math.PI + Math.sin(t * 0.25) * 0.04;

          // blink
          const blinkOn = (Math.sin(t) + 1) / 2 > 0.97 ? 1 : 0;
          vrm.expressionManager?.setValue(VRMExpressionPresetName.Blink, blinkOn);

          // mouth AFTER message (Chat dispatches the event then)
          if (talking && vrm.expressionManager) {
            talkT += 0.12;
            const phase = Math.floor(talkT % 3);
            vrm.expressionManager.setValue(VRMExpressionPresetName.Aa, phase === 0 ? 1 : 0);
            vrm.expressionManager.setValue(VRMExpressionPresetName.Ih, phase === 1 ? 1 : 0);
            vrm.expressionManager.setValue(VRMExpressionPresetName.Ou, phase === 2 ? 1 : 0);
          }

          vrm.update(1 / 60);
          renderer.render(scene, camera);
        });
      },
      undefined,
      (err: unknown) => console.error("Failed to load VRM:", err)
    );

    return () => {
      disposed = true;
      window.removeEventListener("resize", setSize);
      window.removeEventListener("waifu:talk", onTalk as EventListener);
      window.removeEventListener("waifu:talk-stop", onTalkStop);
      renderer.setAnimationLoop(null);

      if (vrm) {
        scene.remove(vrm.scene);
        disposeObject3D(vrm.scene);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section className="h-full w-full flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </section>
  );
}
