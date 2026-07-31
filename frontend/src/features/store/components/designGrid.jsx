import DesignCard from "./designCard";

const DesignGrid = ({ designs, isLoading, emptyMessage = "Nothing here yet." }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!designs || designs.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {designs.map((design) => (
        <DesignCard key={design._id} design={design} />
      ))}
    </div>
  );
};

export default DesignGrid;