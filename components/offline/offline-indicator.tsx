"use client"

import { useOffline } from '@/hooks/use-offline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  CloudOff,
  AlertTriangle,
  CheckCircle,
  Upload
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const { status, forceSync } = useOffline()
  
  if (!status.isSupported) {
    return null
  }

  const hasUnsyncedData = status.queueSize > 0 || status.unsyncedCount > 0

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300",
              status.isOnline 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-orange-50 text-orange-700 border border-orange-200 animate-pulse"
            )}>
              {status.isOnline ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Offline</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>Network: {status.isOnline ? 'Connected' : 'Disconnected'}</p>
              {!status.isOnline && (
                <p className="text-orange-500">Sales will be queued and synced when online</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Sync Status */}
        {hasUnsyncedData && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => forceSync()}
                  disabled={!status.isOnline || status.isSyncing}
                  className={cn(
                    "gap-1.5 h-8",
                    status.isSyncing && "animate-pulse"
                  )}
                >
                  {status.isSyncing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span className="text-xs">Sync</span>
                    </>
                  )}
                </Button>
                
                {/* Unsynced count badge */}
                {(status.queueSize > 0 || status.unsyncedCount > 0) && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 px-1.5 text-[10px]"
                  >
                    {status.queueSize + status.unsyncedCount}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                {status.queueSize > 0 && (
                  <p>{status.queueSize} requests in queue</p>
                )}
                {status.unsyncedCount > 0 && (
                  <p>{status.unsyncedCount} unsynced transactions</p>
                )}
                {status.lastSync && (
                  <p>Last sync: {new Date(status.lastSync).toLocaleTimeString()}</p>
                )}
                {!status.isOnline && (
                  <p className="text-orange-500">Will sync when connection restored</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Cloud Status Indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {status.isOnline && !hasUnsyncedData ? (
                <Cloud className="h-4 w-4 text-green-600" />
              ) : status.isOnline && hasUnsyncedData ? (
                <CloudOff className="h-4 w-4 text-orange-600" />
              ) : (
                <CloudOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {status.isOnline && !hasUnsyncedData 
                ? "All data synced to cloud" 
                : status.isOnline && hasUnsyncedData
                ? "Pending sync to cloud"
                : "Cloud sync unavailable"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

// Detailed offline status component for settings/dashboard
export function OfflineStatusCard() {
  const { status, forceSync, clearOfflineData } = useOffline()

  if (!status.isSupported) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Offline mode is not supported in this browser</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Offline Mode Status</h3>
        
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Connection</span>
            <Badge variant={status.isOnline ? "success" : "warning"}>
              {status.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Queue Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Queued Requests</span>
            <span className="font-medium">{status.queueSize}</span>
          </div>

          {/* Unsynced Transactions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Unsynced Transactions</span>
            <span className="font-medium">{status.unsyncedCount}</span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sync Status</span>
            <span className="text-sm">
              {status.isSyncing ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Syncing...
                </span>
              ) : status.queueSize > 0 || status.unsyncedCount > 0 ? (
                <span className="text-orange-600">Pending</span>
              ) : (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Synced
                </span>
              )}
            </span>
          </div>

          {/* Last Sync Time */}
          {status.lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm">
                {new Date(status.lastSync).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => forceSync()}
            disabled={!status.isOnline || status.isSyncing || 
                     (status.queueSize === 0 && status.unsyncedCount === 0)}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              status.isSyncing && "animate-spin"
            )} />
            Force Sync
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm('Clear all offline data? This will remove all queued transactions.')) {
                clearOfflineData()
              }
            }}
            disabled={status.isSyncing}
          >
            Clear Data
          </Button>
        </div>
      </div>

      {/* Offline Mode Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Offline Mode Features</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Continue processing sales without internet</li>
          <li>• Automatic sync when connection restored</li>
          <li>• Local storage of transactions and data</li>
          <li>• Progressive retry for failed syncs</li>
        </ul>
      </div>
    </div>
  )
}