class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.symbols = []; // active symbols on grid
    this.highlighted = new Set(); // slots being paid
  }

  // Update grid state from game logic
  setGrid(slots) {
    this.symbols = slots;
  }

  highlightWinners(slotIndices) {
    this.highlighted = new Set(slotIndices);
  }

  clearHighlights() {
    this.highlighted.clear();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw orbit rings
    Orbits.ORBITS.forEach(orbit => {
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, orbit.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.08 + orbit.multiplier * 0.02})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw the Core
    this.drawCore();

    // Draw symbols
    this.symbols.forEach((slot, idx) => {
      this.drawSymbol(slot, idx);
    });
  }

  drawCore() {
    const ctx = this.ctx;
    const charge = Game.state.coreCharge / 100;
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.05;

    // Outer glow
    const grad = ctx.createRadialGradient(
      this.cx, this.cy, 5,
      this.cx, this.cy, 80 * pulse
    );
    grad.addColorStop(0, `rgba(236, 72, 153, ${0.4 + charge * 0.6})`);
    grad.addColorStop(0.5, `rgba(168, 85, 247, ${0.2 + charge * 0.4})`);
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 80 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core center
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + charge * 0.4})`;
    ctx.shadowBlur = 30 + charge * 30;
    ctx.shadowColor = '#ec4899';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawSymbol(slot, idx) {
    const ctx = this.ctx;
    const orbit = Orbits.ORBITS[slot.orbit];
    const pos = Orbits.getOrbitPositions(slot.orbit, this.cx, this.cy)[slot.position];
    if (!pos) return;

    const sym = Paytable.SYMBOLS[slot.symbol];
    const isHighlighted = this.highlighted.has(idx);
    const size = 18 + orbit.multiplier * 2;

    // Highlight glow
    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, 0.4)`;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Symbol glyph
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = sym.color;
    ctx.shadowBlur = isHighlighted ? 20 : 8;
    ctx.shadowColor = sym.color;
    ctx.fillText(sym.emoji, pos.x, pos.y);
    ctx.shadowBlur = 0;
  }
}

window.GridRenderer = GridRenderer;