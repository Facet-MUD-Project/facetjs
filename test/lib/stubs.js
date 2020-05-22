class FakePlayer {
  async sendData() {}
  async disconnect() {}
  get inputBuffer() { return []; }
  flushOutput() {}
}

module.exports = FakePlayer;
