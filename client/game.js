
// ==== MULTIPLAYER COLYSEUS INTEGRAÇÃO ====
window.colyseusClient = null;
window.matchRoom = null;
try {
  if (typeof Colyseus !== 'undefined' && typeof Colyseus.Client === 'function') {
    const wsProto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsHost = window.location.hostname || 'localhost';
    window.colyseusClient = new Colyseus.Client(`${wsProto}${wsHost}:2567`);
  }
} catch (e) {
  console.warn('Colyseus Client init error:', e);
}

// --- SETUP THREE.JS ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0f1e, 6, 26);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 50);
    const CAM_HEIGHT = 1.7;
    camera.position.set(0, CAM_HEIGHT, 0);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    scene.background = new THREE.Color(0x0a0f1e);

    // --- ILUMINAÇÃO DE CAMPEONATO ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x030712, 0.45);
    scene.add(hemiLight);

    // Luz direcional de preenchimento
    const dirLight = new THREE.DirectionalLight(0xfffaed, 0.8);
    dirLight.position.set(3, 7, 2);
    scene.add(dirLight);

    // Chão geral da arena com grade metálica
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = 64;
    gridCanvas.height = 64;
    const gctx = gridCanvas.getContext('2d');
    gctx.strokeStyle = '#1e293b';
    gctx.lineWidth = 1;
    gctx.strokeRect(0, 0, 64, 64);
    gctx.strokeRect(16, 0, 32, 64);
    gctx.strokeRect(0, 16, 64, 32);
    const gridTex = new THREE.CanvasTexture(gridCanvas);
    gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(32, 32);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshLambertMaterial({ color: 0x060b14, map: gridTex })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // --- RINGUE PROFISSIONAL ---
    const ringGroup = new THREE.Group();
    const ringSize = 4.6;
    const pHeight = 1.35;

    // 1. Textura Procedural em Alta Definição da Lona do Ringue
    const canvasTexCanvas = document.createElement('canvas');
    canvasTexCanvas.width = 1024;
    canvasTexCanvas.height = 1024;
    const cctx = canvasTexCanvas.getContext('2d');

    // Fundo da lona (tecido canvas premium)
    cctx.fillStyle = '#f8fafc';
    cctx.fillRect(0, 0, 1024, 1024);

    // Trama de tecido
    cctx.fillStyle = 'rgba(148, 163, 184, 0.07)';
    for (let x = 0; x < 1024; x += 4) cctx.fillRect(x, 0, 2, 1024);
    for (let y = 0; y < 1024; y += 4) cctx.fillRect(0, y, 1024, 2);

    // Borda dupla azul e vermelha do ringue
    cctx.lineWidth = 16;
    cctx.strokeStyle = '#0284c7'; // Borda externa azul
    cctx.strokeRect(36, 36, 952, 952);

    cctx.lineWidth = 6;
    cctx.strokeStyle = '#dc2626'; // Linha interna vermelha
    cctx.strokeRect(60, 60, 904, 904);

    // Zona demarcada do Canto Vermelho (topo-esquerda)
    cctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
    cctx.beginPath();
    cctx.moveTo(60, 60);
    cctx.lineTo(260, 60);
    cctx.lineTo(60, 260);
    cctx.closePath();
    cctx.fill();

    // Zona demarcada do Canto Azul (inferior-direita)
    cctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    cctx.beginPath();
    cctx.moveTo(964, 964);
    cctx.lineTo(764, 964);
    cctx.lineTo(964, 764);
    cctx.closePath();
    cctx.fill();

    // Brasão Central Oficial da Liga
    cctx.save();
    cctx.translate(512, 512);

    cctx.lineWidth = 8;
    cctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    cctx.beginPath();
    cctx.arc(0, 0, 215, 0, Math.PI * 2);
    cctx.stroke();

    cctx.lineWidth = 3;
    cctx.strokeStyle = '#0284c7';
    cctx.beginPath();
    cctx.arc(0, 0, 230, 0, Math.PI * 2);
    cctx.stroke();

    cctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
    cctx.beginPath();
    cctx.arc(0, 0, 210, 0, Math.PI * 2);
    cctx.fill();

    cctx.fillStyle = '#0f172a';
    cctx.font = 'bold 32px "Segoe UI", system-ui, sans-serif';
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    cctx.letterSpacing = '5px';
    cctx.fillText('VIRTUAL BOXING', 0, -38);

    cctx.fillStyle = '#dc2626';
    cctx.font = '900 42px "Segoe UI", system-ui, sans-serif';
    cctx.letterSpacing = '7px';
    cctx.fillText('CHAMPIONSHIP', 0, 16);

    cctx.fillStyle = '#f59e0b';
    cctx.font = '30px sans-serif';
    cctx.fillText('★  🥊  ★', 0, 70);
    cctx.restore();

    const ringFloorTex = new THREE.CanvasTexture(canvasTexCanvas);
    ringFloorTex.anisotropy = 4;

    const ringFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(ringSize, ringSize),
      new THREE.MeshLambertMaterial({ map: ringFloorTex })
    );
    ringFloor.rotation.x = -Math.PI / 2;
    ringFloor.position.y = 0.015;
    ringGroup.add(ringFloor);

    // 2. Tablado Elevado e Saia Lateral (Ring Apron)
    const stageWidth = ringSize + 1.2;
    const stageHeight = 0.45;
    const ringStage = new THREE.Mesh(
      new THREE.BoxGeometry(stageWidth, stageHeight, stageWidth),
      new THREE.MeshLambertMaterial({ color: 0x080e1a })
    );
    ringStage.position.y = -stageHeight / 2 + 0.01;
    ringGroup.add(ringStage);

    // Borda decorativa do tablado
    const stageBorder = new THREE.Mesh(
      new THREE.BoxGeometry(stageWidth + 0.04, 0.06, stageWidth + 0.04),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    stageBorder.position.y = -0.01;
    ringGroup.add(stageBorder);

    // 3. Postes de Aço e Almofadas de Canto
    const corners = [
      new THREE.Vector3(-ringSize/2, 0, -ringSize/2), // 0: Canto Vermelho (Top-Left)
      new THREE.Vector3(ringSize/2, 0, -ringSize/2),  // 1: Canto Neutro (Top-Right)
      new THREE.Vector3(ringSize/2, 0, ringSize/2),   // 2: Canto Azul (Bottom-Right)
      new THREE.Vector3(-ringSize/2, 0, ringSize/2)   // 3: Canto Neutro (Bottom-Left)
    ];

    const steelPostMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const padMatRed = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const padMatBlue = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const padMatNeutral = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

    corners.forEach((pos, idx) => {
      // Poste cilíndrico de aço
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, pHeight + 0.1, 16), steelPostMat);
      post.position.copy(pos);
      post.position.y = (pHeight + 0.1) / 2;
      ringGroup.add(post);

      // Almofada do canto (Corner Pad)
      let padMat = padMatNeutral;
      if (idx === 0) padMat = padMatRed;
      else if (idx === 2) padMat = padMatBlue;

      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.24, pHeight * 0.88, 0.24), padMat);
      const inwardDir = new THREE.Vector3(0, 0, 0).sub(pos).normalize().multiplyScalar(0.07);
      pad.position.copy(pos).add(inwardDir);
      pad.position.y = pHeight * 0.5;
      ringGroup.add(pad);
    });

    // 4. Quatro Cordas Profissionais com Vinil Colorido
    const ropeHeights = [0.35, 0.65, 0.95, 1.25];
    const ropes = [];
    const ropeMatTop = new THREE.MeshLambertMaterial({ color: 0xdc2626 }); // Topo: Vermelha
    const ropeMatMid = new THREE.MeshLambertMaterial({ color: 0xf8fafc }); // Meio: Branca
    const ropeMatBot = new THREE.MeshLambertMaterial({ color: 0x2563eb }); // Base: Azul

    ropeHeights.forEach((h, rIdx) => {
      let currentMat = ropeMatMid;
      if (rIdx === 3) currentMat = ropeMatTop;
      else if (rIdx === 0) currentMat = ropeMatBot;

      for (let i = 0; i < 4; i++) {
        const p1 = corners[i];
        const p2 = corners[(i + 1) % 4];
        const dist = p1.distanceTo(p2);

        const group = new THREE.Group();
        const r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, dist / 2, 10), currentMat);
        const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, dist / 2, 10), currentMat);

        group.add(r1, r2);
        ringGroup.add(group);
        ropes.push({
          p1: p1.clone().setY(h),
          p2: p2.clone().setY(h),
          r1, r2,
          midPush: new THREE.Vector3(),
          baseDist: dist / 2
        });
      }
    });

    // Espaçadores verticais de lona entre as cordas nos 4 lados
    const spacerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const spacer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.04), spacerMat);
      spacer.position.set(mid.x, 0.8, mid.z);
      ringGroup.add(spacer);
    }

    // --- ESTRUTURA DA ARENA, TELÕES E PLATEIA ---
    const arenaGroup = new THREE.Group();

    // Degraus da arquibancada com iluminação esportiva
    for (let i = 0; i < 7; i++) {
      const radius = 6.5 + i * 1.6;
      const yPos = i * 1.35;
      const geom = new THREE.CylinderGeometry(radius, radius, 1.35, 48, 1, true);
      const tierMat = new THREE.MeshLambertMaterial({ 
        color: i % 2 === 0 ? 0x090e1a : 0x141e30, 
        side: THREE.BackSide 
      });
      const ring = new THREE.Mesh(geom, tierMat);
      ring.position.y = yPos;
      arenaGroup.add(ring);
    }

    // Telão Circular LED (Jumbotron Ribbon)
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 1024;
    ledCanvas.height = 64;
    const lctx = ledCanvas.getContext('2d');
    lctx.fillStyle = '#060b14';
    lctx.fillRect(0, 0, 1024, 64);
    lctx.fillStyle = '#38bdf8';
    lctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.letterSpacing = '5px';
    lctx.fillText('★ VIRTUAL BOXING CHAMPIONSHIP ★ ROUND BY ROUND ★ WORLD TITLE FIGHT ★', 512, 32);

    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.wrapS = THREE.RepeatWrapping;
    ledTex.repeat.set(4, 1);

    const ledRibbon = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 1.3, 48, 1, true),
      new THREE.MeshBasicMaterial({ map: ledTex, side: THREE.BackSide })
    );
    ledRibbon.position.y = 8.5;
    arenaGroup.add(ledRibbon);

    // Sistema de Flashes da Plateia (Partículas com animação dinâmica)
    const flashCount = 160;
    const flashGeo = new THREE.BufferGeometry();
    const flashPos = new Float32Array(flashCount * 3);

    for (let i = 0; i < flashCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const tierDist = 7 + Math.random() * 11;
      const tierY = (tierDist - 6) * 0.85 + Math.random() * 0.8;
      flashPos[i * 3] = Math.cos(angle) * tierDist;
      flashPos[i * 3 + 1] = tierY;
      flashPos[i * 3 + 2] = Math.sin(angle) * tierDist - 0.9;
    }
    flashGeo.setAttribute('position', new THREE.BufferAttribute(flashPos, 3));

    const flashCanvas = document.createElement('canvas');
    flashCanvas.width = 32;
    flashCanvas.height = 32;
    const fctx = flashCanvas.getContext('2d');
    const grad = fctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(224, 242, 254, 0.75)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    fctx.fillStyle = grad;
    fctx.fillRect(0, 0, 32, 32);

    const flashTex = new THREE.CanvasTexture(flashCanvas);
    const flashMat = new THREE.PointsMaterial({
      size: 0.5,
      map: flashTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const crowdFlashPoints = new THREE.Points(flashGeo, flashMat);
    arenaGroup.add(crowdFlashPoints);

    // Teto escuro
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshBasicMaterial({ color: 0x02050e, side: THREE.DoubleSide })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 12;
    arenaGroup.add(ceiling);

    // Paredes de fundo
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 20, 25, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x020617, side: THREE.BackSide })
    );
    wall.position.y = 5;
    arenaGroup.add(wall);

    scene.add(arenaGroup);

    // --- TRELIÇA DE ILUMINAÇÃO SUSPENSA (LIGHTING TRUSS RIG) ---
    const trussGroup = new THREE.Group();
    const trussHeight = 5.2;
    const trussSize = ringSize + 1.2;
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

    // 4 vigas da treliça
    const beamX1 = new THREE.Mesh(new THREE.BoxGeometry(trussSize, 0.18, 0.18), trussMat);
    beamX1.position.set(0, trussHeight, -trussSize / 2);
    const beamX2 = new THREE.Mesh(new THREE.BoxGeometry(trussSize, 0.18, 0.18), trussMat);
    beamX2.position.set(0, trussHeight, trussSize / 2);
    const beamZ1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, trussSize), trussMat);
    beamZ1.position.set(-trussSize / 2, trussHeight, 0);
    const beamZ2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, trussSize), trussMat);
    beamZ2.position.set(trussSize / 2, trussHeight, 0);
    trussGroup.add(beamX1, beamX2, beamZ1, beamZ2);

    // Baterias de Refletores de Arena (Spotlights direcionados para a lona)
    const ringTarget = new THREE.Object3D();
    ringTarget.position.set(0, 0, -0.9);
    scene.add(ringTarget);

    const spotFixtureMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const spotLensMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

    const spotPositions = [
      { x: -trussSize / 2.3, z: -trussSize / 2.3, col: 0xfffaed, int: 1.5 },
      { x:  trussSize / 2.3, z: -trussSize / 2.3, col: 0xfffaed, int: 1.5 },
      { x: -trussSize / 2.3, z:  trussSize / 2.3, col: 0xfffaed, int: 1.5 },
      { x:  trussSize / 2.3, z:  trussSize / 2.3, col: 0xfffaed, int: 1.5 },
      // Luzes laterais de destaque
      { x: -trussSize / 2, z: 0, col: 0x38bdf8, int: 0.9 },
      { x:  trussSize / 2, z: 0, col: 0xf43f5e, int: 0.9 }
    ];

    spotPositions.forEach(sp => {
      const fix = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 12), spotFixtureMat);
      fix.position.set(sp.x, trussHeight - 0.15, sp.z);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12), spotLensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(sp.x, trussHeight - 0.31, sp.z);
      trussGroup.add(fix, lens);

      const spot = new THREE.SpotLight(sp.col, sp.int, 15, Math.PI / 4.2, 0.45, 1);
      spot.position.set(sp.x, trussHeight, sp.z);
      spot.target = ringTarget;
      scene.add(spot);
    });

    trussGroup.position.z = -0.9;
    scene.add(trussGroup);

    // Posiciona o ringue no centro do combate
    ringGroup.position.z = -0.9;
    scene.add(ringGroup);

    let tanHalfFovY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let tanHalfFovX = tanHalfFovY * camera.aspect;

    function updateFovDerived() {
      tanHalfFovY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      tanHalfFovX = tanHalfFovY * camera.aspect;
    }

    // Decoração neutra (alvos visuais distantes) foi removida

    // --- BRAÇOS 3D (PRIMEIRA PESSOA, ancorados na câmera) ---
    const ANCHOR_L = new THREE.Vector3(-0.5, -0.7, -0.7);
    const ANCHOR_R = new THREE.Vector3(0.5, -0.7, -0.7);
    const ARM_THICK = 0.13;
    const FINGER_THICK = 0.045;
    const MAX_ELBOW_REACH = 0.9;
    const MAX_WRIST_REACH = 1.6;
    const MAX_FOREARM_LEN = 0.85;
    // Posição de relaxamento: braços caídos, FORA do campo de visão (abaixo da tela)
    const REST_ELBOW_L = new THREE.Vector3(-0.75, -1.15, -0.55);
    const REST_ELBOW_R = new THREE.Vector3(0.75, -1.15, -0.55);
    const REST_WRIST_L = new THREE.Vector3(-0.6, -1.6, -0.5);
    const REST_WRIST_R = new THREE.Vector3(0.6, -1.6, -0.5);

    function createArmGroup(color, anchor) {
      const mat = new THREE.MeshLambertMaterial({ color: color, emissive: color, emissiveIntensity: 0.25 });
      const gloveMat = new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x000000 });
      const group = new THREE.Group();
      group.position.set(0, 0, 0);

      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 16), mat);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 16), mat);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(ARM_THICK / 2, 16, 16), mat);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(ARM_THICK / 2, 16, 16), mat);
      const fist = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), gloveMat);

      shoulder.position.copy(anchor);
      group.add(upper, fore, shoulder, elbow, fist);
      camera.add(group);

      return { 
        group, upper, fore, elbow, fist, shoulderPos: anchor.clone(),
        ikWrist: anchor.clone(), ikElbow: anchor.clone(),
        animState: 0,
        animTimer: 0,
        hasHit: false,
        punchTargetWrist: new THREE.Vector3(),
        punchTargetElbow: new THREE.Vector3(),
        lastZd: 0
      };
    }

    const leftArm = createArmGroup(0xffcba4, ANCHOR_L);
    const rightArm = createArmGroup(0xffcba4, ANCHOR_R);

    // Dedos das mãos (não necessários com luvas, mas mantidos invisíveis por compatibilidade)
    function attachFingers(arm) {
      const fingers = [];
      for (let i = 0; i < 5; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), arm.upper.material.clone());
        f.visible = false;
        arm.group.add(f);
        fingers.push(f);
      }
      arm.fingers = fingers;
    }
    attachFingers(leftArm);
    attachFingers(rightArm);

    const up = new THREE.Vector3(0, 1, 0);

    // --- ADVERSÁRIO: em pé na frente do jogador, mesma altura (~1.7) e mesmas características ---
    function buildOpponent() {
      const opp = new THREE.Group();
      opp.parts = [];
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcba4 });
      const shortsMat = new THREE.MeshLambertMaterial({ color: 0xd92727 });
      const hairMat = new THREE.MeshLambertMaterial({ color: 0x3b2f2f });
      const gloveMat = new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x000000 });

      const box = (mat, w, h, d, x, y, z, pType = '') => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
        m.position.set(x, y, z);
        m.userData.partType = pType;
        opp.add(m);
        opp.parts.push(m);
        return m;
      };
      
      const sphere = (mat, r, x, y, z, pType = '') => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), mat.clone());
        m.position.set(x, y, z);
        m.userData.partType = pType;
        opp.add(m);
        opp.parts.push(m);
        return m;
      };

      const seg = (mat, a, b, pType = '') => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 16), mat.clone());
        setSegment(m, a, b);
        m.userData.partType = pType;
        opp.add(m);
        opp.parts.push(m);
        return m;
      };

      // Pernas + torso + cabeça (proporção do jogador)
      // Canelas e panturrilhas (pele)
      box(skinMat, 0.17, 0.5, 0.2, -0.18, 0.25, 0, 'perna');
      box(skinMat, 0.17, 0.5, 0.2, 0.18, 0.25, 0, 'perna');
      // Pernas do short vermelho
      box(shortsMat, 0.19, 0.4, 0.22, -0.18, 0.7, 0, 'perna');
      box(shortsMat, 0.19, 0.4, 0.22, 0.18, 0.7, 0, 'perna');
      // Cintura do short vermelho
      box(shortsMat, 0.52, 0.15, 0.32, 0, 0.975, 0, 'tronco');
      // Peitoral/Tronco (pele)
      box(skinMat, 0.5, 0.4, 0.3, 0, 1.25, 0, 'tronco');
      
      // Cabeça e cabelo
      sphere(skinMat, 0.15, 0, 1.62, 0, 'cabeca');
      box(hairMat, 0.28, 0.08, 0.28, 0, 1.74, 0, 'cabeca'); // Cabelo no topo

      // Braços: cor de pele; guarda a rig completa para animar ataques variados
      const arm = (mat, jx) => {
        const sh = new THREE.Vector3(jx, 1.45, 0);
        const el = new THREE.Vector3(jx, 1.1, 0);
        const wr = new THREE.Vector3(jx, 0.8, 0);
        const shoulder = sphere(mat, ARM_THICK / 2, jx, 1.45, 0, 'braco'); // ombro
        const upper = seg(mat, sh, el, 'braco'); // braço
        const elbow = sphere(mat, ARM_THICK / 2, el.x, el.y, el.z, 'braco'); // cotovelo
        const fore = seg(mat, el, wr, 'braco'); // antebraço
        const glove = sphere(gloveMat, 0.15, jx, 0.77, 0, 'braco'); // luva preta
        return {
          side: jx < 0 ? 'L' : 'R',
          shoulderPos: sh.clone(),
          shoulder, upper, elbow, fore, glove,
          guardElbow: new THREE.Vector3(jx * 1.15, 1.32, -0.06),
          guardWrist: new THREE.Vector3(jx * 0.55, 1.36, 0.28)
        };
      };
      opp.armL = arm(skinMat, -0.36);
      opp.armR = arm(skinMat, 0.36);

      return opp;
    }

    const opponent = buildOpponent();
    opponent.position.set(0, 0, -1.55);
    scene.add(opponent);

    function setSegment(mesh, a, b, thickness = ARM_THICK) {
      const dir = b.clone().sub(a);
      const len = dir.length();
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      if (len > 0.0005) {
        mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
        mesh.scale.set(thickness, len, thickness);
      } else {
        mesh.scale.set(thickness, 0.001, thickness);
      }
    }

    function clampReach(anchor, target, max) {
      const d = target.clone().sub(anchor);
      const len = d.length();
      if (len > max) return anchor.clone().add(d.multiplyScalar(max / len));
      return target;
    }

    function applyArm(arm, anchor, elbowTarget, wristTarget) {
      const elbowClamped = clampReach(anchor, elbowTarget, MAX_ELBOW_REACH);
      const wristClamped = clampReach(anchor, wristTarget, MAX_WRIST_REACH);
      const wristFinal = clampReach(elbowClamped, wristClamped, MAX_FOREARM_LEN);
      setSegment(arm.upper, anchor, elbowClamped);
      setSegment(arm.fore, elbowClamped, wristFinal);
      arm.elbow.position.copy(elbowClamped);
      arm.fist.position.copy(wristFinal);
    }

    // --- ESQUELETO (MEDIAPIPE) ---
    const BODY_CONNECTIONS = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [24, 26], [25, 27], [26, 28]
    ];

    const camCanvas = document.getElementById('cam-canvas');
    const camCtx = camCanvas.getContext('2d');

    class OneEuroFilter {
      constructor(freq, mincutoff = 1.0, beta = 0.0, dcutoff = 1.0) {
        this.freq = freq;
        this.mincutoff = mincutoff;
        this.beta = beta;
        this.dcutoff = dcutoff;
        this.x_prev = null;
        this.dx_prev = 0;
        this.t_prev = null;
      }
      alpha(cutoff, dt) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / dt);
      }
      filter(x, t = performance.now()) {
        if (this.x_prev === null) {
          this.x_prev = x;
          this.t_prev = t;
          return x;
        }
        const dt = (t - this.t_prev) / 1000.0 || (1.0 / this.freq);
        const dx = (x - this.x_prev) / dt;
        const edx = this.dx_prev + this.alpha(this.dcutoff, dt) * (dx - this.dx_prev);
        const cutoff = this.mincutoff + this.beta * Math.abs(edx);
        const filtered_x = this.x_prev + this.alpha(cutoff, dt) * (x - this.x_prev);
        this.x_prev = filtered_x;
        this.dx_prev = edx;
        this.t_prev = t;
        return filtered_x;
      }
    }

    function createSmoothDict() {
      return {
        wu: new OneEuroFilter(30, 0.35, 0.008),
        wv: new OneEuroFilter(30, 0.35, 0.008),
        eu: new OneEuroFilter(30, 0.35, 0.008),
        ev: new OneEuroFilter(30, 0.35, 0.008),
        zd: new OneEuroFilter(30, 0.8, 0.04)
      };
    }

    let lastLandmarks = null;
    const handBySide = { L: null, R: null };
    const smooth = {
      L: createSmoothDict(),
      R: createSmoothDict()
    };
    const headSm = { ox: new OneEuroFilter(30, 0.12, 0.003), oy: new OneEuroFilter(30, 0.12, 0.003), roll: new OneEuroFilter(30, 0.4, 0.008) };
    const bodySm = { ox: new OneEuroFilter(30, 0.12, 0.003), ow: new OneEuroFilter(30, 0.12, 0.003) };
    const rollSamples = [];
    const eyeMidSamples = [];
    const eyeMidYSamples = [];
    const bodyXSamples = [];
    const bodyWSamples = [];
    let rollBase = null;
    let eyeCxBase = null;
    let eyeCyBase = null;
    let bodyXBase = null;
    let bodyWBase = null;
    const HEAD_CALIB_FRAMES = 90;
    const BODY_CALIB_FRAMES = 90;
    // Auto-referência: quando o jogador fica parado por alguns frames,
    // a posição atual vira a nova "base" — o centro é o MONITOR (olhar reto
    // para a tela), não o centro da imagem da câmera.
    const REST_WINDOW = 30;
    const REST_FRAMES = 30;
    const REST_COOLDOWN = 45;
    const REST_VAR_X = 2e-4;
    const REST_VAR_Y = 3e-4;
    const REST_VAR_W = 5e-4;
    const bodyWinX = [];
    const bodyWinW = [];
    const eyeWinX = [];
    const eyeWinY = [];
    let restFrames = 0;
    let restCooldown = 0;


    function clampVal(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

    // --- FÍSICA DE IMPACTO ---
    const hitParticles = [];
    const HIT_TOL = 0.38; // tolerância de impacto (socos conectam com folga)
    const PUNCH_SPEED = 0.8; // Reduzido para ficar mais sensível
    const FLASH_TIME = 550;
    const _invHitM = new THREE.Matrix4();
    const _hitP = new THREE.Vector3();
    const fistPrev = { L: null, R: null };

    function hitBox(mesh, pointWorld, tol) {
      _invHitM.copy(mesh.matrixWorld).invert();
      _hitP.copy(pointWorld).applyMatrix4(_invHitM);
      const hp = mesh.geometry.parameters;
      let dist = Infinity;

      if (mesh.geometry.type === 'SphereGeometry' || mesh.geometry.type === 'SphereBufferGeometry') {
        const r = (hp.radius || 0.5) * Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z);
        const centerDist = Math.hypot(_hitP.x, _hitP.y, _hitP.z);
        dist = Math.max(0, centerDist - r);
      } else if (mesh.geometry.type === 'CylinderGeometry' || mesh.geometry.type === 'CylinderBufferGeometry') {
        const h = (hp.height / 2 || 0.5) * mesh.scale.y;
        const r = (hp.radiusTop || 0.5) * Math.max(mesh.scale.x, mesh.scale.z);
        const cy = Math.max(-h, Math.min(h, _hitP.y));
        const distXZ = Math.hypot(_hitP.x, _hitP.z);
        if (distXZ <= r) {
          dist = Math.abs(_hitP.y - cy);
        } else {
          dist = Math.hypot(distXZ - r, _hitP.y - cy);
        }
      } else {
        // Fallback for BoxGeometry
        const hx = (hp.width / 2 || 0.5) * mesh.scale.x;
        const hy = (hp.height / 2 || 0.5) * mesh.scale.y;
        const hz = (hp.depth / 2 || 0.5) * mesh.scale.z;
        const cx = Math.max(-hx, Math.min(hx, _hitP.x));
        const cy = Math.max(-hy, Math.min(hy, _hitP.y));
        const cz = Math.max(-hz, Math.min(hz, _hitP.z));
        dist = Math.hypot(_hitP.x - cx, _hitP.y - cy, _hitP.z - cz);
      }
      return dist <= tol ? dist : Infinity;
    }

    function flashPart(mesh) {
      const ud = mesh.userData;
      if (ud.origColor === undefined) {
        ud.origColor = mesh.material.color.getHex();
        ud.origEmissive = mesh.material.emissive.getHex();
      }
      mesh.material.color.set(0xff3b3b);
      mesh.material.emissive.set(0xff1a1a);
      ud.finishAt = performance.now() + FLASH_TIME;
    }

    function medianOf(values) {
      const sorted = values.filter(v => Number.isFinite(v)).sort((a, b) => a - b);
      if (sorted.length === 0) return null;
      return sorted[Math.floor(sorted.length / 2)];
    }

    function pushWindow(arr, val) {
      arr.push(val);
      if (arr.length > REST_WINDOW) arr.shift();
    }

    function meanVar(values) {
      const n = values.length;
      if (n < 2) return { mean: null, var: Infinity };
      let m = 0;
      for (let i = 0; i < n; i++) m += values[i];
      m /= n;
      let s = 0;
      for (let i = 0; i < n; i++) s += (values[i] - m) * (values[i] - m);
      return { mean: m, var: s / (n - 1) };
    }

    function normDist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function zDistFromRatio(ratio) {
      return 1.75 - Math.min(1, Math.max(0, ratio)) * 1.15;
    }

    function projectXY(u, v, zDist) {
      return new THREE.Vector3(
        (u - 0.5) * zDist * 2 * tanHalfFovX,
        (0.5 - v) * zDist * 2 * tanHalfFovY,
        -zDist
      );
    }

    // Converte entre o espaço local do grupo do braço (que contrarrota o roll) e o espaço da câmera
    function cameraToGroup(p) {
      return p.clone().applyEuler(new THREE.Euler(0, 0, camera.rotation.z));
    }
    function armToCamera(p) {
      return p.clone().applyEuler(new THREE.Euler(0, 0, -camera.rotation.z));
    }

    // Pontas dos dedos mediapipe: polegar, indicador, médio, anelar, mindinho
    const HAND_TIPS = [4, 8, 12, 16, 20];

    function updateFingers(arm, hand) {
      for (let i = 0; i < 5; i++) arm.fingers[i].visible = false;
      if (!hand) return;
      const fistCam = armToCamera(arm.fist.position);
      const depth = -fistCam.z;
      if (depth <= 0.1) return;
      for (let i = 0; i < 5; i++) {
        const p = hand[HAND_TIPS[i]];
        if (!p) continue;
        const tipCam = projectXY(1 - p.x, p.y, depth);
        const tipGroup = cameraToGroup(tipCam);
        setSegment(arm.fingers[i], arm.fist.position, tipGroup, FINGER_THICK);
        arm.fingers[i].visible = true;
      }
    }


    class PunchDetector {
      constructor() {
        this.historyL = [];
        this.historyR = [];
        this.windowSize = 8;
      }

      update(sideKey, wrist, shoulder, dtSec) {
        const history = sideKey === 'L' ? this.historyL : this.historyR;
        
        const shoulderWidth = 0.3; // Approx normalizer baseline if we don't have both shoulders easily here
        // Actually, let's just use raw MediaPipe coords which are normalized to [0,1] screen size.
        // We will store relative to shoulder to isolate from body movement.
        const relX = wrist.x - shoulder.x;
        const relY = wrist.y - shoulder.y;
        const relZ = wrist.z - shoulder.z;
        
        history.push({ x: relX, y: relY, z: relZ, time: performance.now() });
        if (history.length > this.windowSize) history.shift();
        
        if (history.length < this.windowSize) return 0;
        
        const old = history[0];
        const dt = (performance.now() - old.time) / 1000;
        if (dt <= 0) return 0;
        
        const vx = (relX - old.x) / dt;
        const vy = (relY - old.y) / dt;
        const vz = (relZ - old.z) / dt; // Negative is towards camera!
        
        // 1. UPPERCUT
        // Fast upward movement (vy < -1.5), fist started low (old.y > 0.1), and not predominantly forward.
        if (vy < -2.5 && old.y > 0.15 && Math.abs(vy) > Math.abs(vx) * 1.5) {
          return 3;
        }

        // 2. CRUZADO (HOOK)
        // Fast lateral movement across the body (vx > 2.0 or vx < -2.0)
        // A right hand hook (R) moves towards the left (negative x in screen coords).
        // Since we invert canvas scale(-1, 1), let's just look at absolute lateral speed.
        if (Math.abs(vx) > 3.0 && vz < 0) {
          return 2;
        }

        // 3. JAB / DIRETO
        // Fast forward movement (vz < -1.5)
        if (vz < -2.0 && Math.abs(vy) < 2.0) {
          return 1;
        }
        
        return 0;
      }
    }
    const punchDetector = new PunchDetector();

    function updateArmFromPose
(arm, anchor, wristIdx, elbowIdx, shoulderIdx, sideKey) {
      if (!lastLandmarks) return;
      const w = lastLandmarks[wristIdx];
      const e = lastLandmarks[elbowIdx];
      const s = lastLandmarks[shoulderIdx];
      if (!w || !e || !s) return;
      if ((w.visibility || 1) < 0.3 || (e.visibility || 1) < 0.3) return;

      const sm = smooth[sideKey];
      const now = performance.now();
      const wu = sm.wu.filter(1 - w.x, now);
      const wv = sm.wv.filter(w.y, now);
      const eu = sm.eu.filter(1 - e.x, now);
      const ev = sm.ev.filter(e.y, now);
      // Usa a diferença de profundidade (z) do Mediapipe. 
      // Valores mais negativos = mais perto da câmera.
      // Quando w.z < s.z, o pulso está à frente do ombro.
      const zDiff = w.z - s.z;
      // Mapeia zDiff: se próximo de 0 (guarda/descanso) zd ~ 0.7. Se esticado (soco, -0.4) zd ~ 1.7
      let targetZd = 0.7 - (zDiff * 2.5);
      targetZd = clampVal(targetZd, 0.5, 1.8);
      
      const zd = sm.zd.filter(targetZd, now);

      const wristTarget = projectXY(wu, wv, zd);
      const elbowTarget = projectXY(eu, ev, zd);

      // Relaxamento: quanto mais baixo o punho, mais o braço cai para fora da tela
      const restBlend = clampVal((wv - 0.58) / 0.27, 0, 1);
      const restE = sideKey === 'L' ? REST_ELBOW_L : REST_ELBOW_R;
      const restWr = sideKey === 'L' ? REST_WRIST_L : REST_WRIST_R;
      elbowTarget.lerp(restE, restBlend);
      wristTarget.lerp(restWr, restBlend);

      arm.ikWrist.copy(wristTarget);
      arm.ikElbow.copy(elbowTarget);

      // GESTURE TRIGGER: Detecta aceleração e classifica o soco
      if (arm.animState === 0) {
        const dtSec = 1/30; // fallback proxy for window dt
        const punchType = punchDetector.update(sideKey, w, s, dtSec);
        
        if (punchType > 0) {
          arm.animState = punchType; // 1: straight, 2: hook, 3: uppercut
          arm.animTimer = 0;
          arm.hasHit = false;
          if (typeof isGameStarted !== 'undefined' && isGameStarted && typeof isFightActive !== 'undefined' && isFightActive && !isMatchOver) {
            matchStats.punchesThrown++;
            if (window.matchRoom) {
              window.matchRoom.send('punch', { side: sideKey === 'L' ? 1 : 2 });
            }
          }
          
          if (punchType === 1) { // JAB / DIRETO
            const punchX = sideKey === 'L' ? -0.15 : 0.15;
            arm.punchTargetWrist.set(punchX, 0, -1.8);
            arm.punchTargetElbow.set(punchX * 1.5, -0.2, -1.0);
          } else if (punchType === 2) { // CRUZADO
            // Hook crusaz the center. A left hook goes from left to right (positive X).
            const punchX = sideKey === 'L' ? 0.3 : -0.3;
            arm.punchTargetWrist.set(punchX, 0.1, -1.5);
            // Elbow stays high and outside
            arm.punchTargetElbow.set(sideKey === 'L' ? -0.5 : 0.5, 0.1, -0.8);
          } else if (punchType === 3) { // UPPERCUT
            // Uppercut goes straight up into the center
            arm.punchTargetWrist.set(0, 0.5, -1.4);
            arm.punchTargetElbow.set(sideKey === 'L' ? -0.2 : 0.2, -0.5, -1.0);
          }
          
          // Reset history so it doesn't multi-trigger
          if (sideKey === 'L') punchDetector.historyL = [];
          if (sideKey === 'R') punchDetector.historyR = [];
        }
      }
      arm.lastZd = zd;
      arm.lastWv = wv;
    }

    let wasBlocking = false;
    const guardIndicator = document.createElement('div');
    guardIndicator.id = 'guard-indicator';
    guardIndicator.textContent = 'GUARDA ATIVA';
    guardIndicator.style.cssText = 'position:absolute;top:12%;left:50%;transform:translate(-50%,-50%);color:#4ade80;font-weight:900;font-size:20px;letter-spacing:4px;z-index:500;pointer-events:none;text-shadow:0 2px 12px rgba(0,0,0,0.85);display:none;';
    document.body.appendChild(guardIndicator);

    function updateBlockingState() {
      let blocking = false;
      if (lastLandmarks && typeof isGameStarted !== 'undefined' && isGameStarted && !isMatchOver) {
        const lm = lastLandmarks;
        const wl = lm[15], wr = lm[16], sl = lm[11], sr = lm[12];
        if (wl && wr && sl && sr &&
            (wl.visibility || 1) > 0.5 && (wr.visibility || 1) > 0.5 &&
            (sl.visibility || 1) > 0.5 && (sr.visibility || 1) > 0.5) {
          const upL = wl.y < sl.y;
          const upR = wr.y < sr.y;
          const fwdL = (wl.z - sl.z) < 0.1;
          const fwdR = (wr.z - sr.z) < 0.1;
          const together = Math.abs(wl.x - wr.x) < 0.4;
          const notPunching = leftArm.animState === 0 && rightArm.animState === 0;
          blocking = upL && upR && fwdL && fwdR && together && notPunching;
        }
      }
      window.isPlayerBlocking = blocking;
      if (blocking !== wasBlocking) {
        wasBlocking = blocking;
        if (guardIndicator) guardIndicator.style.display = blocking ? 'block' : 'none';
      }
    }

    function onPoseResults(results) {
      const w = camCanvas.width;
      const h = camCanvas.height;

      camCtx.save();
      camCtx.clearRect(0, 0, w, h);
      camCtx.translate(w, 0);
      camCtx.scale(-1, 1);
      camCtx.drawImage(results.image, 0, 0, w, h);
      camCtx.restore();

      if (!results.poseLandmarks) return;
      const lm = results.poseLandmarks;
      lastLandmarks = lm;

      if (typeof isCalibrating !== 'undefined' && isCalibrating && !isGameStarted && modal && !modal.classList.contains('hidden')) {
        const nose = lm[0];
        const hipL = lm[23];
        const hipR = lm[24];
        if (instructionsEl) {
          let isValid = false;
          if (nose && hipL && hipR && (nose.visibility || 1) > 0.5 && (hipL.visibility || 1) > 0.5 && (hipR.visibility || 1) > 0.5) {
            if (hipL.y > 0.5 && hipR.y > 0.5 && nose.y < 0.4) {
               isValid = true;
               instructionsEl.style.color = "#4ade80";
            } else {
               instructionsEl.textContent = "Ajuste-se até aparecer da cintura para cima e sua cabeça no topo.";
               instructionsEl.style.color = "#fbbf24";
            }
          } else {
            instructionsEl.textContent = "Não consigo ver seu corpo inteiro. Afaste-se mais da câmera.";
            instructionsEl.style.color = "#fbbf24";
          }
          
          if (typeof setCalibrationValid === 'function') {
            setCalibrationValid(isValid);
          }
        }
      }

      const sColorMap = {
        'blue': { hex: '#1d4ed8', rgba: 'rgba(29, 78, 216, 0.7)' },
        'gold': { hex: '#f59e0b', rgba: 'rgba(245, 158, 11, 0.7)' },
        'dark': { hex: '#777777', rgba: 'rgba(119, 119, 119, 0.7)' },
        'red':  { hex: '#ef4444', rgba: 'rgba(239, 68, 68, 0.7)' }
      };
      const gColorMap = {
        'blue': '#1d4ed8', 'gold': '#f59e0b', 'red': '#ef4444', 'dark': '#222222', 'cyan': '#06b6d4'
      };
      const curShorts = sColorMap[savedAppears.shorts] || sColorMap['red'];
      const curGlove = gColorMap[savedAppears.glove] || gColorMap['cyan'];

      // Esqueleto
      camCtx.lineWidth = 1.5;
      camCtx.strokeStyle = curShorts.rgba;
      BODY_CONNECTIONS.forEach(([a, b]) => {
        const p1 = lm[a];
        const p2 = lm[b];
        if (p1 && p2 && (p1.visibility || 1) > 0.4 && (p2.visibility || 1) > 0.4) {
          camCtx.beginPath();
          camCtx.moveTo((1 - p1.x) * w, p1.y * h);
          camCtx.lineTo((1 - p2.x) * w, p2.y * h);
          camCtx.stroke();
        }
      });

      // Pontos de movimento: ombros (11/12), cotovelos (13/14) e punhos (15/16)
      const ARM_JOINTS = [
        { indices: [11, 13, 15], shoulderIdx: 11, label: ['O', 'C', 'P'] },
        { indices: [12, 14, 16], shoulderIdx: 12, label: ['O', 'C', 'P'] }
      ];
      ARM_JOINTS.forEach(side => {
        const shoulderZ = lm[side.shoulderIdx] ? lm[side.shoulderIdx].z : 0;
        side.indices.forEach((idx, j) => {
          const p = lm[idx];
          if (!p || (p.visibility || 1) < 0.3) return;
          
          if (j === 2) {
            // Renderiza a Luva
            camCtx.beginPath();
            camCtx.arc((1 - p.x) * w, p.y * h, 14, 0, 2 * Math.PI);
            camCtx.fillStyle = curGlove;
            camCtx.fill();
            camCtx.lineWidth = 2;
            camCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            camCtx.stroke();
          }

          let color = curShorts.hex; // Cor do uniforme
          const r = j === 2 ? 6 : j === 1 ? 5 : 4;
          camCtx.beginPath();
          camCtx.arc((1 - p.x) * w, p.y * h, r, 0, 2 * Math.PI);
          camCtx.fillStyle = color;
          camCtx.fill();
          camCtx.font = '9px system-ui';
          camCtx.fillStyle = '#ffffff';
          camCtx.fillText(side.label[j], (1 - p.x) * w + r + 3, p.y * h + 3);
        });
      });

      updateArmFromPose(leftArm, ANCHOR_L, 15, 13, 11, 'L');
      updateArmFromPose(rightArm, ANCHOR_R, 16, 14, 12, 'R');

      updateBlockingState();

      // --- Corpo: deslocamento lateral (tronco) e frente/trás (distância da câmera) ---
      const sL = lm[11];
      const sR = lm[12];
      if (sL && sR && (sL.visibility || 1) > 0.5 && (sR.visibility || 1) > 0.5) {
        const hipL = lm[23];
        const hipR = lm[24];
        const hasHips = hipL && hipR && (hipL.visibility || 1) > 0.4 && (hipR.visibility || 1) > 0.4;
        const sMidU = 1 - (sL.x + sR.x) / 2;
        const hMidU = hasHips ? 1 - (hipL.x + hipR.x) / 2 : sMidU;
        const torsoU = (sMidU + hMidU) / 2;
        const width = Math.hypot(sR.x - sL.x, sR.y - sL.y);

        // Calibra o "neutro" do corpo nos primeiros frames (centro e largura)
        if (bodyXSamples.length < BODY_CALIB_FRAMES) {
          bodyXSamples.push(torsoU);
          bodyWSamples.push(width);
          if (bodyXSamples.length >= BODY_CALIB_FRAMES && bodyXBase === null) {
            bodyXBase = medianOf(bodyXSamples);
            bodyWBase = medianOf(bodyWSamples);
          }
        }
        if (bodyXBase !== null) {
          const now = performance.now();
          bodySm.ox.filter(torsoU - bodyXBase, now);
          bodySm.ow.filter(width - bodyWBase, now);
        }

        // Janela rolante para detecção de repouso (auto-referência)
        pushWindow(bodyWinX, torsoU);
        pushWindow(bodyWinW, width);
      }

// --- Cabeça: giro (yaw/pitch) com base no centro dos olhos (referencial absoluto) ---
      const eyeL = lm[2];
      const eyeR = lm[5];
      const nose = lm[0];
      const useEyes = eyeL && eyeR &&
        (eyeL.visibility || 1) > 0.5 && (eyeR.visibility || 1) > 0.5;

      let faceRefX = null; // espelhado
      let faceRefY = null; // cru
      if (useEyes) {
        faceRefX = 1 - (eyeL.x + eyeR.x) / 2;
        faceRefY = (eyeL.y + eyeR.y) / 2;
      } else if (nose && (nose.visibility || 1) > 0.4) {
        faceRefX = 1 - nose.x;
        faceRefY = nose.y;
      }

      if (faceRefX !== null) {
        if (useEyes && eyeMidSamples.length < HEAD_CALIB_FRAMES) {
          eyeMidSamples.push(faceRefX);
          eyeMidYSamples.push(faceRefY);
          if (eyeMidSamples.length >= HEAD_CALIB_FRAMES && eyeCxBase === null) {
            eyeCxBase = medianOf(eyeMidSamples);
            eyeCyBase = medianOf(eyeMidYSamples);
          }
        }
        const refX = eyeCxBase !== null ? eyeCxBase : 0.5;
        const refY = eyeCyBase !== null ? eyeCyBase : 0.5;
        const now = performance.now();
        headSm.ox.filter(faceRefX - refX, now);
        headSm.oy.filter(faceRefY - refY, now);

        if (useEyes) {
          pushWindow(eyeWinX, faceRefX);
          pushWindow(eyeWinY, faceRefY);
        }
      }

      if (!useEyes) return;

      // Roll: inclinação lateral da linha dos olhos
      const eDx = eyeR.x - eyeL.x;
      const eDy = eyeR.y - eyeL.y;
      const sep = Math.hypot(eDx, eDy);
      if (sep > 0.02 && sL && sR) {
        const lineAngle = Math.atan2(eDy, ((1 - eyeR.x) - (1 - eyeL.x)));
        if (rollSamples.length < HEAD_CALIB_FRAMES) rollSamples.push(lineAngle);
        else if (rollBase === null) rollBase = medianOf(rollSamples);
        headSm.roll.filter(lineAngle, performance.now());
      }

      // --- AUTO-REFERÊNCIA: joga parado na posição base = nova base ---
      restCooldown = Math.max(0, restCooldown - 1);
      if (bodyWinX.length >= REST_WINDOW && bodyWinW.length >= REST_WINDOW) {
        const bx = meanVar(bodyWinX);
        const bw = meanVar(bodyWinW);
        const haveEyeWin = eyeWinX.length >= REST_WINDOW;
        const ex = haveEyeWin ? meanVar(eyeWinX) : { mean: null, var: Infinity };
        const ey = haveEyeWin ? meanVar(eyeWinY) : { mean: null, var: Infinity };
        const still = bx.var <= REST_VAR_X && bw.var <= REST_VAR_W &&
          ex.var <= REST_VAR_X && ey.var <= REST_VAR_Y;

        restFrames = still ? restFrames + 1 : 0;

        if (restFrames >= REST_FRAMES && restCooldown === 0) {
          bodyXBase = bx.mean;
          bodyWBase = bw.mean;
          bodySm.ox.x_prev = 0;
          bodySm.ow.x_prev = 0;
          if (haveEyeWin) {
            eyeCxBase = ex.mean;
            eyeCyBase = ey.mean;
            headSm.ox.x_prev = 0;
            headSm.oy.x_prev = 0;
            if (headSm.roll.x_prev !== null) rollBase = headSm.roll.x_prev;
          if (!isGameStarted) {
            bodyXBase = bx.mean;
            bodyWBase = bw.mean;
            bodySm.ox.x_prev = 0;
            bodySm.ow.x_prev = 0;
            if (haveEyeWin) {
              eyeCxBase = ex.mean;
              eyeCyBase = ey.mean;
              headSm.ox.x_prev = 0;
              headSm.oy.x_prev = 0;
              if (headSm.roll.x_prev !== null) rollBase = headSm.roll.x_prev;
            }
            restFrames = 0;
            restCooldown = REST_COOLDOWN;
          } else {
            restFrames = 0;
          }
          restFrames = 0;
          restCooldown = REST_COOLDOWN;
        }
      } else {
        restFrames = 0;
      }

      // Linha dos olhos no preview
      camCtx.setLineDash([4, 4]);
      camCtx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
      camCtx.lineWidth = 2;
      camCtx.beginPath();
      camCtx.moveTo((1 - eyeL.x) * w, eyeL.y * h);
      camCtx.lineTo((1 - eyeR.x) * w, eyeR.y * h);
      camCtx.stroke();
      camCtx.setLineDash([]);
      camCtx.fillStyle = '#a855f7';
      [eyeL, eyeR].forEach(p => {
        camCtx.beginPath();
        camCtx.arc((1 - p.x) * w, p.y * h, 4, 0, 2 * Math.PI);
        camCtx.fill();
      });
    }

    } // fim de onPoseResults — todo o setup (UI, câmera, botões) roda no escopo top-level

    // --- MÃOS (MediaPipe Hands): dedos seguem as pontas dos dedos reais ---
    function assignHand(handLm) {
      const hWristU = 1 - handLm[0].x;
      if (lastLandmarks) {
        const lW = lastLandmarks[15];
        const rW = lastLandmarks[16];
        if (lW && rW && lW.x !== undefined) {
          const dL = Math.abs((1 - lW.x) - hWristU);
          const dR = Math.abs((1 - rW.x) - hWristU);
          return dL <= dR ? 'L' : 'R';
        }
      }
      return hWristU <= 0.5 ? 'L' : 'R';
    }

    function onHandsResults(results) {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        handBySide.L = null;
        handBySide.R = null;
        return;
      }
      results.multiHandLandmarks.forEach(hand => {
        handBySide.L = null;
        handBySide.R = null;
        handBySide[assignHand(hand)] = hand;
      });
    }

    // --- GAME LOOP ---
    const YAW_SENS = 6.5;
    const PITCH_SENS = 3.0;
    const ROLL_SENS = 2.2;
    const TRANS_SENS = 3.0;
    const DEPTH_SENS = 1.9;
    // --- INICIALIZAÇÃO DO POSE E MODAL ---
    let isGameStarted = false;
    let isFightActive = false;
    let isCalibrating = false;
    let matchCountdownTimer = null;
    let calibrationTimer = null;
    let calibrationCount = 5;
    const lastArmHitTime = { L: 0, R: 0 };
    const modal = document.getElementById('calibration-modal');
    const calibPreviewContainer = document.getElementById('calibration-preview-container');
    const camPreviewEl = document.querySelector('.cam-preview');
    const instructionsEl = document.getElementById('calibration-instructions');
    const countdownEl = document.getElementById('calibration-countdown');
    
    if (calibPreviewContainer && camPreviewEl) {
      calibPreviewContainer.appendChild(camPreviewEl);
    }
    
    const startScreen = document.getElementById('start-screen');
    const btnStartTraining = document.getElementById('btn-start-training');
    const btnRanked = document.getElementById('btn-ranked');
    const btn1v1 = document.getElementById('btn-1v1');
    const pvpModal = document.getElementById('pvp-modal');
    const postMatchModal = document.getElementById('post-match-modal');

    // --- ESTADO DO JOGADOR, RANKING E RECOMPENSAS ---
    // Limpeza de chaves de storage legadas para não poluir novos jogadores com dados de sessões antigas
    try {
      localStorage.removeItem('vbox_player_career');
    } catch (e) {}

    let playerCareer = {
      rankPosition: '-',
      trophies: 0,
      coins: 0,
      level: 1,
      totalFights: 0,
      wins: 0,
      losses: 0,
      kos: 0
    };

    window.playerCareer = playerCareer;

    function resetPlayerCareer() {
      playerCareer.rankPosition = '-';
      playerCareer.trophies = 0;
      playerCareer.coins = 0;
      playerCareer.level = 1;
      playerCareer.totalFights = 0;
      playerCareer.wins = 0;
      playerCareer.losses = 0;
      playerCareer.kos = 0;
      try {
        localStorage.removeItem('vbox_player_career');
      } catch (e) {}
      updateLobbyCareerStats();
    }
    window.resetPlayerCareer = resetPlayerCareer;

    // Sincronização oficial vinda dos dados salvos no Firestore (auth.js)
    window.syncPlayerCareerFromProfile = function(profile) {
      if (!profile) return;
      playerCareer.coins = typeof profile.coins === 'number' ? profile.coins : 0;
      playerCareer.wins = typeof profile.wins === 'number' ? profile.wins : 0;
      playerCareer.losses = typeof profile.losses === 'number' ? profile.losses : 0;
      playerCareer.kos = typeof profile.kos === 'number' ? profile.kos : 0;
      playerCareer.totalFights = typeof profile.totalFights === 'number' 
        ? profile.totalFights 
        : ((playerCareer.wins || 0) + (playerCareer.losses || 0));
      playerCareer.trophies = typeof profile.trophies === 'number' ? profile.trophies : 0;
      playerCareer.level = typeof profile.level === 'number' ? profile.level : 1;

      updateLobbyCareerStats();
      if (typeof loadLeaderboardUI === 'function') {
        loadLeaderboardUI();
      }
    };

    let matchStats = {
      punchesThrown: 0,
      punchesLanded: 0,
      headshots: 0,
      damageDealt: 0,
      damageTaken: 0,
      startTime: 0,
      endTime: 0
    };

    function updateLobbyCareerStats() {
      // Atualiza Moedas no Header a partir do perfil salvo
      const coinEl = document.querySelector('.fn-coin-val');
      if (coinEl) {
        coinEl.textContent = (playerCareer.coins || 0).toLocaleString('pt-BR');
      }

      // Atualiza Nível
      const profileLvl = document.querySelector('.fn-profile-lvl');
      if (profileLvl) {
        profileLvl.textContent = `LVL ${playerCareer.level || 1}`;
      }

      const fights = typeof playerCareer.totalFights === 'number' 
        ? playerCareer.totalFights 
        : ((playerCareer.wins || 0) + (playerCareer.losses || 0));
      const wins = playerCareer.wins || 0;
      const losses = playerCareer.losses || 0;
      const rate = fights > 0 
        ? ((wins / fights) * 100).toFixed(1) 
        : '0.0';

      // Atualiza Dossiê do Lutador (Lobby Principal)
      const dossierWins = document.getElementById('dossier-wins');
      const dossierLosses = document.getElementById('dossier-losses');
      const dossierRate = document.getElementById('dossier-rate');
      if (dossierWins) dossierWins.textContent = wins;
      if (dossierLosses) dossierLosses.textContent = losses;
      if (dossierRate) dossierRate.textContent = `${rate}%`;

      // Atualiza Estatísticas da Aba Carreira (#tab-career)
      const careerFights = document.getElementById('career-fights');
      const careerWins = document.getElementById('career-wins');
      const careerLosses = document.getElementById('career-losses');
      const careerKos = document.getElementById('career-kos');
      const careerRank = document.getElementById('career-rank');
      const careerRate = document.getElementById('career-rate');

      if (careerFights) careerFights.textContent = fights;
      if (careerWins) careerWins.textContent = wins;
      if (careerLosses) careerLosses.textContent = losses;
      if (careerKos) careerKos.textContent = playerCareer.kos || 0;
      if (careerRank) careerRank.textContent = (playerCareer.rankPosition && playerCareer.rankPosition !== '-') 
        ? `#${playerCareer.rankPosition}` 
        : '#--';
      if (careerRate) careerRate.textContent = `${rate}%`;

      // Atualiza Card de Posição no Ranking (#tab-ranking)
      const myPosEl = document.getElementById('my-rank-position');
      const myRecEl = document.getElementById('my-rank-record');
      const myRateEl = document.getElementById('my-rank-rate');
      const myEloEl = document.getElementById('my-rank-elo');
      if (myPosEl) myPosEl.textContent = (playerCareer.rankPosition && playerCareer.rankPosition !== '-') 
        ? `#${playerCareer.rankPosition}` 
        : '#--';
      if (myRecEl) myRecEl.textContent = `${wins}V - ${losses}D`;
      if (myRateEl) myRateEl.textContent = `${rate}%`;
      if (myEloEl) myEloEl.textContent = `🏆 ${playerCareer.trophies || 0} TROFÉUS`;
    }

    // Inicialização da UI zerada/limpa até que os dados salvos cheguem
    updateLobbyCareerStats();

    function showPostMatchScreen(winner, reason, serverData = null) {
      isMatchOver = true;
      isGameStarted = false;
      isFightActive = false;
      isCalibrating = false;
      if (matchCountdownTimer) {
        clearTimeout(matchCountdownTimer);
        matchCountdownTimer = null;
      }
      if (calibrationTimer) {
        clearInterval(calibrationTimer);
        calibrationTimer = null;
      }
      matchStats.endTime = performance.now();

      // Esconde o HUD de combate
      const hb = document.querySelector('.health-bars');
      const mi = document.querySelector('.match-info');
      if (hb) hb.style.display = 'none';
      if (mi) mi.style.display = 'none';

      // Esconde mensagem central caso ainda visível
      const centerMsg = document.getElementById('center-message');
      if (centerMsg) centerMsg.style.display = 'none';

      // Cálculos da Luta
      const durationMs = matchStats.endTime - (matchStats.startTime || matchStats.endTime);
      const totalSec = Math.max(1, Math.round(durationMs / 1000));
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      const thrown = Math.max(matchStats.punchesThrown, matchStats.punchesLanded);
      const landed = matchStats.punchesLanded;
      const accuracy = thrown > 0 ? Math.round((landed / thrown) * 100) : 0;

      // Elementos do Modal
      const modalEl = document.getElementById('post-match-modal');
      const badgeEl = document.getElementById('post-match-badge');
      const titleEl = document.getElementById('post-match-title');
      const subEl = document.getElementById('post-match-subtitle');
      const crownEl = document.getElementById('post-match-crown');
      const winnerAvatarEl = document.getElementById('post-match-avatar');
      const winnerNameEl = document.getElementById('post-match-winner-name');
      const winnerTagEl = document.getElementById('post-match-winner-tag');
      const rankBadgeEl = document.getElementById('post-match-rank-badge');
      const rankPrevEl = document.getElementById('post-match-rank-prev');
      const rankCurrEl = document.getElementById('post-match-rank-curr');
      const eloValEl = document.getElementById('post-match-elo-val');
      const coinsValEl = document.getElementById('post-match-coins-val');
      const xpValEl = document.getElementById('post-match-xp-val');

      let modeName = 'TREINAMENTO SOLO';
      if (selectedMode === 'ranked') modeName = 'MODO RANKEADO • TEMPORADA 1';
      else if (selectedMode === 'pvp') modeName = 'MODO 1v1 • SALA PRIVADA';
      if (badgeEl) badgeEl.textContent = `FIM DE COMBATE • ${modeName}`;

      const prevRank = (playerCareer.rankPosition && playerCareer.rankPosition !== '-') ? Number(playerCareer.rankPosition) : 10;
      let newRank = prevRank;
      let coinsEarned = 10;
      let trophiesEarned = 0;
      let xpEarned = 150;
      const isCareerMatch = selectedMode === 'ranked' || selectedMode === 'pvp';

      const myDisplayName = window.playerProfile ? window.playerProfile.displayName : 'Você';
      const oppDisplayName = window.remoteOpponentName || 'Oponente';

      if (winner === 'player') {
        // Vitória do Jogador (+50 moedas conforme regra do jogo)
        coinsEarned = (serverData && serverData.coinsWin) ? serverData.coinsWin : 50;
        xpEarned = 350;

        if (isCareerMatch) {
          trophiesEarned = (serverData && serverData.trophiesWin) ? serverData.trophiesWin : 1;
          playerCareer.trophies += trophiesEarned;
          playerCareer.coins += coinsEarned;
          playerCareer.wins++;
          playerCareer.totalFights++;
          if (reason === 'KO') playerCareer.kos++;

          const rankShift = Math.min(2, Math.max(1, prevRank - 1));
          newRank = Math.max(1, prevRank - rankShift);
          playerCareer.rankPosition = newRank;
        } else {
          playerCareer.coins += coinsEarned;
        }

        if (titleEl) {
          titleEl.className = 'fn-victory-title';
          titleEl.textContent = reason === 'KO' ? 'NOCAUTE TÉCNICO!' : 'VITÓRIA MAGISTRAL!';
        }
        if (subEl) {
          subEl.textContent = reason === 'KO' 
            ? `Nocaute no Round ${currentRound} • Duração: ${timeFormatted}` 
            : `Vitória no Combate • Duração: ${timeFormatted}`;
        }
        if (crownEl) crownEl.style.display = 'block';
        if (winnerAvatarEl) winnerAvatarEl.textContent = '🥊';
        if (winnerNameEl) winnerNameEl.textContent = myDisplayName;
        if (winnerTagEl) winnerTagEl.textContent = '👑 CAMPEÃO DO COMBATE';

        if (rankBadgeEl) {
          rankBadgeEl.className = 'fn-ranking-climb-badge';
          rankBadgeEl.textContent = isCareerMatch ? `▲ +${trophiesEarned} TROFÉU${trophiesEarned !== 1 ? 'S' : ''}` : '= TREINO SEM CARTEL';
        }
        if (eloValEl) {
          eloValEl.textContent = isCareerMatch ? `+${trophiesEarned} TROFÉU${trophiesEarned !== 1 ? 'S' : ''}` : '—';
        }
        if (coinsValEl) coinsValEl.textContent = `+${coinsEarned} MOEDAS`;
        if (xpValEl) xpValEl.textContent = `+${xpEarned} XP`;

      } else if (winner === 'opponent') {
        // Derrota do Jogador (+10 moedas conforme regra do jogo)
        coinsEarned = (serverData && serverData.coinsLoss) ? serverData.coinsLoss : 10;
        xpEarned = 100;

        if (isCareerMatch) {
          newRank = prevRank + 1;
          playerCareer.rankPosition = newRank;
        }
        playerCareer.coins += coinsEarned;
        if (isCareerMatch) {
          playerCareer.losses++;
          playerCareer.totalFights++;
        }

        if (titleEl) {
          titleEl.className = 'fn-victory-title defeat';
          titleEl.textContent = reason === 'KO' ? 'VOCÊ FOI NOCAUTEADO' : 'DERROTA NO COMBATE';
        }
        if (subEl) {
          subEl.textContent = reason === 'KO' 
            ? `Queda no Round ${currentRound} • Duração: ${timeFormatted}` 
            : `Fim do Confronto • Duração: ${timeFormatted}`;
        }
        if (crownEl) crownEl.style.display = 'none';
        if (winnerAvatarEl) winnerAvatarEl.textContent = '💀';
        if (winnerNameEl) winnerNameEl.textContent = oppDisplayName;
        if (winnerTagEl) winnerTagEl.textContent = '🥊 VENCEDOR DO CONFRONTO';

        if (rankBadgeEl) {
          rankBadgeEl.className = 'fn-ranking-climb-badge fall';
          rankBadgeEl.textContent = isCareerMatch ? '▼ SEM TROFÉU' : '= TREINO SEM CARTEL';
        }
        if (eloValEl) {
          eloValEl.textContent = isCareerMatch ? '0 TROFÉUS' : '—';
        }
        if (coinsValEl) coinsValEl.textContent = `+${coinsEarned} MOEDAS`;
        if (xpValEl) xpValEl.textContent = `+${xpEarned} XP`;

      } else {
        // Empate Técnico
        coinsEarned = 25;
        xpEarned = 200;
        playerCareer.coins += coinsEarned;
        if (isCareerMatch) playerCareer.totalFights++;

        if (titleEl) {
          titleEl.className = 'fn-victory-title draw';
          titleEl.textContent = 'EMPATE TÉCNICO!';
        }
        if (subEl) {
          subEl.textContent = `Fim dos Rounds • Duração: ${timeFormatted}`;
        }
        if (crownEl) crownEl.style.display = 'none';
        if (winnerAvatarEl) winnerAvatarEl.textContent = '🤝';
        if (winnerNameEl) winnerNameEl.textContent = 'Empate';
        if (winnerTagEl) winnerTagEl.textContent = 'COMBATE EQUILIBRADO';

        if (rankBadgeEl) {
          rankBadgeEl.className = 'fn-ranking-climb-badge';
          rankBadgeEl.textContent = isCareerMatch ? '= POSIÇÃO MANTIDA' : '= TREINO SEM CARTEL';
        }
        if (eloValEl) {
          eloValEl.textContent = isCareerMatch ? '0 TROFÉUS' : '—';
        }
        if (coinsValEl) coinsValEl.textContent = `+${coinsEarned} MOEDAS`;
        if (xpValEl) xpValEl.textContent = `+${xpEarned} XP`;
      }

      if (rankPrevEl) rankPrevEl.textContent = (isCareerMatch && playerCareer.rankPosition && playerCareer.rankPosition !== '-') ? `#${playerCareer.rankPosition}` : (isCareerMatch ? '#--' : '—');
      if (rankCurrEl) rankCurrEl.textContent = isCareerMatch ? `#${newRank}` : '—';

      // Estatísticas da Luta
      const statPunches = document.getElementById('stat-punches-landed');
      const statAcc = document.getElementById('stat-accuracy');
      const statHead = document.getElementById('stat-headshots');
      const statDealt = document.getElementById('stat-damage-dealt');
      const statTaken = document.getElementById('stat-damage-taken');
      const statTime = document.getElementById('stat-fight-time');

      if (statPunches) statPunches.textContent = `${landed} / ${thrown}`;
      if (statAcc) statAcc.textContent = `${accuracy}%`;
      if (statHead) statHead.textContent = `${matchStats.headshots}`;
      if (statDealt) statDealt.textContent = `${matchStats.damageDealt} HP`;
      if (statTaken) statTaken.textContent = `${matchStats.damageTaken} HP`;
      if (statTime) statTime.textContent = timeFormatted;

      // Salva os dados atualizados no Firestore (apenas lutas que contam para o cartel)
      if (isCareerMatch && typeof window.updatePlayerCareerInFirestore === 'function') {
        window.updatePlayerCareerInFirestore({
          coins: playerCareer.coins,
          wins: playerCareer.wins,
          losses: playerCareer.losses,
          kos: playerCareer.kos,
          totalFights: playerCareer.totalFights,
          trophies: playerCareer.trophies,
          level: playerCareer.level
        });
      }

      // Sincroniza dados no Lobby
      updateLobbyCareerStats();

      // Exibe tela pós-partida
      if (modalEl) modalEl.classList.remove('hidden');
    }

    // --- CONTROLES DO FORTNITE HUB ---
    let selectedMode = 'training'; // 'training', 'ranked', 'pvp'
    const btnMainPlay = document.getElementById('btn-main-play');
    const modeTitleEl = document.getElementById('fn-selected-mode-title');
    const modeBadgeTextEl = document.getElementById('fn-mode-badge-text');
    const discoverCards = document.querySelectorAll('.fn-discover-card');
    const fnTabs = document.querySelectorAll('.fn-tab');
    const fnTabContents = document.querySelectorAll('.fn-tab-content');

    // Renderização do Leaderboard Oficial do Firestore
    async function loadLeaderboardUI() {
      const listEl = document.getElementById('fn-ranking-list');
      if (!listEl) return;
      listEl.innerHTML = '<div class="fn-ranking-loading">Carregando classificação oficial do Firestore...</div>';

      let leaderboard = [];
      if (typeof window.fetchLeaderboard === 'function') {
        try {
          leaderboard = await window.fetchLeaderboard(20);
        } catch(e) {
          console.warn('Erro ao buscar leaderboard:', e);
        }
      }

      const myUid = window.playerProfile ? window.playerProfile.uid : 'me';
      const myName = window.playerProfile ? window.playerProfile.displayName : 'Você';
      const myTrophies = playerCareer.trophies || 0;
      const myWins = playerCareer.wins || 0;
      const myLosses = playerCareer.losses || 0;
      const myRate = (playerCareer.totalFights > 0 ? ((myWins / playerCareer.totalFights) * 100).toFixed(1) : '0.0');

      let userFoundInList = false;
      let myRankIndex = 1;

      // Se o banco ainda estiver vazio, exibir o perfil atual
      if (!leaderboard || leaderboard.length === 0) {
        leaderboard = [
          { displayName: myName, trophies: myTrophies, wins: myWins, losses: myLosses, level: playerCareer.level || 1, id: myUid }
        ];
      }

      listEl.innerHTML = '';
      leaderboard.forEach((p, idx) => {
        const pos = idx + 1;
        const isMe = (window.playerProfile && p.id === window.playerProfile.uid) || (p.displayName === myName && p.trophies === myTrophies);
        if (isMe) {
          userFoundInList = true;
          myRankIndex = pos;
        }

        const fights = (p.wins || 0) + (p.losses || 0);
        const rate = fights > 0 ? (((p.wins || 0) / fights) * 100).toFixed(1) : '0.0';
        const avatarUrl = p.photoURL || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(p.displayName || 'Player'));

        let posBadgeClass = '';
        let posText = `#${pos}`;
        if (pos === 1) { posBadgeClass = 'gold'; posText = '🥇 1'; }
        else if (pos === 2) { posBadgeClass = 'silver'; posText = '🥈 2'; }
        else if (pos === 3) { posBadgeClass = 'bronze'; posText = '🥉 3'; }

        const row = document.createElement('div');
        row.className = `fn-ranking-row ${pos <= 3 ? `top-${pos}` : ''} ${isMe ? 'is-me' : ''}`;
        row.innerHTML = `
          <div class="rank-col-pos">
            <span class="rank-pos-badge ${posBadgeClass}">${posText}</span>
          </div>
          <div class="rank-col-player">
            <img class="rank-avatar" src="${avatarUrl}" alt="${p.displayName}" referrerpolicy="no-referrer">
            <div class="rank-player-info">
              <span class="rank-player-name">${p.displayName} ${isMe ? '<span style="color:#06b6d4; font-size:11px;">(VOCÊ)</span>' : ''}</span>
              <span class="rank-player-sub">LVL ${p.level || 1} • PESO-PESADO</span>
            </div>
          </div>
          <div class="rank-col-record">${p.wins || 0}V - ${p.losses || 0}D</div>
          <div class="rank-col-rate">${rate}%</div>
          <div class="rank-col-elo">🏆 ${p.trophies || 0}</div>
        `;
        listEl.appendChild(row);
      });

      // Atualiza Card Fixo do Rodapé e Aba Carreira
      playerCareer.rankPosition = userFoundInList ? myRankIndex : (leaderboard.length + 1);
      const careerRank = document.getElementById('career-rank');
      if (careerRank) careerRank.textContent = `#${playerCareer.rankPosition}`;
      const myPosEl = document.getElementById('my-rank-position');
      const myRecEl = document.getElementById('my-rank-record');
      const myRateEl = document.getElementById('my-rank-rate');
      const myEloEl = document.getElementById('my-rank-elo');
      if (myPosEl) myPosEl.textContent = `#${playerCareer.rankPosition}`;
      if (myRecEl) myRecEl.textContent = `${myWins}V - ${myLosses}D`;
      if (myRateEl) myRateEl.textContent = `${myRate}%`;
      if (myEloEl) myEloEl.textContent = `🏆 ${myTrophies} TROFÉUS`;
    }
    window.loadLeaderboardUI = loadLeaderboardUI;

    const btnRefreshRanking = document.getElementById('btn-refresh-ranking');
    if (btnRefreshRanking) {
      btnRefreshRanking.addEventListener('click', () => {
        loadLeaderboardUI();
      });
    }

    function switchFnTab(tabName) {
      fnTabs.forEach(t => {
        if (t.dataset.tab === tabName) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
      fnTabContents.forEach(content => {
        if (content.id === `tab-${tabName}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      if (tabName === 'ranking') {
        loadLeaderboardUI();
      }
    }
    window.switchFnTab = switchFnTab;

    fnTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (tabName) switchFnTab(tabName);
      });
    });

    function selectMode(mode) {
      selectedMode = mode;
      discoverCards.forEach(c => {
        if (c.dataset.mode === mode) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      if (modeTitleEl) {
        if (mode === 'training') {
          modeTitleEl.textContent = 'INICIAR SPARRING';
        } else if (mode === 'ranked') {
          modeTitleEl.textContent = 'BUSCAR COMBATE RANQUEADO';
        } else if (mode === 'pvp') {
          modeTitleEl.textContent = 'ABRIR SALA 1X1';
        }
      }
    }

    discoverCards.forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        if (mode === 'training' || mode === 'ranked' || mode === 'pvp') {
          selectMode(mode);
        }
      });
      card.addEventListener('dblclick', () => {
        const mode = card.dataset.mode;
        if (mode === 'pvp') {
          open1v1Modal();
        } else if (mode === 'ranked') {
          startRankedMatchmaking();
        } else {
          startSoloTraining();
        }
      });
    });

    function startSoloTraining() {
      window.matchRoom = null;
      window.remoteOpponentData = null;
      window.remoteOpponentId = null;
      window.remoteOpponentName = 'IA de Treino';
      const oppNameEl = document.querySelector('.hud-opponent-side .hud-fighter-name');
      if (oppNameEl) {
        oppNameEl.innerHTML = 'IA DE TREINO <span class="hud-badge-boss">SPARRING</span>';
      }
      startCalibration();
    }

    // Botão Principal JOGAR / COMBATE
    if (btnMainPlay) {
      btnMainPlay.addEventListener('click', () => {
        if (selectedMode === 'pvp') {
          open1v1Modal();
        } else if (selectedMode === 'ranked') {
          startRankedMatchmaking();
        } else {
          startSoloTraining();
        }
      });
    }

    const open1v1Modal = () => {
      if (startScreen) startScreen.classList.add('hidden');
      if (pvpModal) pvpModal.classList.remove('hidden');
    };


    // Ações Rápidas
    const btnQuickCalibrate = document.getElementById('btn-quick-calibrate');
    if (btnQuickCalibrate) btnQuickCalibrate.addEventListener('click', startCalibration);

    // Customização do Vestiário
    const SAVED_APPEARANCE_KEY = 'virtual_boxing_appearance';
    let savedAppears = { glove: 'cyan', shorts: 'red' };
    try {
      const stored = localStorage.getItem(SAVED_APPEARANCE_KEY);
      if (stored) Object.assign(savedAppears, JSON.parse(stored));
    } catch(e) {}

    const gloveItems = document.querySelectorAll('.fn-locker-grid:not(.fn-shorts-grid) .fn-locker-item');
    gloveItems.forEach(item => {
      item.addEventListener('click', () => {
        gloveItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const gloveColor = item.dataset.glove;
        let hexColor = 0x06b6d4;
        let gloveName = 'NEON CIANO';
        let txtClass = 'text-cyan';

        if (gloveColor === 'gold') {
          hexColor = 0xf59e0b;
          gloveName = 'OURO CAMPEÃO';
          txtClass = 'text-gold';
        } else if (gloveColor === 'red') {
          hexColor = 0xef4444;
          gloveName = 'RUBRO CLÁSSICO';
          txtClass = 'text-red';
        } else if (gloveColor === 'dark') {
          hexColor = 0x111111;
          gloveName = 'STEALTH TÁTICO';
          txtClass = 'text-gray';
        }

        if (leftArm && leftArm.fist) leftArm.fist.material.color.setHex(hexColor);
        if (rightArm && rightArm.fist) rightArm.fist.material.color.setHex(hexColor);

        savedAppears.glove = gloveColor;
        try { localStorage.setItem(SAVED_APPEARANCE_KEY, JSON.stringify(savedAppears)); } catch(e){}

        // Atualiza etiqueta da luva no dossiê
        const dossierGlove = document.getElementById('dossier-glove');
        if (dossierGlove) {
          dossierGlove.textContent = gloveName;
          dossierGlove.className = `fn-dossier-val ${txtClass}`;
        }
      });
    });

    const shortsItems = document.querySelectorAll('.fn-shorts-grid .fn-locker-item');
    shortsItems.forEach(item => {
      item.addEventListener('click', () => {
        shortsItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const shortsColor = item.dataset.shorts;
        let pColor = 0xef4444; // Default red
        let shortsName = 'RUBRO CLÁSSICO';
        let txtClass = 'text-red';

        if (shortsColor === 'blue') {
          pColor = 0x1d4ed8;
          shortsName = 'AZUL PROFUNDO';
          txtClass = 'text-blue';
        } else if (shortsColor === 'gold') {
          pColor = 0xf59e0b;
          shortsName = 'OURO CAMPEÃO';
          txtClass = 'text-gold';
        } else if (shortsColor === 'dark') {
          pColor = 0x111111;
          shortsName = 'STEALTH TÁTICO';
          txtClass = 'text-gray';
        }

        savedAppears.shorts = shortsColor;
        try { localStorage.setItem(SAVED_APPEARANCE_KEY, JSON.stringify(savedAppears)); } catch(e){}

        if (window.playerProfile) {
            window.playerProfile.shortsColor = shortsColor;
        }

        const dossierShorts = document.getElementById('dossier-shorts');
        if (dossierShorts) {
           dossierShorts.textContent = shortsName;
           dossierShorts.className = `fn-dossier-val ${txtClass}`;
        }
      });
    });

    // Aplica a cor salva inicialmente
    const initGlove = Array.from(gloveItems).find(i => i.dataset.glove === savedAppears.glove) || gloveItems[0];
    if (initGlove) initGlove.click();

    const initShorts = Array.from(shortsItems).find(i => i.dataset.shorts === savedAppears.shorts) || shortsItems[0];
    if (initShorts) initShorts.click();

    // Atalhos de Teclado
    window.addEventListener('keydown', (e) => {
      if (isGameStarted) return;
      if (e.key === 'c' || e.key === 'C') {
        startCalibration();
      } else if (e.key === 'Escape') {
        switchFnTab('play');
        isCalibrating = false;
        if (postMatchModal && !postMatchModal.classList.contains('hidden')) {
          postMatchModal.classList.add('hidden');
          if (startScreen) startScreen.classList.remove('hidden');
          if (camPreviewEl && calibPreviewContainer) calibPreviewContainer.appendChild(camPreviewEl);
        }
        if (pvpModal && !pvpModal.classList.contains('hidden')) {
          pvpModal.classList.add('hidden');
          if (startScreen) startScreen.classList.remove('hidden');
        }
        if (modal && !modal.classList.contains('hidden')) {
          if (calibrationTimer) {
            clearInterval(calibrationTimer);
            calibrationTimer = null;
          }
          if (countdownEl) countdownEl.style.display = 'none';
          modal.classList.add('hidden');
          if (camPreviewEl && calibPreviewContainer) calibPreviewContainer.appendChild(camPreviewEl);
          if (startScreen) startScreen.classList.remove('hidden');
        }
      }
    });
    
    function startCalibration() {
      if (startScreen) startScreen.classList.add('hidden');
      if (pvpModal) pvpModal.classList.add('hidden');
      if (postMatchModal) postMatchModal.classList.add('hidden');
      if (modal) modal.classList.remove('hidden');
      if (camPreviewEl && calibPreviewContainer) calibPreviewContainer.appendChild(camPreviewEl);
      
      isCalibrating = true;
      calibrationCount = 5;
      if (calibrationTimer) {
        clearInterval(calibrationTimer);
        calibrationTimer = null;
      }
      if (countdownEl) {
        countdownEl.textContent = '5';
        countdownEl.style.display = 'none';
      }
      if (instructionsEl) {
        instructionsEl.textContent = "Aguardando câmera... Posicione-se de modo que você apareça da cintura para cima, incluindo a cabeça e os punhos.";
        instructionsEl.style.color = "#fbbf24";
      }
    }

    // Botões da Tela Pós-Partida
    const btnPostMatchLobby = document.getElementById('btn-post-match-lobby');
    const btnPostMatchRematch = document.getElementById('btn-post-match-rematch');

    if (btnPostMatchLobby) {
      btnPostMatchLobby.addEventListener('click', () => {
        isCalibrating = false;
        if (calibrationTimer) {
          clearInterval(calibrationTimer);
          calibrationTimer = null;
        }
        if (matchCountdownTimer) {
          clearTimeout(matchCountdownTimer);
          matchCountdownTimer = null;
        }
        if (postMatchModal) postMatchModal.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
        if (camPreviewEl && calibPreviewContainer) calibPreviewContainer.appendChild(camPreviewEl);
        switchFnTab('play');
      });
    }

    if (btnPostMatchRematch) {
      btnPostMatchRematch.addEventListener('click', () => {
        if (postMatchModal) postMatchModal.classList.add('hidden');
        startCalibration();
      });
    }

    // Lógica do Modal PvP
    const btnCreateRoom = document.getElementById('btn-create-room');
    const pvpCodeDisplay = document.getElementById('pvp-code-display');
    const roomCodeEl = document.getElementById('room-code');
    const btnStartPvPHost = document.getElementById('btn-start-pvp-host');
    const btnJoinRoom = document.getElementById('btn-join-room');
    const pvpCodeInput = document.getElementById('pvp-code-input');
    const btnClosePvP = document.getElementById('btn-close-pvp');

    if (btnCreateRoom) {
      
    btnCreateRoom.addEventListener('click', async () => {
      try {
        if (!window.colyseusClient) { alert("Servidor offline!"); return; }
        btnCreateRoom.textContent = "CRIANDO...";
        
        let token = window.playerProfile ? window.playerProfile.uid : null;
        window.matchRoom = await window.colyseusClient.create('fight', { isPrivate: true, uid: token });
        
        const code = window.matchRoom.roomId || window.matchRoom.id;
        if (roomCodeEl) roomCodeEl.textContent = code;
        if (pvpCodeDisplay) pvpCodeDisplay.classList.remove('hidden');
        btnCreateRoom.classList.add('hidden'); // Oculta o botão de criar
        btnStartPvPHost.textContent = "AGUARDANDO OPONENTE...";
        btnStartPvPHost.disabled = true;

        setupRoom(window.matchRoom);

      } catch (e) {
        console.error(e);
        alert("Erro ao criar sala! " + e.message);
        console.error("DETALHES DO ERRO:", e);
        btnCreateRoom.textContent = "GERAR CÓDIGO DA SALA";
      }
    });

    }

    if (btnStartPvPHost) {
      btnStartPvPHost.addEventListener('click', startCalibration);
    }

    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', async () => {
        const code = pvpCodeInput ? pvpCodeInput.value.trim() : '';
        if (code.length > 0) {
          try {
            if (!window.colyseusClient) { alert("Servidor offline!"); return; }
            btnJoinRoom.textContent = "ENTRANDO...";
            
            let token = window.playerProfile ? window.playerProfile.uid : null;
            window.matchRoom = await window.colyseusClient.joinById(code, { uid: token });
            
            setupRoom(window.matchRoom);
            startCalibration(); 
            
          } catch (e) {
            console.error(e);
            alert("Sala não encontrada ou cheia!");
            btnJoinRoom.textContent = "ENTRAR NA SALA";
          }
        } else {
          alert('Por favor, insira um código válido.');
        }
      });
    }

    const closePvP = () => {
      if (pvpModal) pvpModal.classList.add('hidden');
      if (startScreen) startScreen.classList.remove('hidden');
      if (pvpCodeDisplay) pvpCodeDisplay.classList.add('hidden');
      if (btnCreateRoom) btnCreateRoom.classList.remove('hidden');
      if (pvpCodeInput) pvpCodeInput.value = '';
    };

    if (btnClosePvP) btnClosePvP.addEventListener('click', closePvP);

    const btnClosePvPX = document.getElementById('btn-close-pvp-x');
    if (btnClosePvPX) btnClosePvPX.addEventListener('click', closePvP);

    // --- LÓGICA DE MATCHMAKING RANQUEADO ONLINE ---
    const rankedModal = document.getElementById('ranked-matchmaking-modal');
    const rankedQueueTimerEl = document.getElementById('ranked-queue-timer');
    const rankedQueueEloEl = document.getElementById('ranked-queue-elo');
    const rankedQueueStatusEl = document.getElementById('ranked-queue-status');
    const rankedFoundCard = document.getElementById('ranked-found-card');
    const rankedRadarContainer = document.getElementById('ranked-radar-container');
    const rankedQueueInfo = document.getElementById('ranked-queue-info');
    const btnCancelRanked = document.getElementById('btn-cancel-ranked-match');
    const btnCancelRankedX = document.getElementById('btn-cancel-ranked-x');
    const rankedTitleEl = document.getElementById('ranked-match-status-title');
    const rankedDescEl = document.getElementById('ranked-match-status-desc');

    let rankedQueueInterval = null;
    let rankedQueueSeconds = 0;

    async function startRankedMatchmaking() {
      if (!window.colyseusClient) {
        try {
          if (typeof Colyseus !== 'undefined' && typeof Colyseus.Client === 'function') {
            const wsProto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const wsHost = window.location.hostname || 'localhost';
            window.colyseusClient = new Colyseus.Client(`${wsProto}${wsHost}:2567`);
          }
        } catch(e) {
          console.warn('Colyseus Client init error:', e);
        }
      }

      if (!window.colyseusClient) {
        alert("Servidor Multiplayer offline! Inicie o servidor Node.js (pasta server) ou jogue no modo Treino Solo.");
        return;
      }

      // Preparar UI do Modal
      if (startScreen) startScreen.classList.add('hidden');
      if (rankedModal) rankedModal.classList.remove('hidden');
      if (rankedFoundCard) rankedFoundCard.classList.add('hidden');
      if (rankedRadarContainer) rankedRadarContainer.style.display = 'flex';
      if (rankedQueueInfo) rankedQueueInfo.style.display = 'grid';
      if (btnCancelRanked) btnCancelRanked.style.display = 'inline-block';
      if (rankedTitleEl) rankedTitleEl.textContent = 'BUSCANDO ADVERSÁRIO ONLINE...';
      if (rankedDescEl) rankedDescEl.textContent = 'Procurando um oponente compatível com seu nível e ranking de troféus.';

      const myTrophies = playerCareer.trophies || 0;
      if (rankedQueueEloEl) rankedQueueEloEl.textContent = `${myTrophies} TROFÉUS`;
      if (rankedQueueStatusEl) rankedQueueStatusEl.textContent = 'BUSCANDO...';

      rankedQueueSeconds = 0;
      if (rankedQueueTimerEl) rankedQueueTimerEl.textContent = '00:00';
      if (rankedQueueInterval) clearInterval(rankedQueueInterval);

      rankedQueueInterval = setInterval(() => {
        rankedQueueSeconds++;
        const mins = Math.floor(rankedQueueSeconds / 60);
        const secs = rankedQueueSeconds % 60;
        if (rankedQueueTimerEl) {
          rankedQueueTimerEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      }, 1000);

      try {
        const token = window.playerProfile ? window.playerProfile.uid : ('guest_' + Math.random().toString(36).substr(2, 6));
        const displayName = window.playerProfile ? window.playerProfile.displayName : 'Lutador Convidado';
        const photoURL = window.playerProfile ? window.playerProfile.photoURL : '';

        window.matchRoom = await window.colyseusClient.joinOrCreate('ranked_fight', {
          isRanked: true,
          uid: token,
          displayName: displayName,
          photoURL: photoURL,
          trophies: myTrophies
        });

        setupRoom(window.matchRoom, true);

      } catch (err) {
        console.error('[!] Erro ao entrar no matchmaking:', err);
        cancelRankedMatchmaking();
        alert('Não foi possível conectar à fila ranqueada: ' + (err.message || 'Verifique se o servidor está rodando na porta 2567.'));
      }
    }

    function cancelRankedMatchmaking() {
      if (rankedQueueInterval) {
        clearInterval(rankedQueueInterval);
        rankedQueueInterval = null;
      }
      if (window.matchRoom) {
        try { window.matchRoom.leave(); } catch(e){}
        window.matchRoom = null;
      }
      if (rankedModal) rankedModal.classList.add('hidden');
      if (startScreen) startScreen.classList.remove('hidden');
    }

    if (btnCancelRanked) btnCancelRanked.addEventListener('click', cancelRankedMatchmaking);
    if (btnCancelRankedX) btnCancelRankedX.addEventListener('click', cancelRankedMatchmaking);

    function triggerPlayerDamageFeedback() {
      playerCameraShake = 0.35;
      document.body.classList.add('flash-screen');
      setTimeout(() => document.body.classList.remove('flash-screen'), 200);
    }

    function setupRoom(room, isRanked = false) {
      room.onMessage('start_fight', (data) => {
        console.log("[⚔️] Partida Iniciada pelo Servidor!", data);
        if (rankedQueueInterval) {
          clearInterval(rankedQueueInterval);
          rankedQueueInterval = null;
        }

        const players = data ? data.players : null;
        let remoteOpp = null;
        if (players && Array.isArray(players)) {
          remoteOpp = players.find(p => p.sessionId !== room.sessionId);
        }

        if (remoteOpp) {
          window.remoteOpponentName = remoteOpp.displayName;
          window.remoteOpponentTrophies = remoteOpp.trophies;
          const oppNameEl = document.querySelector('.hud-opponent-side .hud-fighter-name');
          if (oppNameEl) {
            oppNameEl.innerHTML = `${remoteOpp.displayName} <span class="hud-badge-boss">${remoteOpp.trophies || 0} TROFÉUS</span>`;
          }
        }

        if (isRanked && rankedFoundCard) {
          if (rankedRadarContainer) rankedRadarContainer.style.display = 'none';
          if (rankedQueueInfo) rankedQueueInfo.style.display = 'none';
          if (btnCancelRanked) btnCancelRanked.style.display = 'none';
          if (rankedTitleEl) rankedTitleEl.textContent = 'ADVERSÁRIO ENCONTRADO!';
          if (rankedDescEl) rankedDescEl.textContent = 'Preparando os boxeadores para entrar no ringue...';

          const foundOppNameEl = document.getElementById('found-opp-name');
          const foundOppEloEl = document.getElementById('found-opp-elo');
          const foundMyEloEl = document.getElementById('found-my-elo');
          const foundOppAvatarEl = document.getElementById('found-opp-avatar');
          const foundMyAvatarEl = document.getElementById('found-my-avatar');

          if (foundOppNameEl && remoteOpp) foundOppNameEl.textContent = remoteOpp.displayName;
          if (foundOppEloEl && remoteOpp) foundOppEloEl.textContent = `${remoteOpp.trophies || 0} TROFÉUS`;
          if (foundMyEloEl) foundMyEloEl.textContent = `${playerCareer.trophies || 0} TROFÉUS`;

          if (remoteOpp && remoteOpp.photoURL && foundOppAvatarEl) {
            foundOppAvatarEl.innerHTML = `<img src="${remoteOpp.photoURL}" alt="avatar" referrerpolicy="no-referrer">`;
          }
          if (window.playerProfile && window.playerProfile.photoURL && foundMyAvatarEl) {
            foundMyAvatarEl.innerHTML = `<img src="${window.playerProfile.photoURL}" alt="avatar" referrerpolicy="no-referrer">`;
          }

          rankedFoundCard.classList.remove('hidden');

          let countdownSec = 3;
          const countdownEl = document.getElementById('found-countdown-text');
          const interval = setInterval(() => {
            countdownSec--;
            if (countdownEl) countdownEl.textContent = `Iniciando combate em ${countdownSec}s...`;
            if (countdownSec <= 0) {
              clearInterval(interval);
              if (rankedModal) rankedModal.classList.add('hidden');
              startCalibration();
            }
          }, 1000);

        } else {
          // Modo 1x1 Privado com código
          if (btnStartPvPHost) {
            btnStartPvPHost.textContent = "INICIAR LUTA (2/2)";
            btnStartPvPHost.disabled = false;
            startCalibration();
          }
        }
      });

      room.onMessage('player_punch', (data) => {
        if (data.sessionId !== room.sessionId) {
          startOpponentAttack(data.side === 1 ? 'jab' : 'cross', true);
          opponentImpactTarget = -0.05;
        }
      });

      room.onMessage('hit_confirmed', (data) => {
        if (data.targetId === room.sessionId) {
          playerHealth = Math.max(0, data.targetHealth);
          updateHealthUI();
          triggerPlayerDamageFeedback();
          if (playerHealth <= 0 && !isMatchOver) {
            isMatchOver = true;
            showCenterMessage("NOCAUTE! Você Perdeu!", 2500);
          }
        } else {
          opponentHealth = Math.max(0, data.targetHealth);
          updateHealthUI();
          opponentImpactTarget = -0.6;
          if (opponentHealth <= 0 && !isMatchOver) {
            isMatchOver = true;
            showCenterMessage("NOCAUTE! Você Venceu!", 2500);
          }
        }
      });

      room.onMessage('match_end', (data) => {
        console.log("[🏁] Fim de Combate:", data);
        const isWinner = data.winner === room.sessionId;
        if (isWinner) {
          playerHealth = 100; opponentHealth = 0;
          updateHealthUI();
          setTimeout(() => {
            showPostMatchScreen('player', 'KO', data);
          }, 1500);
        } else {
          playerHealth = 0; opponentHealth = 100;
          updateHealthUI();
          setTimeout(() => {
            showPostMatchScreen('opponent', 'KO', data);
          }, 1500);
        }
      });

      const registerPlayersListener = (state) => {
        if (!state || !state.players) return false;
        state.players.onAdd((player, sessionId) => {
          console.log("Player adicionado na sala:", sessionId);
          player.onChange((changes) => {
            if (sessionId !== room.sessionId) {
              window.remoteOpponentData = player;
              window.remoteOpponentId = sessionId;
              if (player.displayName) window.remoteOpponentName = player.displayName;
            }
          });
        });
        return true;
      };

      if (!registerPlayersListener(room.state)) {
        room.onStateChange.once((state) => {
          registerPlayersListener(state);
        });
      }

      room.onLeave(() => {
        console.log("Desconectado da sala.");
        if (isGameStarted && !isMatchOver) {
          showCenterMessage("Oponente se desconectou!", 3000);
          showPostMatchScreen('player', 'ABANDONO');
        }
      });
    }

    const btnSkipCalibration = document.getElementById('btn-skip-calibration');
    if (btnSkipCalibration) {
      btnSkipCalibration.addEventListener('click', () => {
        isCalibrating = false;
        if (calibrationTimer) {
          clearInterval(calibrationTimer);
          calibrationTimer = null;
        }
        if (countdownEl) countdownEl.style.display = 'none';
        startGame();
      });
    }

    const btnCancelCalibration = document.getElementById('btn-cancel-calibration');
    if (btnCancelCalibration) {
      btnCancelCalibration.addEventListener('click', () => {
        isCalibrating = false;
        if (calibrationTimer) {
          clearInterval(calibrationTimer);
          calibrationTimer = null;
        }
        if (countdownEl) countdownEl.style.display = 'none';
        if (modal) modal.classList.add('hidden');
        if (camPreviewEl && calibPreviewContainer) calibPreviewContainer.appendChild(camPreviewEl);
        if (startScreen) startScreen.classList.remove('hidden');
      });
    }
    
    function startGame() {
      if (isGameStarted) return;
      isGameStarted = true;
      isCalibrating = false;
      isFightActive = false;
      if (calibrationTimer) {
        clearInterval(calibrationTimer);
        calibrationTimer = null;
      }
      if (matchCountdownTimer) {
        clearTimeout(matchCountdownTimer);
        matchCountdownTimer = null;
      }
      
      currentRound = 1;
      matchTimer = 30.0;
      isMatchOver = false;
      isRoundTransition = false;
      playerHealth = 100;
      opponentHealth = 100;
      opponentImpactTarget = 0;
      if (opponent) {
        oppState.phase = 'idle';
        oppState.attack = null;
        oppState.dealt = false;
        oppState.visualOnly = false;
        oppState.nextAt = performance.now() + 1500;
        opponent.position.z = -1.55;
        opponent.rotation.x = 0;
        opponent.rotation.y = 0;
      }

      // Previne socos fantasmas no início
      fistPrev['L'] = null;
      fistPrev['R'] = null;
      leftArm.animState = 0;
      rightArm.animState = 0;
      leftArm.hasHit = false;
      rightArm.hasHit = false;
      lastArmHitTime['L'] = 0;
      lastArmHitTime['R'] = 0;

      matchStats = {
        punchesThrown: 0,
        punchesLanded: 0,
        headshots: 0,
        damageDealt: 0,
        damageTaken: 0,
        startTime: performance.now(),
        startTime: performance.now() + 3000,
        endTime: 0
      };

      if (postMatchModal) postMatchModal.classList.add('hidden');
      if (modal) modal.classList.add('hidden');
      if (countdownEl) countdownEl.style.display = 'none';
      if (camPreviewEl) document.body.appendChild(camPreviewEl);
      
      // Show HUD
      const hb = document.querySelector('.health-bars');
      const mi = document.querySelector('.match-info');
      if (hb) hb.style.display = 'flex';
      if (mi) mi.style.display = 'flex';
      
      updateHealthUI();
      updateMatchUI();

      if (modal) modal.classList.add('hidden');
      if (camPreviewEl) document.body.appendChild(camPreviewEl);
      if (countdownEl) countdownEl.style.display = 'none';
      startFightCountdown();
    }

    function startFightCountdown() {
      isFightActive = false;
      fistPrev['L'] = null;
      fistPrev['R'] = null;
      leftArm.hasHit = false;
      rightArm.hasHit = false;

      showCenterMessage("3", 950);
      matchCountdownTimer = setTimeout(() => {
        if (!isGameStarted || isMatchOver) return;
        showCenterMessage("2", 950);
        matchCountdownTimer = setTimeout(() => {
          if (!isGameStarted || isMatchOver) return;
          showCenterMessage("1", 950);
          matchCountdownTimer = setTimeout(() => {
            if (!isGameStarted || isMatchOver) return;
            showCenterMessage("LUTE!", 1200);
            isFightActive = true;
            matchStats.startTime = performance.now();
            fistPrev['L'] = null;
            fistPrev['R'] = null;
          }, 1000);
        }, 1000);
      }, 1000);
    }

    function updateMatchUI() {
      const rdEl = document.getElementById('round-display');
      const tmEl = document.getElementById('timer-display');
      if (rdEl) rdEl.innerText = isMatchOver ? 'FIM' : `Round ${currentRound}/${maxRounds}`;
      
      // Usar Math.floor faz com que o número caia para 29 assim que o jogo começa, 
      // dando feedback visual imediato de que está contando.
      if (tmEl) {
        const displayTime = Math.max(0, Math.floor(matchTimer));
        tmEl.innerText = displayTime < 10 ? `0${displayTime}` : displayTime;
      }
    }

    // No more manual start button, calibration will start the game automatically
    
    function setCalibrationValid(isValid) {
      if (!isCalibrating || !modal || modal.classList.contains('hidden') || isGameStarted) {
        if (calibrationTimer) {
          clearInterval(calibrationTimer);
          calibrationTimer = null;
        }
        if (countdownEl) countdownEl.style.display = 'none';
        return;
      }

      if (isValid) {
        if (!calibrationTimer) {
          calibrationCount = 5;
          if (countdownEl) {
            countdownEl.textContent = calibrationCount;
            countdownEl.style.display = 'block';
          }
          if (instructionsEl) instructionsEl.textContent = "Excelente! Mantenha a posição...";
          calibrationTimer = setInterval(() => {
            if (!isCalibrating || !modal || modal.classList.contains('hidden') || isGameStarted) {
              clearInterval(calibrationTimer);
              calibrationTimer = null;
              if (countdownEl) countdownEl.style.display = 'none';
              return;
            }
            calibrationCount--;
            if (calibrationCount > 0) {
              if (countdownEl) countdownEl.textContent = calibrationCount;
            } else {
              clearInterval(calibrationTimer);
              calibrationTimer = null;
              isCalibrating = false;
              startGame();
            }
          }, 1000);
        }
      } else {
        if (calibrationTimer) {
          clearInterval(calibrationTimer);
          calibrationTimer = null;
          if (countdownEl) countdownEl.style.display = 'none';
        }
      }
    }

    let lastFrameTime = performance.now();

    let playerHealth = 100;
    let opponentHealth = 100;
    let currentRound = 1;
    let maxRounds = 2;
    let matchTimer = 30.0;
    let isMatchOver = false;
    let isRoundTransition = false;
    
    // Variáveis de Animação
    let opponentImpactTarget = 0;
    let playerCameraShake = 0;
    let hitstopEndTime = 0;

    // --- SISTEMA DE ATAQUES DO ADVERSÁRIO (animação completa + variedade) ---
    const OPP_ATTACKS = {
      jab: {
        name: 'JAB', lead: 'L', windup: 0.22, thrust: 0.16, recover: 0.18, hitAt: 0.26,
        lunge: 0.4, yaw: 0.14, minDmg: 4, maxDmg: 8
      },
      cross: {
        name: 'DIRETO', lead: 'R', windup: 0.26, thrust: 0.18, recover: 0.22, hitAt: 0.32,
        lunge: 0.5, yaw: 0.22, minDmg: 6, maxDmg: 11
      },
      hook: {
        name: 'CRUZADO', lead: 'L', windup: 0.28, thrust: 0.18, recover: 0.16, hitAt: 0.34,
        lunge: 0.3, yaw: 0.4, minDmg: 8, maxDmg: 13
      },
      uppercut: {
        name: 'GANCHO', lead: 'R', windup: 0.28, thrust: 0.16, recover: 0.2, hitAt: 0.34,
        lunge: 0.25, yaw: 0.12, minDmg: 9, maxDmg: 15
      }
    };

    // Pose de "preparo" (telegrafia: puxa o punho antes de soltar o golpe)
    function oppWoundPose(rig) {
      return {
        elbow: rig.guardElbow.clone().add(new THREE.Vector3(0, -0.08, -0.14)),
        wrist: rig.guardWrist.clone().add(new THREE.Vector3(0, -0.16, -0.22))
      };
    }

    // Poses de extensão de cada golpe (coordenadas locais do adversário)
    function oppExtPose(type, lead) {
      const s = lead === 'L' ? -1 : 1;
      if (type === 'jab') {
        return {
          lead: { e: new THREE.Vector3(s * 0.08, 1.42, 0.4), w: new THREE.Vector3(s * 0.1, 1.42, 0.62) },
          rear: { e: new THREE.Vector3(-s * 0.1, 1.52, -0.1), w: new THREE.Vector3(-s * 0.12, 1.6, 0.04) }
        };
      }
      if (type === 'cross') {
        return {
          lead: { e: new THREE.Vector3(s * 0.12, 1.46, 0.48), w: new THREE.Vector3(s * 0.15, 1.46, 0.7) },
          rear: { e: new THREE.Vector3(-s * 0.16, 1.54, -0.16), w: new THREE.Vector3(-s * 0.18, 1.62, -0.05) }
        };
      }
      if (type === 'hook') {
        return {
          lead: { e: new THREE.Vector3(s * 0.75, 1.5, 0.2), w: new THREE.Vector3(-s * 0.5, 1.52, 0.5) },
          rear: { e: new THREE.Vector3(-s * 0.2, 1.52, -0.12), w: new THREE.Vector3(-s * 0.22, 1.62, 0.0) }
        };
      }
      return {
        lead: { e: new THREE.Vector3(s * 0.3, 1.36, 0.14), w: new THREE.Vector3(s * 0.1, 1.62, 0.4) },
        rear: { e: new THREE.Vector3(-s * 0.18, 1.34, 0.02), w: new THREE.Vector3(-s * 0.14, 1.52, 0.16) }
      };
    }

    function poseOppArm(rig, elbow, wrist) {
      setSegment(rig.upper, rig.shoulderPos, elbow);
      rig.elbow.position.copy(elbow);
      setSegment(rig.fore, elbow, wrist);
      rig.glove.position.copy(wrist);
    }

    function computeOppFrame(attackKey, phase, t) {
      const atk = OPP_ATTACKS[attackKey];
      const leadRig = atk.lead === 'L' ? opponent.armL : opponent.armR;
      const rearRig = atk.lead === 'L' ? opponent.armR : opponent.armL;
      const p = oppExtPose(attackKey, atk.lead);
      const woundL = oppWoundPose(leadRig);
      const woundR = oppWoundPose(rearRig);
      const easeOut = (x) => 1 - (1 - x) * (1 - x);
      const yawSign = atk.lead === 'L' ? -1 : 1;
      let leadE, leadW, rearE, rearW, lunge = 0, yaw = 0;

      if (phase === 'windup') {
        const k = Math.min(1, t / atk.windup);
        leadE = leadRig.guardElbow.clone().lerp(woundL.elbow, k);
        leadW = leadRig.guardWrist.clone().lerp(woundL.wrist, k);
        rearE = rearRig.guardElbow.clone().lerp(woundR.elbow, k);
        rearW = rearRig.guardWrist.clone().lerp(woundR.wrist, k);
        lunge = -atk.lunge * 0.25 * k;
        yaw = atk.yaw * yawSign * 0.4 * k;
      } else if (phase === 'thrust') {
        const k = easeOut(Math.min(1, t / atk.thrust));
        leadE = woundL.elbow.clone().lerp(p.lead.e, k);
        leadW = woundL.wrist.clone().lerp(p.lead.w, k);
        rearE = woundR.elbow.clone().lerp(p.rear.e, k);
        rearW = woundR.wrist.clone().lerp(p.rear.w, k);
        lunge = atk.lunge * k;
        yaw = atk.yaw * yawSign * k;
      } else if (phase === 'recover') {
        const k = Math.min(1, t / atk.recover);
        leadE = p.lead.e.clone().lerp(leadRig.guardElbow, k);
        leadW = p.lead.w.clone().lerp(leadRig.guardWrist, k);
        rearE = p.rear.e.clone().lerp(rearRig.guardElbow, k);
        rearW = p.rear.w.clone().lerp(rearRig.guardWrist, k);
        lunge = atk.lunge * (1 - k);
        yaw = atk.yaw * yawSign * (1 - k);
      } else {
        leadE = leadRig.guardElbow.clone();
        leadW = leadRig.guardWrist.clone();
        rearE = rearRig.guardElbow.clone();
        rearW = rearRig.guardWrist.clone();
      }

      return { leadE, leadW, rearE, rearW, lunge, yaw, leadRig };
    }

    const oppState = {
      phase: 'idle', // idle | windup | thrust | recover
      attack: null,
      t: 0,
      dealt: false,
      visualOnly: false,
      nextAt: performance.now() + 1500
    };

    function startOpponentAttack(key, visualOnly = false) {
      if (!OPP_ATTACKS[key]) key = 'jab';
      oppState.attack = key;
      oppState.phase = 'windup';
      oppState.t = 0;
      oppState.dealt = false;
      oppState.visualOnly = visualOnly;
    }

    function dealOpponentDamage(atk, worldPoint) {
      let dmg = Math.round(atk.minDmg + Math.random() * (atk.maxDmg - atk.minDmg));
      if (window.isPlayerBlocking) dmg = Math.max(1, Math.round(dmg * 0.3));
      playerHealth -= dmg;
      matchStats.damageTaken += dmg;
      playerCameraShake = 0.3;
      showDamage(-dmg, worldPoint, !window.isPlayerBlocking);
      for (let i = 0; i < 12; i++) {
        const pMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), pMat);
        p.position.copy(worldPoint);
        p.velocity = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 4 + 1, (Math.random() - 0.5) * 5);
        p.life = 1.0;
        scene.add(p);
        hitParticles.push(p);
      }
      if (playerHealth <= 0 && !isMatchOver) {
        playerHealth = 0;
        isMatchOver = true;
        isFightActive = false;
        updateMatchUI();
        showCenterMessage("NOCAUTE! Você Perdeu!", 2500);
        setTimeout(() => { showPostMatchScreen('opponent', 'KO'); }, 1800);
      }
      updateHealthUI();
      document.body.classList.add('flash-screen');
      setTimeout(() => document.body.classList.remove('flash-screen'), 200);
    }

    function showDamage(amount, worldPos, isCritical) {
      const pos = worldPos.clone();
      pos.project(camera);
      const x = (pos.x * .5 + .5) * window.innerWidth;
      const y = (pos.y * -.5 + .5) * window.innerHeight;
      
      const el = document.createElement('div');
      el.className = 'damage-balloon' + (isCritical ? ' critical' : '');
      el.innerText = amount;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      document.body.appendChild(el);
      
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1000);
    }

    let playerGhostTimer = null;
    let opponentGhostTimer = null;

    function updateHealthUI() {
      const pEl = document.getElementById('player-health');
      const oEl = document.getElementById('opponent-health');
      const pTxt = document.getElementById('player-health-text');
      const oTxt = document.getElementById('opponent-health-text');
      const pGhost = document.getElementById('player-health-ghost');
      const oGhost = document.getElementById('opponent-health-ghost');

      const pVal = Math.max(0, Math.min(100, playerHealth));
      const oVal = Math.max(0, Math.min(100, opponentHealth));

      if (pEl) pEl.style.width = pVal + '%';
      if (oEl) oEl.style.width = oVal + '%';
      if (pTxt) pTxt.innerText = Math.round(pVal) + '%';
      if (oTxt) oTxt.innerText = Math.round(oVal) + '%';

      // Animação atrasada do rastro fantasma de dano (ghost bar)
      clearTimeout(playerGhostTimer);
      playerGhostTimer = setTimeout(() => {
        if (pGhost) pGhost.style.width = pVal + '%';
      }, 350);

      clearTimeout(opponentGhostTimer);
      opponentGhostTimer = setTimeout(() => {
        if (oGhost) oGhost.style.width = oVal + '%';
      }, 350);
    }

    function showCenterMessage(msg, duration) {
      let el = document.getElementById('center-message');
      if (!el) {
        el = document.createElement('div');
        el.id = 'center-message';
        el.style.position = 'absolute';
        el.style.top = '45%';
        el.style.left = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.color = '#fff';
        el.style.fontSize = '48px';
        el.style.fontWeight = '900';
        el.style.textShadow = '0 4px 15px rgba(0,0,0,0.8), 0 0 20px #ef4444';
        el.style.zIndex = '500';
        el.style.pointerEvents = 'none';
        el.style.textAlign = 'center';
        document.body.appendChild(el);
      }
      el.innerText = msg;
      el.style.display = 'block';
      if (el.timeoutId) clearTimeout(el.timeoutId);
      if (duration) {
        el.timeoutId = setTimeout(() => {
          el.style.display = 'none';
        }, duration);
      }
    }

    function animate() {

    if(window.matchRoom) {
       // Send Local Position
       window.matchRoom.send("move", {
           x: camera.position.x,
           y: camera.position.y,
           z: camera.position.z,
           rotY: camera.rotation.y,
           isBlocking: window.isPlayerBlocking || false
       });
       
       if(window.remoteOpponentData) {
           // Overwrite Opponent
           opponent.position.x = -window.remoteOpponentData.x;
           opponent.position.z = -window.remoteOpponentData.z; 
           opponent.position.y = window.remoteOpponentData.y;
           
           opponentHealth = window.remoteOpponentData.health;
           updateHealthUI();
       }
    }

      requestAnimationFrame(animate);

      const now = performance.now();
      if (now < hitstopEndTime) {
        lastFrameTime = now;
        renderer.render(scene, camera);
        return;
      }
      
      const dtSec = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      // Animação contínua da arena (Telão LED girando e flashes da plateia)
      if (typeof ledTex !== 'undefined' && ledTex) {
        ledTex.offset.x -= dtSec * 0.06;
      }
      if (typeof crowdFlashPoints !== 'undefined' && crowdFlashPoints) {
        crowdFlashPoints.material.opacity = 0.35 + Math.sin(now * 0.008) * 0.2 + (Math.random() > 0.82 ? 0.55 : 0);
        crowdFlashPoints.material.size = 0.45 + (Math.random() > 0.88 ? 0.35 : 0);
      }

      if (isGameStarted && isFightActive && !isMatchOver && !isRoundTransition) {
        matchTimer -= dtSec;
        updateMatchUI();
        
        if (matchTimer <= 0) {
          if (currentRound < maxRounds) {
            isRoundTransition = true;
            isFightActive = false;
            matchTimer = 0;
            updateMatchUI();
            
            showCenterMessage("Fim do Round " + currentRound, 2000);
            
            setTimeout(() => {
              if (isMatchOver) return;
              currentRound++;
              matchTimer = 30.0;
              isRoundTransition = false;
              showCenterMessage("Round " + currentRound + " - LUTE!", 1500);
              startFightCountdown();
              updateMatchUI();
            }, 3000);
          } else {
            isMatchOver = true;
            matchTimer = 0;
            updateMatchUI();
            
            let resultText = "Empate!";
            let winner = 'draw';
            if (playerHealth > opponentHealth) {
              resultText = "Você Venceu (Decisão)!";
              winner = 'player';
            } else if (opponentHealth > playerHealth) {
              resultText = "Você Perdeu (Decisão)!";
              winner = 'opponent';
            }
            showCenterMessage("Fim de Jogo!\n" + resultText, 2500);

            setTimeout(() => {
              showPostMatchScreen(winner, 'DECISION');
            }, 1800);
          }
        }
      }

      // Câmera se move lateralmente e na profundidade (frente/trás), e não sai do ringue
      camera.rotation.set(0, 0, 0);
      let camX = headSm.ox.x_prev !== null ? headSm.ox.x_prev * TRANS_SENS : 0;
      let camZ = bodySm.ow.x_prev !== null ? -bodySm.ow.x_prev * DEPTH_SENS : 0;
      
      let pushRight = 0;
      let pushLeft = 0;
      let pushBack = 0;
      
      const LIMIT_X = 1.7;
      if (camX > LIMIT_X) {
        pushRight = camX - LIMIT_X;
        camX = LIMIT_X;
      } else if (camX < -LIMIT_X) {
        pushLeft = camX + LIMIT_X; // valor negativo
        camX = -LIMIT_X;
      }
      
      const LIMIT_Z_MAX = 1.1; // Corda de trás está em Z ~1.35
      const LIMIT_Z_MIN = -0.9; // Não atravessar o oponente
      if (camZ > LIMIT_Z_MAX) {
        pushBack = camZ - LIMIT_Z_MAX; // Valor positivo, empurra corda para fora
        camZ = LIMIT_Z_MAX;
      } else if (camZ < LIMIT_Z_MIN) {
        camZ = LIMIT_Z_MIN;
      }
      
      camera.position.set(camX, CAM_HEIGHT, camZ);

      // Lógica para identificar aproximação/afastamento do jogador
      if (typeof window.lastPlayerDist === 'undefined') {
        window.lastPlayerDist = Math.abs(camera.position.z - opponent.position.z);
      }
      const currentDist = Math.abs(camera.position.z - opponent.position.z);
      const distDiff = currentDist - window.lastPlayerDist;
      
      let moveStatus = "Parado";
      if (distDiff < -0.005) {
        moveStatus = "Aproximando";
      } else if (distDiff > 0.005) {
        moveStatus = "Afastando";
      }
      
      const distInfoEl = document.getElementById('distance-info');
      if (distInfoEl) {
        distInfoEl.innerText = `⚡ ${moveStatus.toUpperCase()} • ${currentDist.toFixed(2)}M`;
      }
      window.lastPlayerDist = currentDist;

      // Anima física das cordas (elasticidade)
      ropes.forEach((r, idx) => {
        // Índices 1, 5, 9 = cordas da direita; 3, 7, 11 = cordas da esquerda; 2, 6, 10 = cordas de trás
        if (idx % 4 === 1) r.midPush.x = pushRight;
        if (idx % 4 === 3) r.midPush.x = pushLeft;
        if (idx % 4 === 2) r.midPush.z = pushBack;
        
        r.midPush.lerp(new THREE.Vector3(), 0.15); // mola para voltar

        const mid = r.p1.clone().lerp(r.p2, 0.5).add(r.midPush);
        
        const dist1 = r.p1.distanceTo(mid);
        r.r1.scale.set(1, dist1 / r.baseDist, 1);
        r.r1.position.copy(r.p1).lerp(mid, 0.5);
        if (dist1 > 0.001) r.r1.quaternion.setFromUnitVectors(up, mid.clone().sub(r.p1).normalize());

        const dist2 = mid.distanceTo(r.p2);
        r.r2.scale.set(1, dist2 / r.baseDist, 1);
        r.r2.position.copy(mid).lerp(r.p2, 0.5);
        if (dist2 > 0.001) r.r2.quaternion.setFromUnitVectors(up, r.p2.clone().sub(mid).normalize());
      });

      // --- ANIMAÇÃO DOS BRAÇOS (Gesture Trigger) ---
      const PUNCH_DUR = 0.18; // Soco segue o gesto: mais leve e legível que antes (era 0.12)
      [['L', leftArm], ['R', rightArm]].forEach(([sideKey, arm]) => {
        let eTarget = arm.ikElbow.clone();
        let wTarget = arm.ikWrist.clone();
        
        if (arm.animState >= 1 && arm.animState <= 3) { // Socando
          arm.animTimer += dtSec;
          if (arm.animTimer >= PUNCH_DUR) {
            arm.animState = 0; // Volta pra idle
            arm.hasHit = false;
          } else {
            // Curva de animação (0 a 1 e de volta a 0)
            const t = arm.animTimer / PUNCH_DUR;
            const punchPos = Math.sin(t * Math.PI); 
            
            eTarget.lerp(arm.punchTargetElbow, punchPos);
            wTarget.lerp(arm.punchTargetWrist, punchPos);
          }
        }
        
        applyArm(arm, arm.shoulderPos, eTarget, wTarget);
        updateFingers(arm, handBySide[sideKey]);
      });

      // Braços ficam retos/na vertical: compensa o roll da cabeça
      leftArm.group.rotation.z = -camera.rotation.z;
      rightArm.group.rotation.z = -camera.rotation.z;

      const timeSec = now / 1000;

      // Animação de partículas de impacto
      for (let i = hitParticles.length - 1; i >= 0; i--) {
        const p = hitParticles[i];
        p.life -= dtSec * 2.0;
        if (p.life <= 0) {
          scene.remove(p);
          hitParticles.splice(i, 1);
        } else {
          p.position.addScaledVector(p.velocity, dtSec);
          p.scale.setScalar(p.life);
        }
      }

      // --- FÍSICA E COMBATE ---
      scene.updateMatrixWorld();

      // Ataque do jogador
      if (isGameStarted && isFightActive && !isMatchOver && !isRoundTransition && opponentHealth > 0) {
        const hits = [['L', leftArm], ['R', rightArm]];
        for (const [side, arm] of hits) {
          const fist = arm.fist;
          if (!fist) continue;
          if (arm.hasHit) continue;
          if (now - lastArmHitTime[side] < 280) continue;

          const wp = fist.getWorldPosition(new THREE.Vector3());
          let vel = 0;
          let prev = fistPrev[side];
          let dir = new THREE.Vector3(0, 0, -1);
          
          if (prev) {
            vel = wp.distanceTo(prev) / dtSec;
            if (vel > 0.1) dir.subVectors(wp, prev).normalize();
          }
          fistPrev[side] = wp.clone();
          if (vel < PUNCH_SPEED) continue;
          
          // Estende o alcance do soco visualmente (facilita acertar quando chega perto)
          const PUNCH_EXTENSION = 0.6; 
          const effectiveWp = wp.clone().addScaledVector(dir, PUNCH_EXTENSION);

          let hitDetected = false;
          let hitPart = null;
          let hitPoint = null;

          // Verifica múltiplos pontos entre a posição anterior e o ponto estendido para evitar tunneling
          const steps = prev ? 6 : 1;
          for (let step = 1; step <= steps; step++) {
            const testPoint = prev ? prev.clone().lerp(effectiveWp, step / steps) : effectiveWp;
            let stepBestDist = Infinity;
            let stepHitPart = null;
            
            for (const part of opponent.parts) {
              if (part.userData.finishAt) continue;
              // Verifica se há colisão, o método hitBox agora retorna a distância (ou Infinity)
              const dist = hitBox(part, testPoint, HIT_TOL); // tolerância maior => socos conectam de verdade
              if (dist < stepBestDist) {
                stepBestDist = dist;
                stepHitPart = part;
              }
            }
            
            if (stepHitPart) {
              hitDetected = true;
              hitPart = stepHitPart;
              hitPoint = testPoint.clone();
              break;
            }
          }

          if (hitDetected) {
            arm.hasHit = true;
            lastArmHitTime[side] = now;
            const part = hitPart;
            flashPart(part);
            
            // Dano baseado na parte do corpo (reduzido para lutas mais longas)
            let damage = 2; // Dano padrão
            const pType = part.userData.partType;
            if (pType === 'cabeca') damage = 15;
            else if (pType === 'tronco') damage = 8;
            else if (pType === 'braco') damage = 2;
            else if (pType === 'perna') damage = 2;

            damage = Math.floor(damage * (0.8 + Math.random() * 0.4)); // Variabilidade

            showDamage(damage, hitPoint, pType === 'cabeca');

            // Telemetria da luta
            matchStats.punchesLanded++;
            matchStats.damageDealt += damage;
            if (pType === 'cabeca') matchStats.headshots++;
            if (matchStats.punchesThrown < matchStats.punchesLanded) {
              matchStats.punchesThrown = matchStats.punchesLanded;
            }

            // Confirmação visual: Tremer câmera ligeiramente (hit shake) e Hitstop
            playerCameraShake = pType === 'cabeca' ? 0.35 : 0.2; 
            hitstopEndTime = now + (pType === 'cabeca' ? 90 : 45); // hitstop mais longo para headshots
            
            // Confirmação visual: Spawna partículas de impacto no local
            for (let i = 0; i < 15; i++) {
              const pMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
              const pGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
              const p = new THREE.Mesh(pGeo, pMat);
              p.position.copy(hitPoint);
              p.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6 + 2,
                (Math.random() - 0.5) * 6
              );
              p.life = 1.0;
              scene.add(p);
              hitParticles.push(p);
            }
              
            
if(window.matchRoom && window.remoteOpponentData) {
       window.matchRoom.send('hit_landed', { targetId: window.remoteOpponentId, damage: damage }); // We need the session id of the opponent. Oh wait! targetId
    } else {
       opponentHealth -= damage;
    }

    opponentImpactTarget = -0.6; // Inicia animação de impacto (tranco pra trás)
            
            if (opponentHealth <= 0 && !isMatchOver) {
              opponentHealth = 0;
              opponentImpactTarget = -1.5; // Cai pra trás mais forte
              isMatchOver = true;
              isFightActive = false;
              updateMatchUI();
              showCenterMessage("NOCAUTE! Você Venceu!", 2500);
              
              setTimeout(() => {
                showPostMatchScreen('player', 'KO');
              }, 1800);
            }
            updateHealthUI();
            break;
          }
        }
      } else {
        fistPrev['L'] = null;
        fistPrev['R'] = null;
      }

      // Recuperação visual do oponente e cores
      for (const part of opponent.parts) {
        const ud = part.userData;
        if (ud.finishAt && performance.now() >= ud.finishAt) {
          part.material.color.set(ud.origColor);
          part.material.emissive.set(ud.origEmissive);
          ud.finishAt = 0;
        }
      }

      // Animação de impacto do oponente
      opponent.rotation.x += (opponentImpactTarget - opponent.rotation.x) * 12 * dtSec;
      if (opponentHealth > 0) {
         opponentImpactTarget += (0 - opponentImpactTarget) * 6 * dtSec; // volta ao normal
      }

      // Animação de ataque do oponente (variada: jab, direto, cruzado, gancho)
      let opponentBaseZ = -1.55;
      if (oppState.phase !== 'idle') oppState.t += dtSec;

      if (oppState.phase !== 'idle' && oppState.attack) {
        const atk = OPP_ATTACKS[oppState.attack];
        if (oppState.phase === 'windup' && oppState.t >= atk.windup) oppState.phase = 'thrust';
        if (oppState.phase === 'thrust' && oppState.t >= atk.windup + atk.thrust) oppState.phase = 'recover';
        if (oppState.phase === 'recover' && oppState.t >= atk.windup + atk.thrust + atk.recover) {
          oppState.phase = 'idle';
          oppState.attack = null;
          oppState.nextAt = now + (1400 + Math.random() * 2200);
        }
      }

      if (oppState.phase !== 'idle' && oppState.attack) {
        const atk = OPP_ATTACKS[oppState.attack];
        const phase = oppState.phase;
        const pt = phase === 'thrust' ? oppState.t - atk.windup
          : (phase === 'recover' ? oppState.t - atk.windup - atk.thrust : oppState.t);
        const frame = computeOppFrame(oppState.attack, phase, pt);
        poseOppArm(frame.leadRig, frame.leadE, frame.leadW);
        const rearRig = frame.leadRig === opponent.armL ? opponent.armR : opponent.armL;
        poseOppArm(rearRig, frame.rearE, frame.rearW);
        opponentBaseZ = -1.55 + frame.lunge;
        opponent.rotation.y = frame.yaw;

        if (phase === 'thrust' && !oppState.dealt && !window.matchRoom && !oppState.visualOnly && oppState.t >= atk.hitAt) {
          oppState.dealt = true;
          const leadPt = frame.leadW.clone().applyMatrix4(opponent.matrixWorld);
          dealOpponentDamage(atk, leadPt);
        }
      } else {
        poseOppArm(opponent.armL, opponent.armL.guardElbow, opponent.armL.guardWrist);
        poseOppArm(opponent.armR, opponent.armR.guardElbow, opponent.armR.guardWrist);
        opponent.rotation.y += (0 - opponent.rotation.y) * 8 * dtSec;
      }

      // Move o oponente para a posição base no Z (incluindo o dash do soco);
      // no PvP a posição vem sincronizada do servidor.
      if (!window.matchRoom) {
        if (opponentHealth > 0) {
          opponent.position.z += (opponentBaseZ - opponent.position.z) * 10 * dtSec;
        } else {
          opponent.position.z += (-3.0 - opponent.position.z) * 2 * dtSec; // vai para trás no nocaute
        }
      }

      // IA do adversário (modo treino): escolhe o próximo golpe com tempo variado
      if (!window.matchRoom && isGameStarted && isFightActive && !isMatchOver && opponentHealth > 0 && oppState.phase === 'idle' && now >= oppState.nextAt) {
        const pick = Math.random();
        const key = pick < 0.35 ? 'jab' : (pick < 0.6 ? 'cross' : (pick < 0.8 ? 'hook' : 'uppercut'));
        startOpponentAttack(key);
      }

      // Animação de Câmera (Camera Shake do Player recebendo dano)
      if (playerCameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * playerCameraShake;
        camera.position.y += (Math.random() - 0.5) * playerCameraShake;
        playerCameraShake -= dtSec * 0.8;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Remove from here because we will move it before animate

    const videoElement = document.getElementById('webcam');
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4
    });
    pose.onResults(onPoseResults);

    let hands = null;
    if (window.Hands) {
      try {
        hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        });
        hands.onResults(onHandsResults);
      } catch (e) {
        console.error('Erro ao iniciar Hands:', e);
        hands = null;
      }
    }

    let isProcessing = false;
    let currentStream = null;
    let activeDeviceId = null;
    const cameraSelect = document.getElementById('camera-select');

    async function startCamera(deviceId) {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
      }
      const videoConstraints = deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' };
      videoConstraints.width = { ideal: 640 };
      videoConstraints.height = { ideal: 480 };
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
        activeDeviceId = deviceId;
        videoElement.srcObject = currentStream;
        await videoElement.play();
        drawPreviewFrame();
      } catch (e) {
        console.error('Erro ao acessar a câmera:', e);
        currentStream = null;
      }
    }

    async function populateCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      cameraSelect.innerHTML = '';
      if (cams.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Nenhuma câmera';
        cameraSelect.appendChild(opt);
        return;
      }
      cams.forEach((cam, i) => {
        const opt = document.createElement('option');
        opt.value = cam.deviceId;
        opt.textContent = cam.label || `Câmera ${i + 1}`;
        cameraSelect.appendChild(opt);
      });
      const activeTrack = currentStream ? currentStream.getVideoTracks()[0] : null;
      const activeCamId = activeTrack ? activeTrack.getSettings().deviceId : activeDeviceId;
      if (cams.some(c => c.deviceId === activeCamId)) {
        cameraSelect.value = activeCamId;
      } else if (cameraSelect.options.length > 0) {
        cameraSelect.value = cameraSelect.options[0].value;
      }
    }

    cameraSelect.addEventListener('change', () => {
      startCamera(cameraSelect.value);
    });

    function drawPreviewFrame() {
      if (videoElement.readyState < 2) return;
      camCtx.save();
      camCtx.clearRect(0, 0, camCanvas.width, camCanvas.height);
      camCtx.translate(camCanvas.width, 0);
      camCtx.scale(-1, 1);
      camCtx.drawImage(videoElement, 0, 0, camCanvas.width, camCanvas.height);
      camCtx.restore();
    }

    async function cameraLoop() {
      requestAnimationFrame(cameraLoop);
      drawPreviewFrame();
      if (videoElement.readyState >= 2 && !isProcessing) {
        isProcessing = true;
        try {
          await pose.send({ image: videoElement });
        } catch (err) {
          console.error('Erro no processamento:', err);
        } finally {
          isProcessing = false;
        }
      }
    }

    (async () => {
      try {
        await startCamera(null);
      } catch (e) {
        console.error('Erro ao acessar a câmera:', e);
      }
      try {
        await populateCameras();
      } catch (e) {
        console.error('Erro ao listar câmeras:', e);
      }
      requestAnimationFrame(cameraLoop);
    })();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      updateFovDerived();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });