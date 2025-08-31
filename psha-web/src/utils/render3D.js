import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function render3D(
  canvasRef,
  coordsUp,
  coordsDown,
  dipAngle = 0,
  strikeAngle = 0,
  mechanism = "default"
) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // Bersihkan scene lama biar nggak double render
  while (canvas.firstChild) {
    canvas.removeChild(canvas.firstChild);
  }

  // Buat scene, kamera, renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111827);

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 400;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.set(0, -200, 150);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);

  // Tambah lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(100, 100, 200);
  scene.add(dirLight);

  // Convert koordinat (lat/lon ke X/Y, depth ke Z)
  const toVec3 = (p) =>
    new THREE.Vector3(
      p.lon, // X
      p.lat, // Y
      -(p.depth || 0) // Z ke bawah
    );

  const upperPoints = coordsUp.map(toVec3);
  const lowerPoints = coordsDown?.map(toVec3) || [];

  let targetObj = null;

  // Polygon mekanisme subduction interface (surface)
  if (mechanism === "subduction") {
    const shape = new THREE.Shape(
      upperPoints.map((p) => new THREE.Vector2(p.x, p.y))
    );

    const depth =
      lowerPoints.length > 0
        ? Math.max(...lowerPoints.map((p) => -p.z))
        : 50;

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });

    const material = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      opacity: 0.7,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Rotasi supaya sesuai orientasi map
    mesh.rotation.x = THREE.MathUtils.degToRad(-90);
    mesh.rotation.z = THREE.MathUtils.degToRad(strikeAngle || 0);
    mesh.rotation.y = THREE.MathUtils.degToRad(dipAngle || 0);

    scene.add(mesh);
    targetObj = mesh;
  } else {
    // Default: garis polygon atas & bawah
    const material = new THREE.LineBasicMaterial({ color: 0x22d3ee });

    const lineUp = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(upperPoints),
      material
    );

    scene.add(lineUp);
    targetObj = lineUp;

    if (lowerPoints.length > 0) {
      const lineDown = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(lowerPoints),
        material
      );
      scene.add(lineDown);
    }
  }

  // Grid helper biar jelas sumbu
  const grid = new THREE.GridHelper(200, 20);
  scene.add(grid);

  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  // Auto focus kamera ke bounding box objek utama
  if (targetObj) {
    const box = new THREE.Box3().setFromObject(targetObj);
    const center = new THREE.Vector3();
    box.getCenter(center);

    controls.target.copy(center);
    camera.position.set(center.x + 200, center.y - 200, center.z + 150);
  }

  // Resize handler biar responsive
  window.addEventListener("resize", () => {
    const newWidth = canvas.clientWidth || 600;
    const newHeight = canvas.clientHeight || 400;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
