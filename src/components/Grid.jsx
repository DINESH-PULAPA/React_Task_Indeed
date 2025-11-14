import GridItem from './GridItem';

const Grid = ({ items, onItemClick, itemRefs }) => {
  return (
    <div className="grid">
      {items.map((item, index) => (
        <GridItem
          key={item.id}
          ref={(el) => (itemRefs[index] = el)}
          item={item}
          onClick={() => onItemClick(item, index)}
        />
      ))}
    </div>
  );
};

export default Grid;
