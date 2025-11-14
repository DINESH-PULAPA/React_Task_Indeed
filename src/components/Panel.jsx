import { forwardRef } from 'react';

const Panel = forwardRef(({ content, onClose }, ref) => {
  return (
    <figure
      ref={ref}
      className="panel"
      role="img"
      aria-labelledby="panel-caption"
    >
      <div
        className="panel-img"
        style={{ backgroundImage: content.image ? `url(${content.image})` : 'none' }}
      ></div>
      <figcaption 
        className="panel-content"
        id="panel-caption"
      >
        <h3 className="m-0 text-base font-medium">{content.title}</h3>
        <p className="m-0 max-w-[150px] text-pretty">{content.description}</p>
        <button
          type="button"
          className="panel-close"
          aria-label="Close preview"
          onClick={onClose}
        >
          Close
        </button>
      </figcaption>
    </figure>
  );
});

Panel.displayName = 'Panel';

export default Panel;
