const StatusIndicator = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "critical":
          return "bg-red-500";
        case "warning":
          return "bg-yellow-500";
        case "good":
          return "bg-green-500";
        default:
          return "bg-gray-200";
      }
    };
  
    return (
      <div className="absolute top-0 left-0 w-full h-1">
        <div
          className={`h-full ${getStatusColor(status)}`}
          style={{ width: "100%" }}
        />
      </div>
    );
  };
  
  export default StatusIndicator;