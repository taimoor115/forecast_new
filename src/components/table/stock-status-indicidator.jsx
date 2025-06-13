const StockStatusIndicator = ({ status }) => {
    const colors = {
      good: "bg-green-500",
      warning: "bg-yellow-500",
      critical: "bg-red-500",
    }
  
    return (
      <div className="w-full h-1">
        <div className={`h-full ${colors[status] || colors.good}`}></div>
      </div>
    )
  }
  
  export default StockStatusIndicator
  