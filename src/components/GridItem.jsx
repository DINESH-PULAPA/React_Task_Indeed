import { forwardRef } from 'react';

const GridItem = forwardRef(({ item, onClick }, ref) => {
  return (
    <figure
      ref={ref}
      className="grid-item"
      role="img"
      aria-labelledby={`caption${item.id}`}
      onClick={onClick}
      data-steps={item.config?.steps}
      data-rotation-range={item.config?.rotationRange}
      data-step-interval={item.config?.stepInterval}
      data-mover-pause-before-exit={item.config?.moverPauseBeforeExit}
      data-mover-enter-ease={item.config?.moverEnterEase}
      data-mover-exit-ease={item.config?.moverExitEase}
      data-panel-reveal-ease={item.config?.panelRevealEase}
      data-clip-path-direction={item.config?.clipPathDirection}
      data-step-duration={item.config?.stepDuration}
      data-panel-reveal-duration-factor={item.config?.panelRevealDurationFactor}
      data-mover-blend-mode={item.config?.moverBlendMode}
      data-path-motion={item.config?.pathMotion}
      data-sine-amplitude={item.config?.sineAmplitude}
      data-sine-frequency={item.config?.sineFrequency}
      data-wobble-strength={item.config?.wobbleStrength}
      data-clicked-item-duration-factor={item.config?.clickedItemDurationFactor}
      data-grid-item-stagger-factor={item.config?.gridItemStaggerFactor}
    >
      <div
        className="grid-item-image"
        style={{ backgroundImage: `url(${item.image})` }}
      ></div>
      <figcaption className="grid-item-caption" id={`caption${item.id}`}>
        <h3>{item.title}</h3>
        <p>{item.model}</p>
      </figcaption>
    </figure>
  );
});

GridItem.displayName = 'GridItem';

export default GridItem;
