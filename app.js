const axios = require('axios');

// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const ubi_basic_token = process.env.ubi_basic_token
const token = process.env.token

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);

channel = client.channels.fetch(process.env.channelId)
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const {commandName, options } = interaction;
  
	if (commandName === 'records') {
    level0Token = ''
    level1Token = ''
    level2Token = ''
    
    mapUid = options.getString('map-uid')
    mapName = ''
    thumbnailUrl = ''
    leaderboard = []
    accountIds = []
    users = []

    await Run()

    embed = {
      color: 0x0099FF,
      title: CleanMapName(mapName),
      fields: [],
      timestamp: new Date(),
      thumbnail: {
        url: thumbnailUrl,
      }
    }

    leaderboard.forEach(element => {
      if(element.position != 1){
        embed.fields.push(
          { name: `${element.position}.  ${element.username}`, value: `${ToRaceTime(element.score)}  Diff: +${ToRaceTime(element.scoreDiff)}` }
        )
      } else {
        embed.fields.push(
          { name: `${element.position}.  ${element.username}`, value: ToRaceTime(element.score) }
        )
      }
      
    })

    await interaction.reply({ embeds: [ embed ] });
	}
});

async function L0Token(){
  var config = {
    method: 'post',
    url: 'https://public-ubiservices.ubi.com/v3/profiles/sessions',
    headers: { 
      'Content-Type': 'application/json', 
      'Ubi-AppId': '86263886-327a-4328-ac69-527f0d20a237', 
      'Ubi-RequestedPlatformType': 'uplay', 
      'Authorization': `Basic ${ubi_basic_token}`
    }
  };
  
  const result = await axios(config)
  .then(result => level0Token = result.data.ticket)
  .catch(error => console.log(error));
}

async function L1Token(){
    var config = {
        method: 'post',
        url: 'https://prod.trackmania.core.nadeo.online/v2/authentication/token/ubiservices',
        headers: { 
          'User-Agent': 'ManiaPlanet/3.3.0 (Win64; rv: 2020-07-23_20_22; context: none; distro: UPLAY)', 
          'Pragma': 'no-cache', 
          'Cache-Control': 'no-cache, no-store, must-revalidate', 
          'Accept-Encoding': 'gzip,deflate', 
          'Accept-Language': 'en-US,en', 
          'Nadeo-Game-Build': '2020-07-23_20_22', 
          'Nadeo-Game-Distro': 'UPLAY', 
          'Nadeo-Game-Lang': 'en-US', 
          'Nadeo-Game-Name': 'ManiaPlanet', 
          'Nadeo-Game-Version': '3.3.0', 
          'Authorization': `ubi_v1 t=${level0Token}`
        }
      };
    
      const result = await axios(config)
      .then(result => level1Token = result.data.accessToken)
      .catch(error => console.log(error));
}


async function L2Token(){
var data = JSON.stringify({
    "audience": "NadeoLiveServices"
    })
    
    var config = {
    method: 'post',
    url: 'https://prod.trackmania.core.nadeo.online/v2/authentication/token/nadeoservices',
    headers: { 
        'User-Agent': 'ManiaPlanet/3.3.0 (Win64; rv: 2020-07-23_20_22; context: none; distro: UPLAY)', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache, no-store, must-revalidate', 
        'Accept-Encoding': 'gzip,deflate', 
        'Accept-Language': 'en-US,en', 
        'Nadeo-Game-Build': '2020-07-23_20_22', 
        'Nadeo-Game-Distro': 'UPLAY', 
        'Nadeo-Game-Lang': 'en-US', 
        'Nadeo-Game-Name': 'ManiaPlanet', 
        'Nadeo-Game-Version': '3.3.0', 
        'Authorization': `nadeo_v1 t=${level1Token}`, 
        'Content-Type': 'application/json'
    },
    data: data
    }

    const result = await axios(config)
    .then(result => level2Token = result.data.accessToken)
    .catch(error => console.log(error));
}

async function GetTokens(){
    await L0Token()
    await L1Token()
    await L2Token()
    console.log('Authenticated !');
}

async function GetNameOfMap(){
  
  var config = {
    method: 'get',
    url: `https://prod.trackmania.core.nadeo.online/maps?mapUidList=${mapUid}`,
    headers: { 
      'User-Agent': 'ManiaPlanet/3.3.0 (Win64; rv: 2020-07-23_20_22; context: none; distro: UPLAY)', 
      'Pragma': 'no-cache', 
      'Cache-Control': 'no-cache, no-store, must-revalidate', 
      'Accept-Encoding': 'gzip,deflate', 
      'Accept-Language': 'en-US,en', 
      'Nadeo-Game-Build': '2020-07-23_20_22', 
      'Nadeo-Game-Distro': 'UPLAY', 
      'Nadeo-Game-Lang': 'en-US', 
      'Nadeo-Game-Name': 'ManiaPlanet', 
      'Nadeo-Game-Version': '3.3.0', 
      'Authorization': `nadeo_v1 t=${level1Token}`,
      'Content-Type': 'application/json', 
      'Accept': 'application/json'
    }
  }

  const result = await axios(config)
    .then(result => {
       mapName = result.data[0].name; 
       thumbnailUrl = result.data[0].thumbnailUrl;
      })
    .catch(error => console.log(error));
}

async function GetTopLeaderboardOfMap_Club(){
  var config = {
    method: 'get',
    url: `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${mapUid}/club/28071/top`,
    headers: { 
      'User-Agent': 'ManiaPlanet/3.3.0 (Win64; rv: 2020-07-23_20_22; context: none; distro: UPLAY)', 
      'Pragma': 'no-cache', 
      'Cache-Control': 'no-cache, no-store, must-revalidate', 
      'Accept-Encoding': 'gzip,deflate', 
      'Accept-Language': 'en-US,en', 
      'Nadeo-Game-Build': '2020-07-23_20_22', 
      'Nadeo-Game-Distro': 'UPLAY', 
      'Nadeo-Game-Lang': 'en-US', 
      'Nadeo-Game-Name': 'ManiaPlanet', 
      'Nadeo-Game-Version': '3.3.0', 
      'Authorization': `nadeo_v1 t=${level2Token}`,
      'Content-Type': 'application/json', 
      'Accept': 'application/json'
    }
  }

  const result = await axios(config)
    .then(result => result.data.top.forEach(element => {
      newUserData = {accountId : element.accountId, username : '', position : element.position, score : element.score}
      leaderboard.push(newUserData)
      accountIds.push(element.accountId)
    }))
    .catch(error => console.log(error));

    
}

//Get users info
async function GetUsersInfo(accountIds){
  var accountIdList = accountIds.join('%2c')
  var config = {
    method: 'get',
    url: `https://prod.trackmania.core.nadeo.online/accounts/displayNames/?accountIdList=${accountIdList}`,
    headers: { 
      'User-Agent': 'ManiaPlanet/3.3.0 (Win64; rv: 2020-07-23_20_22; context: none; distro: UPLAY)', 
      'Pragma': 'no-cache', 
      'Cache-Control': 'no-cache, no-store, must-revalidate', 
      'Accept-Encoding': 'gzip,deflate', 
      'Accept-Language': 'en-US,en', 
      'Nadeo-Game-Build': '2020-07-23_20_22', 
      'Nadeo-Game-Distro': 'UPLAY', 
      'Nadeo-Game-Lang': 'en-US', 
      'Nadeo-Game-Name': 'ManiaPlanet', 
      'Nadeo-Game-Version': '3.3.0', 
      'Authorization': `nadeo_v1 t=${level1Token}`,
      'Content-Type': 'application/json', 
      'Accept': 'application/json'
    }
  }

  const result = await axios(config)
    .then(result => users = Array.from(result.data)
    )
    .catch(error => console.log(error));
}

function ComputeScoreDiff(){
  topScore = leaderboard[0].score

  leaderboard.forEach(element => {
    if(element.position != 1){
      scoreDiff = topScore - element.score
      element.scoreDiff = scoreDiff
    }
  })

}

//Convert milliseconds into a formatted string like a race time in Trackmania
function ToRaceTime(score){
  var raceTime = ''

  var milliseconds = parseInt((score % 1000)),
    seconds = Math.floor((score / 1000) % 60),
    minutes = Math.floor((score / (1000 * 60)) % 60),
    hours = Math.floor((score / (1000 * 60 * 60)) % 24);
  
  var milisecondsFormatted = ''
  if(milliseconds != 0){
    var quotient = milliseconds / 10
    if( quotient < 1){
      milisecondsFormatted = `00${milliseconds}`
    } else if(quotient >= 1 && quotient < 10){
      milisecondsFormatted = `0${milliseconds}`
    } else {
      milisecondsFormatted = milliseconds
    }
  } else {
    milisecondsFormatted = "000"
  }

  if(hours != 0){
    raceTime = (hours < 10) ? `0${hours}:` : `${hours}:`;
    raceTime = raceTime.concat((minutes < 10) ? `0${minutes}:`: `${minutes}:`)
    raceTime = raceTime.concat((seconds < 10) ? `0${seconds}.`: `${seconds}.`)
    raceTime = raceTime.concat(milisecondsFormatted)
  } else {
    if(minutes != 0){
      raceTime = raceTime.concat((minutes < 10) ? `0${minutes}:`: `${minutes}:`)
    }

    raceTime = raceTime.concat((seconds < 10) ? `0${seconds}.`: `${seconds}.`)
    raceTime = raceTime.concat(milisecondsFormatted)
  }

  return raceTime;
}

function CleanMapName(mapName){
  var reg = /[0-9A-Fa-f]/;
  var cleanedMapName = mapName.slice()
  var i = 0, j = 0
  while(i < mapName.length) {
    if(mapName.charAt(i) === '$'){
      if(mapName.charAt(i+1) === '$'){
        console.log('dollar')
        cleanedMapName = cleanedMapName.slice(0, j) + cleanedMapName.slice(j+1)
        console.log(cleanedMapName)
        i += 2;
      } else if(reg.test(mapName.charAt(i+1))){
        console.log('hexa')
        cleanedMapName = cleanedMapName.slice(0, j) + cleanedMapName.slice(j+4)
        console.log(cleanedMapName)
        i += 4;
      } else {
        console.log('autre')
        cleanedMapName = cleanedMapName.slice(0, j) + cleanedMapName.slice(j+2)
        console.log(cleanedMapName)
        i += 2;
      }
    } else {
      i++
    }
    j = i - (mapName.length - cleanedMapName.length)
  }

  return cleanedMapName
}

async function Run(){
  await GetTokens()
  await GetNameOfMap()
  await GetTopLeaderboardOfMap_Club()
  await GetUsersInfo(accountIds)

  //Put usernames to users in the leaderboard
  leaderboard.forEach(element => {
    users.forEach(user => {
      if(user.accountId == element.accountId) element.username = user.displayName
    })
  })
}

