{Previous file content with the following changes in the top-right actions area:}

```tsx
<div className="absolute top-2 right-2 flex items-center space-x-2">
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
    vm.status === 'running' ? 'bg-emerald-500/20 text-emerald-300' :
    vm.status === 'stopped' ? 'bg-red-500/20 text-red-300' :
    vm.status === 'hibernated' ? 'bg-purple-500/20 text-purple-300' :
    'bg-amber-500/20 text-amber-300'
  }`}>
    {vm.status}
  </span>
  <button
    onClick={handleHibernate}
    disabled={isHibernating || vm.status === 'hibernated'}
    className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    title="Hibernate VM"
  >
    {isHibernating ? (
      <Loader className="h-4 w-4 animate-spin text-purple-400" />
    ) : (
      <Moon className="h-4 w-4 text-purple-400" />
    )}
  </button>
  <button
    onClick={() => setIsEditModalOpen(true)}
    className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
    title="Edit VM"
  >
    <Pencil className="h-4 w-4 text-primary-400" />
  </button>
  <button
    onClick={() => setIsDeleteModalOpen(true)}
    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
    title="Delete VM"
  >
    <Trash2 className="h-4 w-4 text-red-400" />
  </button>
</div>
```