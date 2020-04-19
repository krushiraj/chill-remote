chrome.runtime.onMessage.addListener(({ action, selector }) => {
  console.log({ action, selector });
  if (action === 'click') {
    document.querySelector(selector).click();
  }
});
console.log('Listener added');
