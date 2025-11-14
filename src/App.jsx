import { useState, useEffect, useRef } from 'react';
import Frame from './components/Frame';
import Heading from './components/Heading';
import Grid from './components/Grid';
import Panel from './components/Panel';
import Footer from './components/Footer';
import { gridSections } from './data/gridData';
import { useImageTransition } from './hooks/useImageTransition';
import { preloadImages } from './utils/preloadImages';
import { initSmoothScrolling } from './utils/smoothScroll';

function App() {
  const [loading, setLoading] = useState(true);
  const [panelContent, setPanelContent] = useState({
    image: '',
    title: 'murmur—207',
    description: 'Beneath the soft static of this lies a fragmented recollection of motion—faded pulses echoing through time-warped layers of light and silence. A stillness wrapped in artifact.',
  });

  const panelRef = useRef(null);
  const sectionRefs = useRef({});
  const { onGridItemClick, resetView, isPanelOpen } = useImageTransition();

  useEffect(() => {
    // Initialize smooth scrolling
    initSmoothScrolling();

    // Preload images
    preloadImages('.grid-item-image, .panel-img').then(() => {
      document.body.classList.remove('loading');
      setLoading(false);
    });

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isPanelOpen()) {
        handleClosePanel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen]);

  const handleItemClick = (item, sectionIndex, itemIndex) => {
    setPanelContent({
      image: item.image,
      title: item.title,
      description: item.model,
    });

    const sectionItemRefs = sectionRefs.current[sectionIndex];
    const clickedElement = sectionItemRefs[itemIndex];
    
    // Collect all grid items from all sections
    const allElements = Object.values(sectionRefs.current).flatMap(refs => Object.values(refs).filter(Boolean));
    
    const panelElement = panelRef.current;
    const panelImg = panelElement.querySelector('.panel-img');

    onGridItemClick(clickedElement, allElements, panelElement, panelImg, item);
  };

  const handleClosePanel = () => {
    const panelElement = panelRef.current;
    const allElements = Object.values(sectionRefs.current).flatMap(refs => Object.values(refs).filter(Boolean));
    resetView(panelElement, allElements);
  };

  return (
    <main className="p-page">
      <Frame />
      {gridSections.map((section, sectionIndex) => {
        if (!sectionRefs.current[sectionIndex]) {
          sectionRefs.current[sectionIndex] = {};
        }
        
        return (
          <div key={sectionIndex}>
            <Heading title={section.heading.title} meta={section.heading.meta} />
            <Grid
              items={section.items}
              onItemClick={(item, itemIndex) => handleItemClick(item, sectionIndex, itemIndex)}
              itemRefs={sectionRefs.current[sectionIndex]}
            />
          </div>
        );
      })}
      <Panel ref={panelRef} content={panelContent} onClose={handleClosePanel} />
      <Footer />
    </main>
  );
}

export default App;

