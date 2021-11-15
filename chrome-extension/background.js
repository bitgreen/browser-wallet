
let keyspair='';
let mnemonic='';
// add listeners for events
document.addEventListener('DOMContentLoaded', function() {
    // network selection
    document.getElementById("network").addEventListener("click", change_network);
    // set new/import keys screen
    let n='<br><center><H3>New to Bitgreen?</h3><br>';
    n=n+'<div class="row">';
    n=n+'<div class="col">Create new keys';
    n=n+'</div>';
    n=n+'<div class="col">Or import keys';
    n=n+'</div>';
    n=n+'</div>';
    n=n+'<div class="row">';
    n=n+'<div class="col">';
    n=n+'<button type="button" class="btn btn-primary" id="newkeys">New Keys</button>';
    n=n+'</div>';
    n=n+'<div class="col">';
    n=n+'<button type="button" class="btn btn-primary" id="importkeys">Import Keys</button>'
    n=n+'</div>';
    n=n+'</div>';
    n=n+'</center>';
    document.getElementById("root").innerHTML = n;
    document.getElementById("newkeys").addEventListener("click", newkeys);
    document.getElementById("importkeys").addEventListener("click", importkeys);
  
  });
  function change_network() {
    alert("changed network")
  }
  function newkeys(obj,error) {
    let k= new keyring.Keyring({ type: 'sr25519' });
    if (typeof error == 'undefined'){
        // generate mnemonic 24 words as key
        mnemonic=util_crypto.mnemonicGenerate(24);
        keyspair = k.addFromUri(mnemonic, { name: '' }, 'sr25519');
    }
    // show the mnemonic seed and ask for password to secure them
    let n="<br><h3>Create New Keys</H3>"
    n=n+'<p>Please store carefully the secret words below in a safe place.</p>';
    n=n+'<p>They can be used to recover your keys in a different device and  should not be shared with untrusted parties.</p><p>Anyone having the secret words, can transfer your funds!</p>';
    n=n+'<p> Secret Words:</p>'
    n=n+'<div class="shadow-lg p-3 mb-5 bg-body rounded"><b>'+mnemonic+'</b></div>'
    n=n+'<p>Insert a STRONG password to encrypt the secret words on the local disk. A minimum of 12 characters should be used.</p>'
    n=n+'<div class="mb-3 row">';
    n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Password</label>';
    n=n+'<div class="col-sm-10">';
    n=n+'<input type="password" class="form-control" id="inputPassword">';
    n=n+'</div>';
    n=n+'</div>';
    if (typeof error !== 'undefined') {
        n=n+'<div class="alert alert-danger" role="alert">';
        n=n+error;
        n=n+'</div>';
    }
    n=n+'<div class="mb-3 row">';
    n=n+'<label for="inputPassword" class="col-sm-2 col-form-label">Repeat Password</label>';
    n=n+'<div class="col-sm-10">';
    n=n+'<input type="password" class="form-control" id="inputPassword2">';
    n=n+'</div>';
    n=n+'</div>';
    n=n+'<div class="row"> <div class="col"><button type="button" class="btn btn-primary" id="storekeys">Submit</button></div>';
    n=n+'<div class="col"><button type="button" class="btn btn-secondary" id="storekeys">Back</button></div>';
    n=n+'</div>';
    document.getElementById("root").innerHTML = n;
    document.getElementById("storekeys").addEventListener("click", storekeys);
  }
  function importkeys() {
    alert("Import keys")
  }
  // function to encrypt and store the secret words
  function storekeys(){
      // check for password fields
      const pwd=document.getElementById('inputPassword').value;
      const pwd2=document.getElementById('inputPassword2').value;
      if(pwd!=pwd2){
          newkeys("","Password fields are not matching!");
          return;
      }
      // derive the password used for encryption with an init vector (random string) and 10000 hashes with 3 different algorithms
      let randomstring = ' ';
      const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for ( let i = 0; i < 32; i++ ) {
        randomstring += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      let h=util_crypto.keccakAsU8a(pwd+randomstring);
      for (let i = 0; i < 100000; i++) {
        h=util_crypto.keccakAsU8a(h);
        h=util_crypto.sha512AsU8a(h);
        h=util_crypto.blake2AsU8a(h);
      }
      // encrypt the secret words
      const secretwordsPreEncryption = util.stringToU8a(mnemonic);
      const { encrypted, nonce } = util_crypto.naclEncrypt(secretwordsPreEncryption, h);
      //convert to Hex json
      let value='{"iv":"'+util.u8aToHex(randomstring)+'","nonce":"'+util.u8aToHex(nonce)+'","encrypted":"'+util.u8aToHex(encrypted)+'"}'
      chrome.storage.local.set({'webwallet': value}, function() {
        console.log('Webwallet Data has been saved in encrypted structure');
        alert("Done");
      });
    

  }

