// src/game/SlotAnimationManager.js
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class SlotAnimationManager {
  constructor(reels, config) {
    this.reels = reels;
    this.config = config;
    this.isSpinning = false;
  }

  startSpin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Ticks positions and blur dynamically
    this.tickerFn = () => {
      this.reels.forEach(reel => reel.updatePositions());
    };
    PIXI.Ticker.shared.add(this.tickerFn);

    // Phase 1 & 2: Anticipation pull-up into infinite free run
    this.reels.forEach((reel) => {
      reel.spinTween = gsap.to(reel, {
        position: reel.position - 0.4,
        duration: 0.15,
        ease: 'power2.out',
        onComplete: () => {
          reel.spinTween = gsap.to(reel, {
            position: reel.position + 1000,
            duration: 50,
            ease: 'linear',
          });
        },
      });
    });
  }

  async stopSpin(serverStopMatrix, isTeaseEligible = false) {
    const landingPromises = this.reels.map((reel, colIndex) => {
      return new Promise((resolve) => {
        if (reel.spinTween) reel.spinTween.kill();

        let delay = colIndex * (this.config.turbo ? 0.04 : 0.18);
        if (colIndex >= 2 && isTeaseEligible) {
          delay += 1.2;
        }

        gsap.delayedCall(delay, () => {
          const stops = serverStopMatrix[colIndex];
          stops.forEach((symKey, rowIdx) => {
            reel.symbols[rowIdx + 1].texture = reel.textures[symKey];
          });

          const nextIntPosition = Math.ceil(reel.position) + 8;

          // Phase 4: Hard Snap Landing
          gsap.to(reel, {
            position: nextIntPosition,
            duration: this.config.turbo ? 0.2 : 0.48,
            ease: 'back.out(1.4)',
            onComplete: () => {
              reel.blurFilter.blurY = 0;
              this.triggerImpactShake(reel);
              resolve();
            },
          });
        });
      });
    });

    await Promise.all(landingPromises);
    PIXI.Ticker.shared.remove(this.tickerFn);
    this.isSpinning = false;
  }

  triggerImpactShake(reel) {
    gsap.fromTo(
      reel.container,
      { y: 4 },
      { y: 0, duration: 0.15, ease: 'elastic.out(1, 0.3)' }
    );
  }
}
