// script.js – COFFINPOP logic

const loopLength = 2000; // 2-second musical loop
const band = [];
const taskText = document.getElementById("taskText");
const taskCounts = JSON.parse(localStorage.getItem('taskCounts') || '{}');
const unlocked = JSON.parse(localStorage.getItem('unlockedGhosts') || '["ghostA","ghostB"]');
const stage = document.querySelectorAll(".coffin-creature");

const unlockTasks = {
  ghostC: 5,
  ghostD: 10,
  ghostE: 15
};

stage.forEach(btn => {
  const id = btn.dataset.id;
  if (!unlocked.includes(id)) {
    btn.classList.add('locked');
  }

  btn.addEventListener("click", () => {
    const soundId = btn.dataset.sound;
    const audio = document.getElementById(soundId);
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    audio.currentTime = 0;
    audio.play();

    if (!band.includes(soundId)) {
      band.push(soundId);
      const member = document.createElement('span');
      member.classList.add('band-member');
      member.textContent = btn.textContent;
      document.getElementById('band-loop').appendChild(member);
    }

    if (unlockTasks[id]) {
      taskCounts[id] = (taskCounts[id] || 0) + 1;
      const needed = unlockTasks[id];
      taskText.textContent = `${id} needs ${needed - taskCounts[id]} more taps to rise.`;

      if (taskCounts[id] >= needed) {
        delete unlockTasks[id];
        unlocked.push(id);
        localStorage.setItem('unlockedGhosts', JSON.stringify(unlocked));
        btn.classList.remove('locked');
        taskText.textContent = `${id} is now free to jam!`;
      }

      localStorage.setItem('taskCounts', JSON.stringify(taskCounts));
    }
  });
});

setInterval(() => {
  band.forEach(id => {
    const audio = document.getElementById(id);
    audio.currentTime = 0;
    audio.play();
  });
}, loopLength);
