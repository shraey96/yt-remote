import React from "react"

function Settings({ videoInfo, sendMessage }) {
  return (
    <div className="settings-container">
      <div className="setting-item">
        <p>Skip Ads</p>
        <input
          type="checkbox"
          id="switch"
          checked={videoInfo.skipAdEnabled}
          onChange={() =>
            sendMessage({ type: "setAdSkip", skip: !videoInfo.skipAdEnabled })
          }
        />
        <label for="switch" className="toggleLabel"></label>
      </div>
    </div>
  )
}

export default Settings
