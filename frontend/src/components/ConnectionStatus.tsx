'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRefresh?: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  onRefresh,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Conectado
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Desconectado
            </span>
          </>
        )}
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Atualizar</span>
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
