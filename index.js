const api = require('./api');
const prompt = require('prompt')
const { t1 } = require('@mtproto/core')


async function getUser() {
  try {
    const user = await api.call("users.getFullUser", {
      id: {
        _: "inputUserSelf",
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

function signIn({ code, phone, phone_code_hash }) {
  return api
    .call("auth.signIn", {
      phone_code: code,
      phone_number: phone,
      phone_code_hash: phone_code_hash,
    })
    .then((v) => {
      console.log("LOGIN SUCCESS: ", v);
    })
    .catch((e) => console.log("LOGIN FAIL: ", e));
}

function sendCode(phone) {
  return api.call("auth.sendCode", {
    phone_number: phone,
    settings: {
      _: "codeSettings",
    },
  });
}

(async () => {
  const user = await getUser();

  // const phone = "+9XXXXXXXXXX";

  if (!user) {
    const { phone } = await prompt.get("phone");
    const { phone_code_hash } = await sendCode(phone);

    const { code } = await prompt.get("code");
    try {
      const signInResult = await signIn({
        code,
        phone,
        phone_code_hash,
      });

      if (signInResult._ === "auth.authorizationSignUpRequired") {
        await signUp({
          phone,
          phone_code_hash,
        });
      }
    } catch (error) {
      if (error.error_message !== "SESSION_PASSWORD_NEEDED") {
        console.log(`error:`, error);

        return;
      }

      // 2FA

    }
     

  
  }

 

  const resolvedPeer = await api.call('contacts.resolveUsername', {
    username: 'magiccraftgamechat',
  });
  console.log(resolvedPeer)

  const channel = resolvedPeer.chats.find(
    (chat) => chat.id === resolvedPeer.peer.channel_id
  );

  const inputPeer = {
    _: 'inputPeerChannel',
    channel_id: channel.id,
    access_hash: channel.access_hash,
  };

  const LIMIT_COUNT = 10;
  const allMessages = [];

  const firstHistoryResult = await api.call('messages.getHistory', {
    peer: inputPeer,
    limit: LIMIT_COUNT,
  });
  const historyCount = firstHistoryResult.count;

  for (let offset = 0; offset < historyCount; offset += LIMIT_COUNT) {
    const history = await api.call('messages.getHistory', {
      peer: inputPeer,
      add_offset: offset,
      limit: LIMIT_COUNT,
    });

    allMessages.push(...history.messages);
  }

  console.log('allMessages:', allMessages);
})();

