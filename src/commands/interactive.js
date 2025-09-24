const InteractiveMode = require('../interactive');

async function interactive() {
  const interactiveMode = new InteractiveMode();
  await interactiveMode.start();
}

module.exports = interactive;