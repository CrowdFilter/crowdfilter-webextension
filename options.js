function saveOptions(e) {
  browser.storage.local.set({
    useTor: document.querySelector("#useTor").checked
  });
  restoreOptions();
  e.preventDefault();
}

function restoreOptions() {
  document.querySelector("label#useTor").innerText = browser.i18n.getMessage("useTorLabel");
  var storageItem = browser.storage.local.get('useTor');
  storageItem.then((res) => {
    let output = document.querySelector("#use-tor");
    let cl = output.classList;

    if (res.useTor) {
      output.innerText = browser.i18n.getMessage("useTorPos");
      cl.add("pos");
      if (cl.contains("neg")) {
        cl.remove("neg");
      }
    } else {
      output.innerText = browser.i18n.getMessage("useTorNeg");
      cl.add("neg");
      if (cl.contains("pos")) {
        cl.remove("pos");
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
