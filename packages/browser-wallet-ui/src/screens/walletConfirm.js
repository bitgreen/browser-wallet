import Screen, { goBackScreen, goToScreen } from './index.js'
import { shuffleArray } from '@bitgreen/browser-wallet-utils'

import anime from 'animejs';
import Sortable from 'sortablejs';

let mnemonic_array = []
let shuffled_mnemonic_array = []
let user_mnemonic_array = [];
let user_mnemonic_sortable = [];

export default async function walletConfirmScreen(params) {
  const screen = new Screen({
    template_name: 'layouts/full_page',
    template_params: {
      title: 'Create Wallet',
      equal_padding: ''
    },
    login: false,
    header: false
  })
  await screen.init()

  await screen.set('.content', 'wallet/confirm')

  if(params.mnemonic) {
    mnemonic_array = params.mnemonic
    shuffled_mnemonic_array = shuffleArray(params.mnemonic);
    let index = 0
    for(const value of shuffled_mnemonic_array) {
      await screen.append('#shuffled_mnemonics', 'wallet/partial/word-no-index', {
        value, index: index++
      })
    }
  }

  const user_mnemonics_el = document.querySelector("#user_mnemonics");
  user_mnemonic_sortable = Sortable.create(user_mnemonics_el, {
    dataIdAttr: 'data-id',
    easing: "cubic-bezier(1, 0, 0, 1)",
    animation: 150,
    invertSwap: true,
    emptyInsertThreshold: 100,
    onUpdate: function(evt) {
      refreshUserMnemonics()
      checkWords()
    },
    onChoose: function(evt) {
      evt.item.classList.add('selected')
      document.querySelector("#user_mnemonics").classList.add('dragging')
    },
    onUnchoose: function(evt) {
      evt.item.classList.remove('selected')
      document.querySelector("#user_mnemonics").classList.remove('dragging')
    }
  });

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

  anime({
    targets: '#shuffled_mnemonics',
    opacity: [0, 1],
    duration: 0
  });

  screen.setListeners([
    {
      element: '.heading #go_back',
      listener: () => goBackScreen()
    },
    {
      element: '#shuffled_mnemonics',
      listener: addWord
    },
    {
      element: '#user_mnemonics',
      listener: removeWord
    },
    {
      element: '#continue_new_key',
      listener: () => goToScreen('walletPasswordScreen', params)
    }
  ])
}

function addWord(e) {
  let word_el = e.target
  let index = word_el.dataset.index
  let word = shuffled_mnemonic_array[index];

  if(!word) {
    return false;
  }

  shuffled_mnemonic_array.splice(shuffled_mnemonic_array.indexOf(shuffled_mnemonic_array[index]), 1)

  refreshUserMnemonics(word)

  checkWords()
}

function removeWord(e) {
  let word_el = e.target
  let index = word_el.dataset.index
  let word = user_mnemonic_array[index];

  if(!word) {
    return false;
  }

  shuffled_mnemonic_array.push(word)

  refreshUserMnemonics(index, 'remove');

  checkWords()
}

function refreshUserMnemonics(word = null, action = 'add') {
  user_mnemonic_array = user_mnemonic_sortable.toArray()

  if(word && action === 'add') {
    user_mnemonic_array.push(word)
  } else if(word && action === 'remove') {
    user_mnemonic_array.splice(user_mnemonic_array.indexOf(user_mnemonic_array[word]), 1)
  }

  let user_mnemonics = '';
  user_mnemonic_array.forEach(function(val, index) {
    user_mnemonics = user_mnemonics + '<div class="word col-3 d-inline-block" data-id="' + val + '"><div class="badge bg-secondary"><span class="index">' + (index + 1) + '</span><span class="text col">' + val + '</span><span class="remove d-flex align-items-center" data-index="' + index + '"><span class="icon-close"></span></span></div></div>';
  })

  let shuffled_mnemonics = '';
  shuffled_mnemonic_array.forEach(function(val, index) {
    shuffled_mnemonics = shuffled_mnemonics + '<div class="word col-3 d-inline-block" data-index="' + index + '"><div class="badge bg-secondary"><span class="text col">' + val + '</span></div></div>';
  })

  if(user_mnemonic_array.length > 0) {
    document.querySelector("#user_mnemonics").classList.remove('hidden')
  } else {
    document.querySelector("#user_mnemonics").classList.add('hidden')
  }

  document.querySelector("#user_mnemonics").innerHTML = user_mnemonics;
  document.querySelector("#shuffled_mnemonics").innerHTML = shuffled_mnemonics;
}

function checkWords() {
  if(JSON.stringify(user_mnemonic_array) === JSON.stringify(mnemonic_array)) {
    document.querySelector("#continue_new_key").classList.remove('disabled')
    document.querySelector("#continue_new_key").classList.add('btn-primary')
  } else {
    document.querySelector("#continue_new_key").classList.add('disabled')
    document.querySelector("#continue_new_key").classList.remove('btn-primary')
  }
}