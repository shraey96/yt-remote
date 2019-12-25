console.log("~~~~ bg script ~~~~~")
chrome.tabs.onUpdated.addListener(() => getYoutubeTabs())

chrome.tabs.onCreated.addListener(() => getYoutubeTabs())

function getYoutubeTabs() {
  chrome.tabs.query({}, tabs => {
    const YOUTUBE_URL_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
    const youtubeTabsList = tabs.filter(t => YOUTUBE_URL_REGEX.test(t.url))

    // youtubeTabsList.map(t => {
    //   return chrome.tabs.executeScript(
    //     t.id,
    //     { file: "/contentScript.js" },
    //     () => {
    //       console.log("@@@")
    //     }
    //   )
    // })

    if (youtubeTabsList.some(t => t.audible)) {
      chrome.browserAction.setIcon({ path: "/icons-main/logo_48_c.png" })
    } else {
      chrome.browserAction.setIcon({ path: "/icons-main/logo_48.png" })
    }
  })
}
