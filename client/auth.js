import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// SUBSTITUA AQUI: Configurações do seu Firebase (Pegue isso no Console do Firebase > Settings)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYN1x186e5PJthURxFx3RrP0_K7YQB29U",
  authDomain: "virtual-boxing-game.firebaseapp.com",
  projectId: "virtual-boxing-game",
  storageBucket: "virtual-boxing-game.firebasestorage.app",
  messagingSenderId: "591044651754",
  appId: "1:591044651754:web:477abfe227afb4a6670593",
  measurementId: "G-X5TW9YGYP9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseAuth = auth;
window.firestoreDb = db;
window.playerProfile = null;
let currentUnsubscribe = null;

// Elementos da UI
const loginModal = document.getElementById('login-modal');
const startScreen = document.getElementById('start-screen');
const btnLogin = document.getElementById('btn-google-login');
const profileAvatar = document.querySelector('.fn-avatar');
const profileLvl = document.querySelector('.fn-profile-lvl');
const coinVal = document.querySelector('.fn-coin-val');
const btnLogout = document.getElementById('btn-logout');

// Elementos extras para atualizar Nome e Foto
const playerNameElements = document.querySelectorAll('.fn-player-name');
const centerAvatarChar = document.querySelector('.fn-avatar-character');

// Listener de Autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("[🔥] Logado com sucesso como:", user.displayName);
    if (loginModal) loginModal.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    // Atualiza nome na UI do Lobby
    playerNameElements.forEach(el => {
      el.innerText = user.displayName || "Lutador";
    });

    // URL da foto (com fallback para um ícone genérico caso o usuário não tenha foto)
    const avatarUrl = user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(user.displayName || 'Player');

    // Atualiza fotinha mantendo a bolinha verde
    if (profileAvatar) {
      profileAvatar.innerHTML = `<span class="fn-online-dot"></span><img src="${avatarUrl}" alt="avatar" referrerpolicy="no-referrer" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    // Atualiza a foto do personagem no centro do ringue do lobby
    if (centerAvatarChar) {
      centerAvatarChar.innerHTML = `<img src="${avatarUrl}" alt="avatar" referrerpolicy="no-referrer" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    
    // Perfil base local imediato — o jogo funciona mesmo se o Firestore negar acesso
    window.playerProfile = {
      uid: user.uid,
      displayName: user.displayName || "Lutador",
      photoURL: user.photoURL || "",
      coins: 0,
      wins: 0,
      losses: 0,
      kos: 0,
      totalFights: 0,
      level: 1,
      trophies: 0,
      localOnly: true
    };
    if (typeof window.syncPlayerCareerFromProfile === 'function') {
      window.syncPlayerCareerFromProfile(window.playerProfile);
    }

    const userRef = doc(db, "users", user.uid);

    // Carrega ou Cria Documento do Jogador. Se as regras de segurança do Firestore
    // negarem o acesso (FirebaseError: Missing or insufficient permissions), o jogo
    // continua em modo local sem quebrar a UI.
    try {
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Jogador novo! Inicialização limpa com estatísticas zeradas
        await setDoc(userRef, {
          displayName: user.displayName || "Lutador",
          photoURL: user.photoURL || "",
          coins: 0,
          wins: 0,
          losses: 0,
          kos: 0,
          totalFights: 0,
          level: 1,
          trophies: 0,
          createdAt: new Date().toISOString()
        });
      } else {
        // Limpeza de contas novas que foram criadas com moedas de teste (100) sem nenhuma luta
        const existingData = userSnap.data();
        if ((existingData.totalFights === 0 || (!existingData.wins && !existingData.losses)) && existingData.coins === 100 && !existingData.updatedAt) {
          await updateDoc(userRef, { coins: 0 });
        }
      }
    } catch (err) {
      console.warn('[!] Firestore indisponível (permissões negadas?). Progresso salvará apenas localmente por enquanto.', err && err.message ? err.message : err);
      if (coinVal) coinVal.innerText = formatNumber(0);
      if (profileLvl) profileLvl.innerText = 'LVL 1';
    }

    // Ouvir alterações em tempo real (Firestore -> UI & Game)
    if (currentUnsubscribe) currentUnsubscribe();
    try {
      currentUnsubscribe = onSnapshot(userRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        window.playerProfile = {
          uid: user.uid,
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
          ...data,
          localOnly: false
        };

        // Atualizar UI Cabeçalho com dados salvos
        if (coinVal) coinVal.innerText = formatNumber(data.coins ?? 0);
        if (profileLvl) profileLvl.innerText = `LVL ${data.level ?? 1}`;

        // Notifica game.js para sincronizar stats de carreira exclusivamente a partir do banco
        if (typeof window.syncPlayerCareerFromProfile === 'function') {
          window.syncPlayerCareerFromProfile(window.playerProfile);
        }
      }, (err) => {
        console.warn('[!] Sem acesso em tempo real ao Firestore (modo local).', err && err.message ? err.message : err);
      });
    } catch (err) {
      console.warn('[!] Sem acesso em tempo real ao Firestore (modo local).', err && err.message ? err.message : err);
    }

  } else {
    // Deslogado
    console.log("Não Logado");
    window.playerProfile = null;
    if (currentUnsubscribe) currentUnsubscribe();
    if (typeof window.resetPlayerCareer === 'function') {
      window.resetPlayerCareer();
    }
    if (loginModal) loginModal.style.display = 'flex';
    if (startScreen) startScreen.style.display = 'none';
  }
});

// Atualizar Carreira no Firestore
window.updatePlayerCareerInFirestore = async function(stats) {
  if (!auth.currentUser || !window.playerProfile) {
    console.log('[ℹ️] Jogador offline/convidado, alterações salvas apenas localmente.');
    return;
  }
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      ...stats,
      updatedAt: new Date().toISOString()
    });
    console.log('[🔥] Estatísticas atualizadas no Firestore com sucesso!');
  } catch (err) {
    console.error('[!] Erro ao salvar dados no Firestore:', err);
  }
};

// Buscar Ranking Global (Leaderboard Top Players)
window.fetchLeaderboard = async function(limitCount = 10) {
  try {
    const q = query(
      collection(db, "users"), 
      orderBy("trophies", "desc"), 
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const players = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      players.push({
        id: docSnap.id,
        displayName: d.displayName || "Lutador Anônimo",
        photoURL: d.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(d.displayName || 'Player'),
        trophies: d.trophies ?? 0,
        wins: d.wins ?? 0,
        losses: d.losses ?? 0,
        level: d.level ?? 1
      });
    });
    return players;
  } catch (err) {
    console.warn('[!] Erro ao consultar leaderboard do Firestore:', err);
    return [];
  }
};

// Ação dos Botões
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch(err) {
      console.error("Erro no Login", err);
      alert("Erro ao fazer login com Google. Você também pode clicar em 'JOGAR COMO CONVIDADO'.");
    }
  });
}

const btnGuest = document.getElementById('btn-guest-login');
if (btnGuest) {
  btnGuest.addEventListener('click', () => {
    console.log("Entrando como Convidado");
    window.playerProfile = {
      uid: 'guest_' + Math.random().toString(36).substr(2, 6),
      displayName: 'Lutador Convidado',
      coins: 0,
      level: 1,
      trophies: 0,
      wins: 0,
      losses: 0,
      kos: 0,
      totalFights: 0
    };
    if (loginModal) loginModal.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    playerNameElements.forEach(el => el.innerText = 'Lutador Convidado');
    if (typeof window.syncPlayerCareerFromProfile === 'function') {
      window.syncPlayerCareerFromProfile(window.playerProfile);
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    window.playerProfile = null;
    auth.signOut().catch(() => {});
    if (typeof window.resetPlayerCareer === 'function') {
      window.resetPlayerCareer();
    }
    if (loginModal) loginModal.style.display = 'flex';
    if (startScreen) startScreen.style.display = 'none';
  });
}

function formatNumber(num) {
  return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

