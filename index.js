const api = require('./api');
const prompt = require('prompt');
const { t1 } = require('@mtproto/core');
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors());

// Alternatively, you can specify options to customize the behavior
const corsOptions = {
  origin: '*', // This will allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};


app.use(cors(corsOptions));

// Fetch user details
async function getUser() {
  try {
    const user = await api.call("users.getFullUser", {
      id: { _: "inputUserSelf" },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// Sign in using phone code
function signIn({ code, phone, phone_code_hash }) {
  return api
    .call("auth.signIn", {
      phone_code: code,
      phone_number: phone,
      phone_code_hash: phone_code_hash,
    })
    .then((v) => {
      console.log("LOGIN SUCCESS: ", v);
      return v;
    })
    .catch((e) => {
      console.log("LOGIN FAIL: ", e);
      throw e;
    });
}

// Send verification code to phone number
function sendCode(phone) {
  return api.call("auth.sendCode", {
    phone_number: phone,
    settings: { _: "codeSettings" },
  });
}

// Helper function to handle flood wait errors
async function callApiWithRetry(method, params) {
  while (true) {
    try {
      return await api.call(method, params);
    } catch (error) {
      if (error.error_message && error.error_message.startsWith('FLOOD_WAIT_')) {
        const waitTime = parseInt(error.error_message.split('_')[2], 10);
        console.log(`Flood wait for ${waitTime} seconds`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      } else {
        throw error;
      }
    }
  }
}

// Helper function to add a delay
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main script execution
app.get('/telegram', 
async (req,res) => {
  const user = await getUser();
  const offset= req.query.offset?req.query.offset: 0
  const limit= req.query.limit?req.query.limit: 0
  if (!user) {
    const { phone } = await prompt.get("phone");
    const { phone_code_hash } = await sendCode(phone);
    const { code } = await prompt.get("code");

    try {
      const signInResult = await signIn({ code, phone, phone_code_hash });

      if (signInResult._ === "auth.authorizationSignUpRequired") {
        await signUp({ phone, phone_code_hash });
      }
    } catch (error) {
      if (error.error_message !== "SESSION_PASSWORD_NEEDED") {
        console.log(`error:`, error);
        return;
      }

      // Handle 2FA here if needed
    }
  }

  // Resolve the channel username
  const resolvedPeer = await callApiWithRetry('contacts.resolveUsername', {
    username: 'JamesCryptoGuruEnglish',
  });

  const channel = resolvedPeer.chats.find(
    (chat) => chat.id === resolvedPeer.peer.channel_id
  );

  const inputPeer = {
    _: 'inputPeerChannel',
    channel_id: channel.id,
    access_hash: channel.access_hash,
  };

  const LIMIT_COUNT = limit;
  const allMessages = [];
  const firstHistoryResult = await callApiWithRetry('messages.getHistory', {
    peer: inputPeer,
    limit: LIMIT_COUNT,
  });

  const historyCount = firstHistoryResult.count;

  // Fetch message history in chunks with delay
  for (let offset = 0; offset < 100; offset += 100) {
    try {
      const history = await callApiWithRetry('messages.getHistory', {
        peer: inputPeer,
        add_offset: offset,
        limit: 100,
      });

      for(let i of history.messages){
        for(let j of history.users){
          if(i.from_id.user_id==j.id){
            allMessages.push({message: i.message,username: j?.username, firstName:  j.first_name, lastName: j.last_name});
          }
        }
      }
      // Add delay between fetches to avoid rate limiting
      await delay(1000); // Delay of 2 seconds (2000 milliseconds)
    } catch (error) {
      console.log('Error fetching message history:', error);
      break; // Exit the loop if there is an error
    }
  }

  res.json(allMessages);
});

app.listen(3010)