{/* Previous imports remain the same */}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  {/* Previous state and functions remain the same until the return statement */}

  return (
    <>
      <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group">
        {/* Previous content remains the same until the buttons section */}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                       bg-dark-300/50 hover:bg-dark-300
                       border border-primary-500/20 hover:border-primary-500/40
                       text-primary-400 hover:text-primary-300
                       transition-all duration-300"
            >
              <Settings className="h-4 w-4 inline-block mr-2" />
              Convert Catalogue
            </button>

            <div className="relative group/preview">
              <button 
                onMouseEnter={() => setShowPreviewDetails(true)}
                onMouseLeave={() => setShowPreviewDetails(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                         bg-gradient-to-r from-primary-500 to-secondary-500
                         hover:from-primary-400 hover:to-secondary-400
                         transform hover:scale-105 transition-all duration-300
                         text-white shadow-lg shadow-primary-500/20"
              >
                {user?.result?.role === 'user' ? 'Buy Lab' : 'Preview'}
              </button>
              
              {showPreviewDetails && instanceDetails && user?.result?.role !== 'user' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                              min-w-[16rem] max-w-xs w-max
                              bg-dark-200/95 backdrop-blur-sm border border-primary-500/20 
                              rounded-lg p-3 shadow-lg text-sm z-50">
                  <div className="text-gray-300 font-medium mb-2">Instance Details</div>
                  <div className="space-y-1.5 text-gray-400">
                    <div className="flex justify-between gap-4">
                      <span>Instance:</span>
                      <span className="text-primary-400 text-right">{lab.provider === 'aws' ? instanceDetails.instancename : instanceDetails.instance}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Provider:</span>
                      <span className="text-primary-400 text-right">{lab.provider}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>CPU:</span>
                      <span className="text-primary-400 text-right">{instanceDetails.vcpu} Cores</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>RAM:</span>
                      <span className="text-primary-400 text-right">{instanceDetails.memory} GB</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Storage:</span>
                      <span className="text-primary-400 text-right">{instanceDetails.storage}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>OS:</span>
                      <span className="text-primary-400 text-right">{lab.os}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2
                                w-3 h-3 bg-dark-200/95 border-r border-b border-primary-500/20
                                rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                       bg-accent-500/20 hover:bg-accent-500/30
                       border border-accent-500/20 hover:border-accent-500/40
                       text-accent-300 hover:text-accent-200
                       transition-all duration-300"
            >
              <Play className="h-4 w-4 inline-block mr-2" />
              Run
            </button>

            <button
              onClick={handleGoldenImage}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                       bg-secondary-500/20 hover:bg-secondary-500/30
                       border border-secondary-500/20 hover:border-secondary-500/40
                       text-secondary-300 hover:text-secondary-200
                       transition-all duration-300"
            >
              <Image className="h-4 w-4 inline-block mr-2" />
              VM-GoldenImage
            </button>
          </div>
        </div>
      </div>

      <ConfigurationModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        lab={lab}
        instanceCost={instanceCost}
        storageCost={storageCost}
      />
    </>
  );
};