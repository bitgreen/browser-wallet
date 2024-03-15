import Screen, { goBackScreen, goToScreen, updateCurrentParams } from './index.js'
import { createMnemonicSortable, isIOs } from '@bitgreen/browser-wallet-utils';
import { mnemonicValidate } from "@polkadot/util-crypto";
import anime from 'animejs';
import DOMPurify from 'dompurify';

let import_mnemonic_array = [];
let import_mnemonic_sortable = [];

export default async function walletImportScreen(params = {}) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Import Wallet'
    },
    login: false,
    header: false
  })
  await screen.init()

  await screen.set('.content', 'wallet/import')

  await screen.moveFooterOnTop()

  import_mnemonic_array = []
  if(params.mnemonic) {
    importWord(false, params.mnemonic.join(' '))
  }

  import_mnemonic_sortable = createMnemonicSortable('#import_mnemonics', (evt) => {
    refreshImportedMnemonics();
    checkMnemonics()
  }, removeWord);

  await refreshImportedMnemonics()
  checkMnemonics()

  anime({
    targets: '#shuffled_mnemonics .word',
    translateX: [-20, 0],
    opacity: [0, 1],
    easing: 'easeInOutSine',
    duration: 150,
    delay: function(el, i) {
      return i*50
    },
  });

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#import_word',
      listener: importWord
    },
    {
      element: '#import_mnemonics',
      listener: removeWord
    },
    {
      element: '#keyword',
      type: 'keypress',
      listener: (e) => {
        if(e.key === "Enter") {
          importWord(false)
        }
      }
    },
    {
      element: '#continue_new_key',
      listener: () => {
        updateCurrentParams({
          mnemonic: import_mnemonic_array
        })
        goToScreen('walletPasswordScreen', {
          mnemonic: import_mnemonic_array,
          imported: true
        })
      }
    }
  ])
}

function importWord(e, input = false) {
  if(!input) {
    input = DOMPurify.sanitize(document.querySelector("#keyword").value);
  }
  document.querySelector("#keyword").value = ''

  if(!input) {
    return false;
  }

  for(const value of input.split(',')) {
    const index = input.indexOf(value);
    for(const word of value.split(' ')) {
      const index = input.indexOf(value);
      if(word) {
        // max 24 words
        if(import_mnemonic_array.length >= 24) {
          return false;
        }
        // maximum word length is 8
        refreshImportedMnemonics(word.trim().toLowerCase().substring(0, 8));
      }
      refreshImportedMnemonics()
    }
  }

  checkMnemonics()
}

function removeWord(e) {
  let word_el = e.target
  let index = word_el.dataset.index
  let word = import_mnemonic_array[index];

  if(!word) {
    return false;
  }

  refreshImportedMnemonics(index, 'remove');

  checkMnemonics()
}

function refreshImportedMnemonics(word = null, action = 'add') {
  import_mnemonic_array = import_mnemonic_sortable.toArray()

  if(word && action === 'add') {
    import_mnemonic_array.push(word)
  } else if(word && action === 'remove') {
    import_mnemonic_array.splice(import_mnemonic_array.indexOf(import_mnemonic_array[word]), 1)
  }

  let import_mnemonics = '';
  import_mnemonic_array.forEach(function(val, index) {
    import_mnemonics = import_mnemonics + '<div class="word col-3 d-inline-block" data-id="'+val+'"><div class="badge bg-secondary"><span class="index">'+(index+1)+'</span><span class="text col">'+val+'</span><span class="remove d-flex align-items-center" data-index="'+index+'"><span class="icon-close"></span></span></div></div>';
  })

  if(import_mnemonic_array.length > 0) {
    document.querySelector("#mnemonics_info").classList.remove('hidden')
    document.querySelector("#import_mnemonics").classList.remove('hidden')
  } else {
    document.querySelector("#mnemonics_info").classList.add('hidden')
    document.querySelector("#import_mnemonics").classList.add('hidden')
  }

  document.querySelector("#import_mnemonics").innerHTML = import_mnemonics;
}

function checkMnemonics() {
  let m = ''
  import_mnemonic_array.forEach(function(word, index) {
    m = m + ' ' + word.trim();
  });
  m = m.trim()

  const isValidMnemonic = mnemonicValidate(m);

  if(!isValidMnemonic) {
    document.querySelector("#continue_new_key").classList.add('disabled')
    document.querySelector("#continue_new_key").classList.remove('btn-primary')
  } else {
    document.querySelector("#continue_new_key").classList.remove('disabled')
    document.querySelector("#continue_new_key").classList.add('btn-primary')
  }
}