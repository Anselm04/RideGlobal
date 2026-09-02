export const snowboardConfig = {
  id: 'snowboard',
  label: 'Snowboard',
  acceleration: 26,
  maxSpeed: 32,
  jumpForce: 10,
  turnSpeed: 2.9,
  surface: 'snow',
};

export function createSnowboardRider(THREE) {
  const rider = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.06, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xff3388 })
  );
  board.position.y = 0.2;
  board.castShadow = true;
  rider.add(board);

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.05, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x3388ff })
  );
  torso.position.y = 0.95;
  torso.rotation.y = 0.35;
  torso.castShadow = true;
  rider.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffcc99 })
  );
  head.position.y = 1.6;
  head.castShadow = true;
  rider.add(head);

  return { rider, torso };
}
