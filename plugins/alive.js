
const axios = require('axios');
const fs = require('fs').promises;
const { translate } = require('@vitalets/google-translate-api');
const defaultLang = 'en';


const translateText = async (text,la) => {
  const options = {
    method: 'POST',
    url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
    headers: {
      'x-rapidapi-key': 'a5978505c1msh5e4b99533ab74e0p1fc9e3jsn9f9bf372956e', // Replace with your own API key
      'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: {
      q: text,
      source: 'auto',
      target: la,
    },
  };

  try {
    //{ data: { translations: { translatedText: 'hi' } } }
    const response = await axios.request(options);
    const translatedText = response.data.data.translations.translatedText
    return translatedText
    //return 'hi';
  } catch (error) {
    console.error(error);
    return 0;
  }
};


async function helder(c, m, { jid, uid, group, formMe, text }) {
  let data = {};
  try {
    const jsonString = await fs.readFile('./data.json', 'utf8');
    data = JSON.parse(jsonString);


    const name = m.pushName.split(" ")[0] || 'dear'
    let t2 = text;
    if(m.message?.extendedTextMessage?.text){
      t2=m.message.extendedTextMessage.text
    }
    const updateData = { message: t2, timestamp: jid };
    global.send(updateData);



    if(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage){
      id = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
      if(id=='si' || id=='en' ){
        data[uid]['lan'] = id;
      }else{
        data[uid]['ai'] = id;
      }
      
      const reactionMessage = {
        react: {
            text: "✅",
            key: m.key
        }
      }

      c.sendMessage(jid, reactionMessage)
      
      fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
          console.error('Error writing to file', err);
        } else {
          console.log('File has been written');
        }
      });
    }else
    if ((!formMe && !group) || t2.split(" ")[0]=='.ai') {
      if(t2.split(" ")[0]=='.ai'){
        t2 = t2.slice(4);
      }
      if(!data.hasOwnProperty(uid)){
        data[uid] = {};
        data[uid]['lan'] = 'si'
        data[uid]['ai'] = 'aion'
        data[uid]['code'] = 0
        data[uid]['pro'] = 0
        data[uid]['free'] = 1
        fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
          if (err) {
            console.error('Error: first user login file save', err);
          } else {
            console.log('first user login done!');
          }
        });
      }
      if(data[uid].ai == 'aion' || t2.split(" ")[0]=='.ai'){


      try {
        let t3 = t2;
        c.sendPresenceUpdate('composing',jid)
        if(data[uid]['lan'] == 'si'){
          console.log('using sinhala')
          t3 = await translateText(t2,'en');
        }
        c.sendPresenceUpdate('composing',jid)
        const response = await axios.get('https://gpt4.guruapi.tech/user?username=GURU_BOT_'+data[uid]['code']+uid.split("@")[0]+'&query=My name is '+name+', '+t3);
        console.log('gpt done');
        c.sendPresenceUpdate('composing',jid)
        let result = response.data.result;
        if (result.includes("Sorry,")) {
          c.sendPresenceUpdate('composing',jid)
          //result = "අද දවස තුළ ඔබ සමග සිංහල භාෂාව භාවිතා කිරිමෙන් කතා කිරිම මා නවතා දමා ඇත. ඔබට නැවත හෙට දින භාෂාව සිංහල ලෙස වෙනස් කර සිංහලෙන් සෙවාව ගැනිම හෝ ගෙවිමක් සිදුකර අඛණ්ඩ සෙවයක් ගත හැක."
          result = "කරුණාකර නැවත උත්සහ කරන්න"

          data[uid]['code'] = data[uid]['code'] + 1
          fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
            if (err) {
              console.error('Error: first user login file save', err);
            } else {
              console.log('first user login done!');
            }
          });
          c.sendButton(jid, '\n> '+result, '\n- Your id has changed🔄\n- new id: '+data[uid]['code']+uid.split("@")[0]+'\n- '+formattedTime, null, []);
          return;

        }
        if(data[uid]['lan'] == 'si'){
          result = await translateText(response.data.result,'si');
        }
        

        const now = new Date();
        const options = {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit'
        };
        const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);
        c.sendButton(jid, '\n> '+result.replace(/:\)/g, '☺'), '\n- '+formattedTime, null, [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
              title: 'Powered by Thilina 🤖',
              sections : [
      {
          title: 'හෙයී '+name+',',
          rows: []
      },{
        title: 'භාෂාව වෙනස් කරන්න (Change the language)',
        rows: [
          { title: '🇱🇰 සිංහල',id:'si',description: 'භාෂාව ලෙස සිංහල භාවිතා කිරිම'},
          { title: '🇺🇸 Engish',id:'en',description: 'Using English as the language'}
      ]
    },{
        title: '\n',
        rows: []
    },
      {
          title: 'AI Chat ක්‍රියාකාරිත්වය වෙනස් කල හැක.🔰',
          rows: [
              { title: '✅ON',id:'aion',description: '🤖AI Chat සක්‍රිය කිරිම හෝ සක්‍රිය තත්වයෙ පවත්වා ගැනිම'},
              { title: '❌OFF',id:'aioff',description: '🤖AI Chat අක්‍රිය කිරිම'}
          ]
      },
      {
        title: formattedTime,
        rows: []
    }
  ]
          })
                
      }]);
        console.log('send done');
        c.sendPresenceUpdate('unavailable',jid)
        
        
      } catch (error) {
        console.error('Error fetching URL:', error);
      }}
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

module.exports = helder;

// Example users for the helder function
helder.user = ['120363300638311505@g.us', '94740945396@s.whatsapp.net'];
