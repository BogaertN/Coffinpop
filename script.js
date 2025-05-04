<script type="text/plain" id="script.js">
const loopLength = 2000; // 2-second musical loop
const band = [];
const taskText = document.getElementById("taskText");
const scoreDisplay = document.getElementById("score");
const comboDisplay = document.getElementById("combo");
const rhythmBar = document.getElementById("rhythm-indicator");
const stage = document.querySelectorAll(".coffin-creature");
let score = 0;
let combo = 1;
let gameActive = true;

const state = {
  taskCounts: JSON.parse(localStorage.getItem('taskCounts') || '{}'),
  unlocked: JSON.parse(localStorage.getItem('unlockedGhosts') || '["ghostA","ghostB"]'),
  powerUps: JSON.parse(localStorage.getItem('powerUps') || '{"doubleScore":0,"autoTap":0}'),
};

const unlockTasks = {
  ghostC: 5,
  ghostD: 10,
  ghostE: 15
};

const rhythmPatterns = {
  ghostA: [500, 1500], // Tap at 0.5s and 1.5s in 2s loop
  ghostB: [1000],      // Tap at 1s
  ghostC: [250, 1250],
  ghostD: [750, 1750],
  ghostE: [500, 1000, 1500]
};

const powerUpCosts = {
  doubleScore: 50,
  autoTap: 100
};

// Initialize power-up buttons
const updatePowerUps = () => {
  document.getElementById("double-score").textContent = `Double Score (${state.powerUps.doubleScore})`;
  document.getElementById("double-score").disabled = state.powerUps.doubleScore === 0;
  document.getElementById("auto-tap").textContent = `Auto Tap (${state.powerUps.autoTap})`;
  document.getElementById("auto-tap").disabled = state.powerUps.autoTap === 0;
};

// Handle coffin taps
stage.forEach(btn => {
  const id = btn.dataset.id;
  if (!state.unlocked.includes(id)) {
    btn.classList.add('locked');
  }

  btn.addEventListener("click", () => {
    if (!gameActive || btn.classList.contains('locked')) return;

    const soundId = btn.dataset.sound;
    const audio = document.getElementById(soundId);
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    audio.currentTime = 0;
    audio.play();

    // Check rhythm accuracy
    const currentTime = performance.now() % loopLength;
    const pattern = rhythmPatterns[soundId];
    let hit = false;
    pattern.forEach(time => {
      if (Math.abs(currentTime - time) < 100) { // 100ms hit window
        hit = true;
      }
    });

    if (hit) {
      score += 10 * combo;
      combo = Math.min(combo + 0.1, 5); // Max combo x5
      scoreDisplay.textContent = `Score: ${score}`;
      comboDisplay.textContent = `Combo: x${combo.toFixed(1)}`;
      document.getElementById("success").play();
      // Award power-up points
      if (score >= powerUpCosts.doubleScore && Math.random() < 0.1) {
        state.powerUps.doubleScore++;
        updatePowerUps();
      }
      if (score >= powerUpCosts.autoTap && Math.random() < 0.05) {
        state.powerUps.autoTap++;
        updatePowerUps();
      }
    } else {
      combo = 1;
      comboDisplay.textContent = `Combo: x1`;
      document.getElementById("fail").play();
    }

    // Band and unlock logic
    if (!band.includes(soundId)) {
      band.push(soundId);
      const member = document.createElement('span');
      member.classList.add('band-member');
      member.textContent = btn.textContent;
      document.getElementById('band-loop').appendChild(member);
    }

    if (unlockTasks[id]) {
      state.taskCounts[id] = (state.taskCounts[id] || 0) + 1;
      const needed = unlockTasks[id];
      taskText.textContent = `${id} needs ${needed - state.taskCounts[id]} more taps to rise.`;

      if (state.taskCounts[id] >= needed) {
        delete unlockTasks[id];
        state.unlocked.push(id);
        localStorage.setItem('unlockedGhosts', JSON.stringify(state.unlocked));
        btn.classList.remove('locked');
        taskText.textContent = `${id} is now free to jam!`;
      }

      localStorage.setItem('taskCounts', JSON.stringify(state.taskCounts));
    }

    localStorage.setItem('powerUps', JSON.stringify(state.powerUps));
  });
});

// Rhythm indicator animation
const animateRhythm = () => {
  if (!gameActive) return;
  const time = performance.now() % loopLength;
  const pos = (time / loopLength) * 100;
  rhythmBar.style.left = `${pos}%`;
  requestAnimationFrame(animateRhythm);
};
animateRhythm();

// Main loop for band playback
setInterval(() => {
  if (!gameActive) return;
  band.forEach(id => {
    const audio = document.getElementById(id);
    audio.currentTime = 0;
    audio.play();
  });
}, loopLength);

// Power-up handlers
document.getElementById("double-score").addEventListener("click", () => {
  if (state.powerUps.doubleScore > 0) {
    state.powerUps.doubleScore--;
    score *= 2;
    scoreDisplay.textContent = `Score: ${score}`;
    localStorage.setItem('powerUps', JSON.stringify(state.powerUps));
    updatePowerUps();
  }
});

document.getElementById("auto-tap").addEventListener("click", () => {
  if (state.powerUps.autoTap > 0) {
    state.powerUps.autoTap--;
    gameActive = false;
    let autoTaps = 10;
    const interval = setInterval(() => {
      if (autoTaps <= 0) {
        clearInterval(interval);
        gameActive = true;
        return;
      }
      const unlockedCreatures = Array.from(stage).filter(c => !c.classList.contains('locked'));
      const randomCreature = unlockedCreatures[Math.floor(Math.random() * unlockedCreatures.length)];
      randomCreature.click();
      autoTaps--;
    }, 200);
    localStorage.setItem('powerUps', JSON.stringify(state.powerUps));
    updatePowerUps();
  }
});

// Initialize
updatePowerUps();
</script>

