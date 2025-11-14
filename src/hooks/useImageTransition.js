import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';

// Configuration object for animation settings
const defaultConfig = {
  clipPathDirection: 'top-bottom',
  autoAdjustHorizontalClipPath: true,
  steps: 6,
  stepDuration: 0.35,
  stepInterval: 0.05,
  moverPauseBeforeExit: 0.14,
  rotationRange: 0,
  wobbleStrength: 0,
  panelRevealEase: 'sine.inOut',
  gridItemEase: 'sine',
  moverEnterEase: 'sine.in',
  moverExitEase: 'sine',
  panelRevealDurationFactor: 2,
  clickedItemDurationFactor: 2,
  gridItemStaggerFactor: 0.3,
  moverBlendMode: false,
  pathMotion: 'linear',
  sineAmplitude: 50,
  sineFrequency: Math.PI,
};

export const useImageTransition = () => {
  const configRef = useRef({ ...defaultConfig });
  const isAnimatingRef = useRef(false);
  const isPanelOpenRef = useRef(false);
  const currentItemRef = useRef(null);

  const lerp = (a, b, t) => a + (b - a) * t;

  const extractItemConfigOverrides = useCallback((element) => {
    const overrides = {};
    const dataset = element.dataset;

    if (dataset.clipPathDirection) overrides.clipPathDirection = dataset.clipPathDirection;
    if (dataset.steps) overrides.steps = parseInt(dataset.steps);
    if (dataset.stepDuration) overrides.stepDuration = parseFloat(dataset.stepDuration);
    if (dataset.stepInterval) overrides.stepInterval = parseFloat(dataset.stepInterval);
    if (dataset.rotationRange) overrides.rotationRange = parseFloat(dataset.rotationRange);
    if (dataset.wobbleStrength) overrides.wobbleStrength = parseFloat(dataset.wobbleStrength);
    if (dataset.moverPauseBeforeExit)
      overrides.moverPauseBeforeExit = parseFloat(dataset.moverPauseBeforeExit);
    if (dataset.panelRevealEase) overrides.panelRevealEase = dataset.panelRevealEase;
    if (dataset.gridItemEase) overrides.gridItemEase = dataset.gridItemEase;
    if (dataset.moverEnterEase) overrides.moverEnterEase = dataset.moverEnterEase;
    if (dataset.moverExitEase) overrides.moverExitEase = dataset.moverExitEase;
    if (dataset.panelRevealDurationFactor)
      overrides.panelRevealDurationFactor = parseFloat(dataset.panelRevealDurationFactor);
    if (dataset.clickedItemDurationFactor)
      overrides.clickedItemDurationFactor = parseFloat(dataset.clickedItemDurationFactor);
    if (dataset.gridItemStaggerFactor)
      overrides.gridItemStaggerFactor = parseFloat(dataset.gridItemStaggerFactor);
    if (dataset.moverBlendMode) overrides.moverBlendMode = dataset.moverBlendMode;
    if (dataset.pathMotion) overrides.pathMotion = dataset.pathMotion;
    if (dataset.sineAmplitude) overrides.sineAmplitude = parseFloat(dataset.sineAmplitude);
    if (dataset.sineFrequency) overrides.sineFrequency = parseFloat(dataset.sineFrequency);

    return overrides;
  }, []);

  const hideFrame = useCallback(() => {
    const frame = document.querySelectorAll('.frame, .heading');
    gsap.to(frame, {
      opacity: 0,
      duration: 0.5,
      ease: 'sine.inOut',
      pointerEvents: 'none',
    });
  }, []);

  const showFrame = useCallback(() => {
    const frame = document.querySelectorAll('.frame, .heading');
    gsap.to(frame, {
      opacity: 1,
      duration: 0.5,
      ease: 'sine.inOut',
      pointerEvents: 'auto',
    });
  }, []);

  const getElementCenter = useCallback((el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const positionPanelBasedOnClick = useCallback((clickedElement, panelElement) => {
    const centerX = getElementCenter(clickedElement).x;
    const windowHalf = window.innerWidth / 2;
    const isLeftSide = centerX < windowHalf;

    if (isLeftSide) {
      panelElement.classList.add('panel--right');
    } else {
      panelElement.classList.remove('panel--right');
    }

    if (configRef.current.autoAdjustHorizontalClipPath) {
      if (
        configRef.current.clipPathDirection === 'left-right' ||
        configRef.current.clipPathDirection === 'right-left'
      ) {
        configRef.current.clipPathDirection = isLeftSide ? 'left-right' : 'right-left';
      }
    }
  }, [getElementCenter]);

  const getClipPathsForDirection = useCallback((direction) => {
    switch (direction) {
      case 'bottom-top':
        return {
          from: 'inset(0% 0% 100% 0%)',
          reveal: 'inset(0% 0% 0% 0%)',
          hide: 'inset(100% 0% 0% 0%)',
        };
      case 'left-right':
        return {
          from: 'inset(0% 100% 0% 0%)',
          reveal: 'inset(0% 0% 0% 0%)',
          hide: 'inset(0% 0% 0% 100%)',
        };
      case 'right-left':
        return {
          from: 'inset(0% 0% 0% 100%)',
          reveal: 'inset(0% 0% 0% 0%)',
          hide: 'inset(0% 100% 0% 0%)',
        };
      case 'top-bottom':
      default:
        return {
          from: 'inset(100% 0% 0% 0%)',
          reveal: 'inset(0% 0% 0% 0%)',
          hide: 'inset(0% 0% 100% 0%)',
        };
    }
  }, []);

  const computeStaggerDelays = useCallback((clickedElement, allElements) => {
    const baseCenter = getElementCenter(clickedElement);
    const distances = Array.from(allElements).map((el) => {
      const center = getElementCenter(el);
      return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
    });
    const max = Math.max(...distances);
    return distances.map((d) => (d / max) * configRef.current.gridItemStaggerFactor);
  }, [getElementCenter]);

  const generateMotionPath = useCallback((startRect, endRect, steps) => {
    const path = [];
    const fullSteps = steps + 2;
    const startCenter = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2,
    };
    const endCenter = {
      x: endRect.left + endRect.width / 2,
      y: endRect.top + endRect.height / 2,
    };

    for (let i = 0; i < fullSteps; i++) {
      const t = i / (fullSteps - 1);
      const width = lerp(startRect.width, endRect.width, t);
      const height = lerp(startRect.height, endRect.height, t);
      const centerX = lerp(startCenter.x, endCenter.x, t);
      const centerY = lerp(startCenter.y, endCenter.y, t);

      const sineOffset =
        configRef.current.pathMotion === 'sine'
          ? Math.sin(t * configRef.current.sineFrequency) * configRef.current.sineAmplitude
          : 0;

      const wobbleX = (Math.random() - 0.5) * configRef.current.wobbleStrength;
      const wobbleY = (Math.random() - 0.5) * configRef.current.wobbleStrength;

      path.push({
        left: centerX - width / 2 + wobbleX,
        top: centerY - height / 2 + sineOffset + wobbleY,
        width,
        height,
      });
    }

    return path.slice(1, -1);
  }, [lerp]);

  const animateGridItems = useCallback((allElements, clickedElement, delays) => {
    const clipPaths = getClipPathsForDirection(configRef.current.clipPathDirection);

    gsap.to(allElements, {
      opacity: 0,
      scale: (i, el) => (el === clickedElement ? 1 : 0.8),
      duration: (i, el) =>
        el === clickedElement
          ? configRef.current.stepDuration * configRef.current.clickedItemDurationFactor
          : 0.3,
      ease: configRef.current.gridItemEase,
      clipPath: (i, el) => (el === clickedElement ? clipPaths.from : 'none'),
      delay: (i) => delays[i],
    });
  }, [getClipPathsForDirection]);

  const createMoverStyle = useCallback((step, index, imgURL) => {
    const clipPaths = getClipPathsForDirection(configRef.current.clipPathDirection);
    const style = {
      backgroundImage: imgURL,
      position: 'fixed',
      left: step.left,
      top: step.top,
      width: step.width,
      height: step.height,
      clipPath: clipPaths.from,
      zIndex: 1000 + index,
      backgroundPosition: '50% 50%',
      rotationZ: gsap.utils.random(
        -configRef.current.rotationRange,
        configRef.current.rotationRange
      ),
    };
    if (configRef.current.moverBlendMode) style.mixBlendMode = configRef.current.moverBlendMode;
    return style;
  }, [getClipPathsForDirection]);

  const scheduleCleanup = useCallback((movers) => {
    const cleanupDelay =
      configRef.current.steps * configRef.current.stepInterval +
      configRef.current.stepDuration * 2 +
      configRef.current.moverPauseBeforeExit;
    gsap.delayedCall(cleanupDelay, () => movers.forEach((m) => m.remove()));
  }, []);

  const revealPanel = useCallback((endImg, panelContent) => {
    const clipPaths = getClipPathsForDirection(configRef.current.clipPathDirection);

    gsap.set(panelContent, { opacity: 0 });

    gsap
      .timeline({
        defaults: {
          duration:
            configRef.current.stepDuration * configRef.current.panelRevealDurationFactor,
          ease: configRef.current.panelRevealEase,
        },
      })
      .fromTo(
        endImg,
        { clipPath: clipPaths.hide },
        {
          clipPath: clipPaths.reveal,
          pointerEvents: 'auto',
          delay: configRef.current.steps * configRef.current.stepInterval,
        }
      )
      .fromTo(
        panelContent,
        { y: 25 },
        {
          duration: 1,
          ease: 'expo',
          opacity: 1,
          y: 0,
          delay: configRef.current.steps * configRef.current.stepInterval,
          onComplete: () => {
            isAnimatingRef.current = false;
            isPanelOpenRef.current = true;
          },
        },
        '<-=.2'
      );
  }, [getClipPathsForDirection]);

  const animateTransition = useCallback((startEl, endEl, imgURL) => {
    hideFrame();

    const path = generateMotionPath(
      startEl.getBoundingClientRect(),
      endEl.getBoundingClientRect(),
      configRef.current.steps
    );

    const fragment = document.createDocumentFragment();
    const clipPaths = getClipPathsForDirection(configRef.current.clipPathDirection);

    path.forEach((step, index) => {
      const mover = document.createElement('div');
      mover.className = 'mover fixed aspect-[var(--aspect)] bg-cover bg-center will-change-[transform,clip-path] pointer-events-none';
      gsap.set(mover, createMoverStyle(step, index, imgURL));
      fragment.appendChild(mover);

      const delay = index * configRef.current.stepInterval;
      gsap
        .timeline({ delay })
        .fromTo(
          mover,
          { opacity: 0.4, clipPath: clipPaths.hide },
          {
            opacity: 1,
            clipPath: clipPaths.reveal,
            duration: configRef.current.stepDuration,
            ease: configRef.current.moverEnterEase,
          }
        )
        .to(
          mover,
          {
            clipPath: clipPaths.from,
            duration: configRef.current.stepDuration,
            ease: configRef.current.moverExitEase,
          },
          `+=${configRef.current.moverPauseBeforeExit}`
        );
    });

    const grid = document.querySelector('.grid');
    grid.parentNode.insertBefore(fragment, grid.nextSibling);

    scheduleCleanup(document.querySelectorAll('.mover'));
    const panelContent = endEl.parentElement.querySelector('.panel-content');
    revealPanel(endEl, panelContent);
  }, [hideFrame, generateMotionPath, getClipPathsForDirection, createMoverStyle, scheduleCleanup, revealPanel]);

  const onGridItemClick = useCallback((clickedElement, allElements, panelElement, panelImg, itemData) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    currentItemRef.current = clickedElement;

    const overrides = extractItemConfigOverrides(clickedElement);
    Object.assign(configRef.current, overrides);

    positionPanelBasedOnClick(clickedElement, panelElement);

    const imgURL = `url(${itemData.image})`;
    
    const delays = computeStaggerDelays(clickedElement, allElements);
    animateGridItems(allElements, clickedElement, delays);

    const startEl = clickedElement.querySelector('.grid-item-image');
    animateTransition(startEl, panelImg, imgURL);

    gsap.set(panelElement, { opacity: 1, pointerEvents: 'auto' });
    
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';
  }, [extractItemConfigOverrides, positionPanelBasedOnClick, computeStaggerDelays, animateGridItems, animateTransition]);

  const resetView = useCallback((panelElement, allElements) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const delays = computeStaggerDelays(currentItemRef.current, allElements);

    gsap
      .timeline({
        defaults: { duration: configRef.current.stepDuration, ease: 'expo' },
        onComplete: () => {
          panelElement.classList.remove('panel--right');
          isAnimatingRef.current = false;
          isPanelOpenRef.current = false;
          // Re-enable body scroll
          document.body.style.overflow = '';
        },
      })
      .to(panelElement, { opacity: 0 })
      .add(showFrame, 0)
      .set(panelElement, { opacity: 0, pointerEvents: 'none' })
      .set(panelElement.querySelector('.panel-img'), {
        clipPath: 'inset(0% 0% 100% 0%)',
      })
      .set(allElements, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
      .to(
        allElements,
        {
          opacity: 1,
          scale: 1,
          delay: (i) => delays[i],
        },
        '>'
      );

    Object.assign(configRef.current, defaultConfig);
  }, [computeStaggerDelays, showFrame]);

  return {
    onGridItemClick,
    resetView,
    isAnimating: () => isAnimatingRef.current,
    isPanelOpen: () => isPanelOpenRef.current,
  };
};
