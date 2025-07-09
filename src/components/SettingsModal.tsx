import React, { useState, useEffect } from 'react';
import { isEnabled, enable, disable } from '@tauri-apps/plugin-autostart';
import { X, Settings as SettingsIcon } from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const checkAutostart = async () => {
        try {
          const enabled = await isEnabled();
          setAutostartEnabled(enabled);
        } catch (error) {
          console.error('Failed to check autostart status:', error);
        } finally {
          setIsLoading(false);
        }
      };
      checkAutostart();
    }
  }, [isOpen]);

  const handleToggleAutostart = async () => {
    setIsLoading(true);
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
      } else {
        await enable();
        setAutostartEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle autostart:', error);
      // Revert state on error
      setAutostartEnabled(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <SettingsIcon size={20} className="header-icon" />
          <h2>Settings</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <div className={`setting-item ${isLoading ? 'loading' : ''}`}>
            <div className="setting-text">
              <h3>Launch on system startup</h3>
              <p>Automatically open VidGo when you log in.</p>
            </div>
            <div className="toggle-switch-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autostartEnabled}
                  onChange={handleToggleAutostart}
                  disabled={isLoading}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 